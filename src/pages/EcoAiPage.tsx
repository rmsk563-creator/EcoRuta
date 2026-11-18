import { Bot, Leaf, LockKeyhole, MapPinned, MessageCircleMore, Send, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';

const HISTORY_PREFERENCE_KEY = 'ecoruta.eco-ai.local-history';

const suggestions = [
  '¿Qué ruta sostenible me conviene hoy?',
  'Ayúdame a encontrar un parque cercano',
  'Compara caminar y bicicleta para mi destino',
];

export function EcoAiPage() {
  const [keepHistory, setKeepHistory] = useState(() => localStorage.getItem(HISTORY_PREFERENCE_KEY) === 'true');

  const updateHistoryPreference = (enabled: boolean) => {
    setKeepHistory(enabled);
    localStorage.setItem(HISTORY_PREFERENCE_KEY, String(enabled));
  };

  return (
    <div className="page eco-ai-page">
      <header className="eco-ai-header">
        <span className="eco-ai-header__icon" aria-hidden="true"><MessageCircleMore /></span>
        <div><p className="eyebrow">Asistente de movilidad</p><h1>Eco IA</h1><p>Una interfaz preparada para orientación sostenible, sin exponer credenciales en la aplicación.</p></div>
      </header>

      <section className="eco-chat" aria-labelledby="eco-chat-title">
        <div className="eco-chat__topbar">
          <div><span className="eco-chat__avatar" aria-hidden="true"><Leaf /></span><div><h2 id="eco-chat-title">Asistente EcoRuta</h2><p><span aria-hidden="true" /> Servicio no conectado</p></div></div>
          <span className="eco-chat__secure"><LockKeyhole aria-hidden="true" /> Backend requerido</span>
        </div>

        <div className="eco-chat__conversation" aria-live="polite">
          <div className="eco-chat__empty">
            <span aria-hidden="true"><Bot /></span>
            <h3>La conversación aún no está habilitada</h3>
            <p>EcoRuta no enviará mensajes ni mostrará respuestas generadas hasta disponer de un backend seguro y un proveedor aprobado.</p>
          </div>
          <div className="eco-chat__suggestions" aria-label="Ejemplos de preguntas disponibles al conectar el servicio">
            <p><Sparkles aria-hidden="true" /> Preguntas que podrá resolver</p>
            {suggestions.map((suggestion) => <button type="button" key={suggestion} disabled>{suggestion}</button>)}
          </div>
        </div>

        <div className="eco-chat__composer">
          <textarea aria-label="Mensaje para Eco IA" placeholder="Eco IA requiere una conexión segura" disabled rows={1} />
          <button type="button" disabled aria-label="Enviar mensaje"><Send aria-hidden="true" /></button>
        </div>
      </section>

      <div className="eco-ai-info-grid">
        <section className="eco-ai-card">
          <span aria-hidden="true"><ShieldCheck /></span>
          <div><p className="kicker">Privacidad local</p><h2>Controla el historial</h2><p>Esta preferencia se guarda únicamente en este dispositivo. Todavía no existe contenido de conversación.</p></div>
          <label className="eco-ai-toggle"><input type="checkbox" checked={keepHistory} onChange={(event) => updateHistoryPreference(event.target.checked)} /><span aria-hidden="true" /><b>Guardar historial local al activar Eco IA</b></label>
          <button type="button" className="button button--quiet button--small" disabled><Trash2 aria-hidden="true" /> No hay historial que eliminar</button>
        </section>

        <section className="eco-ai-card">
          <span aria-hidden="true"><MapPinned /></span>
          <div><p className="kicker">Planificador</p><h2>Destinos con consentimiento</h2><p>La arquitectura propuesta permitirá enviar al mapa solo el lugar que el usuario elija explícitamente. Esta acción permanece desactivada hasta conectar el servicio real.</p></div>
        </section>
      </div>
    </div>
  );
}
