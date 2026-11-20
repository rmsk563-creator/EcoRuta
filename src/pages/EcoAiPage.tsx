import { Bot, Leaf, LoaderCircle, LockKeyhole, MapPinned, MessageCircleMore, Send, ShieldCheck, Sparkles, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ecoAiApiUrl } from '../config/ecoAi';
import { toStoredPlace } from '../data/factories';
import { sendEcoAiMessage } from '../services/ecoAi/client';
import type { EcoAiAnswer } from '../services/ecoAi/types';
import { searchLimaPlaces } from '../services/geoapify/client';
import { getGeoapifyErrorMessage } from '../services/geoapify/errors';
import { useAuth } from '../state/AuthContext';

const HISTORY_PREFERENCE_KEY = 'ecoruta.eco-ai.local-history';
const HISTORY_KEY = 'ecoruta.eco-ai.messages';
const MAX_LOCAL_MESSAGES = 20;

const suggestions = [
  '¿Qué beneficios tiene caminar para viajes cortos?',
  'Quiero ir al Parque Kennedy caminando',
  '¿Cómo calcula EcoRuta el CO₂ evitado?',
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

function readLocalMessages(enabled: boolean): ChatMessage[] {
  if (!enabled) return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
    if (!Array.isArray(value)) return [];
    return value.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const message = item as Partial<ChatMessage>;
      if ((message.role !== 'user' && message.role !== 'assistant') || typeof message.content !== 'string') return [];
      return [{ id: crypto.randomUUID(), role: message.role, content: message.content.slice(0, 1_200) }];
    }).slice(-MAX_LOCAL_MESSAGES);
  } catch {
    return [];
  }
}

