import { Check, Moon, RotateCcw, Smartphone, Sun } from 'lucide-react';
import { useState } from 'react';
import { usePreferences, type ThemePreference } from '../state/PreferencesContext';

const themeOptions: Array<{ value: ThemePreference; label: string; icon: typeof Sun }> = [
  { value: 'system', label: 'Automático', icon: Smartphone },
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
];

export function SettingsPage() {
  const { preferences, ready, updatePreferences, resetPreferences } = usePreferences();
  const [confirmReset, setConfirmReset] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const save = async (patch: Parameters<typeof updatePreferences>[0], message: string) => {
    await updatePreferences(patch);
    setSavedMessage(message);
    window.setTimeout(() => setSavedMessage(''), 1800);
  };

  const handleReset = async () => {
    await resetPreferences();
    setConfirmReset(false);
    setSavedMessage('Configuración restablecida.');
  };

  return (
    <div className="page settings-page">
      <header className="page-header page-header--compact">
        <p className="eyebrow">Ajustes</p>
        <h1>Una experiencia a tu medida.</h1>
        <p>Estas opciones se guardan localmente y puedes eliminarlas cuando quieras.</p>
      </header>

      <div className="settings-layout" aria-busy={!ready}>
        <section className="settings-card" aria-labelledby="appearance-title">
          <div className="settings-card__heading">
            <div>
              <p className="kicker">Apariencia</p>
              <h2 id="appearance-title">Tema de la interfaz</h2>
            </div>
          </div>
          <div className="segmented-control" role="radiogroup" aria-label="Tema">
            {themeOptions.map(({ value, label, icon: Icon }) => {
              const selected = preferences.theme === value;
              return (
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={selected ? 'is-selected' : ''}
                  onClick={() => void save({ theme: value }, `Tema ${label.toLowerCase()} guardado.`)}
                  key={value}
                >
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                  {selected && <Check className="segmented-control__check" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <label className="setting-row" htmlFor="reduce-motion">
            <span>
              <strong>Reducir movimiento</strong>
              <small>Limita transiciones y entradas visuales.</small>
            </span>
            <span className="switch">
              <input
                id="reduce-motion"
                type="checkbox"
                checked={preferences.reduceMotion}
                onChange={(event) => void save({ reduceMotion: event.target.checked }, 'Preferencia de movimiento guardada.')}
              />
              <span aria-hidden="true" />
            </span>
          </label>
        </section>

        <section className="settings-card settings-card--danger" aria-labelledby="data-title">
          <div className="settings-card__heading">
            <div>
              <p className="kicker">Datos locales</p>
              <h2 id="data-title">Control de configuración</h2>
              <p>Elimina el tema, movimiento y modalidades guardadas en este dispositivo.</p>
            </div>
          </div>
          {confirmReset ? (
            <div className="inline-confirm" role="group" aria-label="Confirmar restablecimiento">
              <p>¿Restablecer la configuración de EcoRuta?</p>
              <div>
                <button type="button" className="button button--quiet" onClick={() => setConfirmReset(false)}>Cancelar</button>
                <button type="button" className="button button--danger" onClick={() => void handleReset()}>Restablecer</button>
              </div>
            </div>
          ) : (
            <button type="button" className="button button--quiet reset-button" onClick={() => setConfirmReset(true)}>
              <RotateCcw aria-hidden="true" /> Restablecer configuración
            </button>
          )}
        </section>
      </div>

      <p className="save-status" role="status" aria-live="polite">{savedMessage}</p>
    </div>
  );
}