export function EcoAiPage({ apiUrlOverride }: { apiUrlOverride?: string } = {}) {
  const navigate = useNavigate();
  const { user, getIdToken } = useAuth();
  const apiUrl = apiUrlOverride ?? ecoAiApiUrl;
  const initialHistoryPreference = localStorage.getItem(HISTORY_PREFERENCE_KEY) === 'true';
  const [keepHistory, setKeepHistory] = useState(initialHistoryPreference);
  const [messages, setMessages] = useState<ChatMessage[]>(() => readLocalMessages(initialHistoryPreference));
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resolvingDestination, setResolvingDestination] = useState(false);
  const [pendingDestination, setPendingDestination] = useState<string | null>(null);
  const inFlight = useRef(false);
  const activeGeocoding = useRef<AbortController | null>(null);

  const authenticated = Boolean(user?.emailVerified);
  const canChat = Boolean(apiUrl) && authenticated;

  useEffect(() => {
    if (keepHistory) localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-MAX_LOCAL_MESSAGES)));
    else localStorage.removeItem(HISTORY_KEY);
  }, [keepHistory, messages]);

  useEffect(() => () => activeGeocoding.current?.abort(), []);

  const updateHistoryPreference = (enabled: boolean) => {
    setKeepHistory(enabled);
    localStorage.setItem(HISTORY_PREFERENCE_KEY, String(enabled));
    if (!enabled) localStorage.removeItem(HISTORY_KEY);
  };

  const appendMessage = (role: ChatMessage['role'], content: string) => {
    setMessages((current) => [...current, { id: crypto.randomUUID(), role, content }].slice(-MAX_LOCAL_MESSAGES));
  };

  const send = async (message: string) => {
    const trimmed = message.trim();
    if (!canChat || !trimmed || inFlight.current) return;
    inFlight.current = true;
    setSubmitting(true);
    setError('');
    setPendingDestination(null);
    setInput('');
    appendMessage('user', trimmed);
    try {
      const token = await getIdToken();
      const answer: EcoAiAnswer = await sendEcoAiMessage(apiUrl, trimmed, token);
      appendMessage('assistant', answer.reply);
      if (answer.requiresMapConfirmation && answer.destinationQuery) setPendingDestination(answer.destinationQuery);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Eco IA no pudo responder en este momento.');
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void send(input);
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void send(input);
    }
  };

  const openDestination = async () => {
    if (!pendingDestination || resolvingDestination) return;
    activeGeocoding.current?.abort();
    const controller = new AbortController();
    activeGeocoding.current = controller;
    setResolvingDestination(true);
    setError('');
    try {
      const places = await searchLimaPlaces(pendingDestination, controller.signal);
      const destination = places[0];
      if (!destination) {
        setError('No encontramos ese destino dentro de Lima. Prueba indicando el distrito o una referencia más precisa.');
        return;
      }
      navigate('/', { state: { destination: toStoredPlace(destination) } });
    } catch (geocodingError) {
      const message = getGeoapifyErrorMessage(geocodingError);
      if (message) setError(message);
    } finally {
      if (!controller.signal.aborted) setResolvingDestination(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    setPendingDestination(null);
    setError('');
    localStorage.removeItem(HISTORY_KEY);
  };

  const serviceState = !apiUrl
    ? { label: 'Pendiente de despliegue seguro', tone: 'pending' }
    : !user
      ? { label: 'Inicia sesión para conversar', tone: 'pending' }
      : !user.emailVerified
        ? { label: 'Verifica tu correo para conversar', tone: 'pending' }
        : { label: 'Servicio seguro disponible', tone: 'online' };

  return (
    <div className="page eco-ai-page">
      <header className="eco-ai-header">
        <span className="eco-ai-header__icon" aria-hidden="true"><MessageCircleMore /></span>
        <div><p className="eyebrow">Asistente de movilidad</p><h1>Eco IA</h1><p>Orientación sostenible para Lima con privacidad, confirmación humana y rutas reales de Geoapify.</p></div>
      </header>

      <section className="eco-chat" aria-labelledby="eco-chat-title">
        <div className="eco-chat__topbar">
          <div><span className="eco-chat__avatar" aria-hidden="true"><Leaf /></span><div><h2 id="eco-chat-title">Asistente EcoRuta</h2><p className={`is-${serviceState.tone}`}><span aria-hidden="true" /> {serviceState.label}</p></div></div>
          <span className="eco-chat__secure"><LockKeyhole aria-hidden="true" /> Sin historial remoto</span>
        </div>

        <div className={`eco-chat__conversation${messages.length ? ' has-messages' : ''}`} aria-live="polite" aria-busy={submitting}>
          {messages.length === 0 && (
            <div className="eco-chat__empty">
              <span aria-hidden="true"><Bot /></span>
              <h3>{canChat ? '¿Cómo quieres moverte hoy?' : 'Eco IA está protegida'}</h3>
              <p>{!apiUrl
                ? 'La interfaz está lista, pero continuará desactivada hasta aprobar y publicar el Worker de Cloudflare.'
                : !user
                  ? 'Inicia sesión con Firebase para que el backend pueda aplicar límites privados por usuario.'
                  : !user.emailVerified
                    ? 'Confirma tu correo de Firebase antes de utilizar el asistente.'
                    : 'Pregunta sobre movilidad sostenible o indica un destino de Lima. Nunca enviaremos tu GPS, correo ni actividad al modelo.'}</p>
              {!user && apiUrl && <Link className="button button--primary button--small" to="/account/sign-in">Iniciar sesión</Link>}
            </div>
          )}

          {messages.length > 0 && (
            <div className="eco-chat__messages">
              {messages.map((message) => (
                <div className={`eco-chat__message is-${message.role}`} key={message.id}>
                  {message.role === 'assistant' && <span aria-hidden="true"><Leaf /></span>}
                  <p>{message.content}</p>
                </div>
              ))}
              {submitting && <div className="eco-chat__typing" role="status"><LoaderCircle className="spin" aria-hidden="true" /> Eco IA está preparando una respuesta…</div>}
            </div>
          )}

          {pendingDestination && (
            <div className="eco-chat__map-proposal">
              <MapPinned aria-hidden="true" />
              <div><b>¿Buscar este destino con Geoapify?</b><p>{pendingDestination}</p></div>
              <button type="button" className="button button--primary button--small" onClick={() => void openDestination()} disabled={resolvingDestination}>
                {resolvingDestination ? <LoaderCircle className="spin" aria-hidden="true" /> : <MapPinned aria-hidden="true" />} Ver en el mapa
              </button>
              <button type="button" className="eco-chat__dismiss" onClick={() => setPendingDestination(null)} aria-label="Descartar propuesta de destino"><X aria-hidden="true" /></button>
            </div>
          )}

          {error && <div className="eco-chat__error" role="alert">{error}</div>}

          <div className="eco-chat__suggestions" aria-label="Preguntas sugeridas">
            <p><Sparkles aria-hidden="true" /> Puedes preguntar</p>
            {suggestions.map((suggestion) => <button type="button" key={suggestion} disabled={!canChat || submitting} onClick={() => void send(suggestion)}>{suggestion}</button>)}
          </div>
        </div>

        <form className="eco-chat__composer" onSubmit={submit}>
          <textarea
            aria-label="Mensaje para Eco IA"
            placeholder={canChat ? 'Pregunta por movilidad o un destino en Lima' : 'Eco IA requiere conexión y sesión verificada'}
            disabled={!canChat || submitting}
            value={input}
            onChange={(event) => setInput(event.target.value.slice(0, 800))}
            onKeyDown={handleComposerKeyDown}
            rows={1}
          />
          <button type="submit" disabled={!canChat || submitting || !input.trim()} aria-label="Enviar mensaje"><Send aria-hidden="true" /></button>
        </form>
      </section>

      <div className="eco-ai-info-grid">
        <section className="eco-ai-card">
          <span aria-hidden="true"><ShieldCheck /></span>
          <div><p className="kicker">Privacidad local</p><h2>Controla el historial</h2><p>El Worker no almacena conversaciones. Si activas esta opción, los últimos mensajes se guardan únicamente en este dispositivo y nunca se envían como contexto.</p></div>
          <label className="eco-ai-toggle"><input type="checkbox" checked={keepHistory} onChange={(event) => updateHistoryPreference(event.target.checked)} /><span aria-hidden="true" /><b>Guardar historial solo en este dispositivo</b></label>
          <button type="button" className="button button--quiet button--small" disabled={messages.length === 0} onClick={clearHistory}><Trash2 aria-hidden="true" /> {messages.length ? 'Eliminar conversación local' : 'No hay historial que eliminar'}</button>
        </section>

        <section className="eco-ai-card">
          <span aria-hidden="true"><MapPinned /></span>
          <div><p className="kicker">Datos verificables</p><h2>El mapa siempre confirma</h2><p>Eco IA solo propone un texto de destino. Tú decides si Geoapify debe localizarlo; rutas, tiempos, distancias y CO₂ no provienen del modelo.</p></div>
        </section>
      </div>
    </div>
  );
}
