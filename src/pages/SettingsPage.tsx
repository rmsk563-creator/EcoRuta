import { ArrowRight, Bike, Check, Database, Download, Footprints, Moon, RotateCcw, ShieldCheck, Smartphone, Sun, Trash2, Upload, UserRound } from 'lucide-react';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { EcoRutaDataExport, ImportStrategy } from '../data/types';
import { parseDataExportText } from '../data/validation';
import { exportEcoRutaData } from '../services/platform/dataTransfer';
import { useEcoRutaData } from '../state/DataContext';
import { usePreferences, type DistanceUnitPreference, type PreferredMode, type ThemePreference } from '../state/PreferencesContext';

const themeOptions: Array<{ value: ThemePreference; label: string; icon: typeof Sun }> = [
  { value: 'system', label: 'Automático', icon: Smartphone },
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
];

type DeleteAction = 'favorites' | 'trips' | 'all' | null;

export function SettingsPage() {
  const { preferences, ready, updatePreferences, resetPreferences } = usePreferences();
  const data = useEcoRutaData();
  const [alias, setAlias] = useState(preferences.alias);
  const [confirmReset, setConfirmReset] = useState(false);
  const [deleteAction, setDeleteAction] = useState<DeleteAction>(null);
  const [pendingImport, setPendingImport] = useState<EcoRutaDataExport | null>(null);
  const [importStrategy, setImportStrategy] = useState<ImportStrategy>('merge');
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    setAlias(preferences.alias);
  }, [preferences.alias]);

  const notify = (message: string) => {
    setSavedMessage(message);
    window.setTimeout(() => setSavedMessage(''), 2600);
  };

  const save = async (patch: Parameters<typeof updatePreferences>[0], message: string) => {
    await updatePreferences(patch);
    notify(message);
  };

  const saveAlias = async (event: FormEvent) => {
    event.preventDefault();
    await save({ alias: alias.trim().slice(0, 60) }, alias.trim() ? 'Alias guardado.' : 'Alias eliminado.');
  };

  const handleReset = async () => {
    await resetPreferences();
    setAlias('');
    setConfirmReset(false);
    notify('Configuración restablecida. Tus favoritos e historial no se modificaron.');
  };

  const executeDelete = async () => {
    if (deleteAction === 'favorites') await data.clearFavorites();
    if (deleteAction === 'trips') await data.clearTrips();
    if (deleteAction === 'all') await data.clearAll();
    const label = deleteAction === 'favorites' ? 'Favoritos eliminados.' : deleteAction === 'trips' ? 'Historial eliminado.' : 'Favoritos e historial eliminados.';
    setDeleteAction(null);
    notify(label);
  };

  const exportData = async () => {
    try {
      await exportEcoRutaData(await data.exportData());
      notify('Exportación creada. Guárdala en un lugar seguro.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo exportar la copia JSON.');
    }
  };

  const selectImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      setPendingImport(parseDataExportText(await file.text()));
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo validar el archivo.');
    }
  };

  const executeImport = async () => {
    if (!pendingImport) return;
    const summary = await data.importData(pendingImport, importStrategy);
    setPendingImport(null);
    notify(`Importación completada: ${summary.favorites} favoritos y ${summary.trips} recorridos.`);
  };

  return (
    <div className="page settings-page">
      <header className="page-header page-header--compact">
        <p className="eyebrow">Ajustes</p>
        <h1>Una experiencia a tu medida.</h1>
        <p>Las preferencias y tu actividad permanecen en este dispositivo. Puedes exportarlas o eliminarlas cuando quieras.</p>
      </header>

      <div className="settings-layout" aria-busy={!ready || !data.ready}>
        <section className="settings-card settings-card--account" aria-labelledby="account-settings-title">
          <div className="settings-card__heading"><div><p className="kicker">Cuenta</p><h2 id="account-settings-title">EcoRuta funciona sin iniciar sesión</h2><p>Tus favoritos, historial y preferencias continúan guardados localmente. No hay una sesión activa ni datos enviados a un servicio de usuarios.</p></div><UserRound aria-hidden="true" /></div>
          <div className="account-settings-status"><span aria-hidden="true" /><div><strong>Sin sesión</strong><small>Autenticación pendiente de proveedor</small></div></div>
          <Link className="button button--quiet" to="/account">Ver experiencia de acceso <ArrowRight aria-hidden="true" /></Link>
        </section>
        <section className="settings-card" aria-labelledby="profile-title">
          <div className="settings-card__heading"><div><p className="kicker">Personalización</p><h2 id="profile-title">Tu forma de moverte</h2></div></div>
          <form className="field-form" onSubmit={(event) => void saveAlias(event)}>
            <label htmlFor="alias">Nombre o alias opcional</label>
            <div><input id="alias" maxLength={60} value={alias} onChange={(event) => setAlias(event.target.value)} placeholder="¿Cómo quieres que te llamemos?" /><button type="submit" className="button button--primary button--small">Guardar</button></div>
          </form>
          <fieldset className="option-fieldset"><legend>Modalidad preferida</legend><div className="choice-list choice-list--compact">{([
            { value: 'walk', label: 'Caminar', icon: Footprints },
            { value: 'bicycle', label: 'Bicicleta', icon: Bike },
          ] as const).map(({ value, label, icon: Icon }) => <button key={value} type="button" role="radio" aria-checked={preferences.preferredMode === value} className={`choice-card${preferences.preferredMode === value ? ' is-selected' : ''}`} onClick={() => void save({ preferredMode: value as PreferredMode }, `Modalidad ${label.toLowerCase()} guardada.`)}><span className="choice-card__icon"><Icon aria-hidden="true" /></span><span className="choice-card__copy"><strong>{label}</strong><small>Se preseleccionará al comparar</small></span>{preferences.preferredMode === value && <Check aria-hidden="true" />}</button>)}</div></fieldset>
          <label className="select-control settings-select"><span>Unidades de distancia</span><select value={preferences.distanceUnit} onChange={(event) => void save({ distanceUnit: event.target.value as DistanceUnitPreference }, 'Unidades guardadas.')}><option value="adaptive">Metros y kilómetros</option><option value="kilometers">Siempre kilómetros</option></select></label>
        </section>

        <section className="settings-card" aria-labelledby="appearance-title">
          <div className="settings-card__heading"><div><p className="kicker">Apariencia</p><h2 id="appearance-title">Tema de la interfaz</h2></div></div>
          <div className="segmented-control" role="radiogroup" aria-label="Tema">
            {themeOptions.map(({ value, label, icon: Icon }) => {
              const selected = preferences.theme === value;
              return <button type="button" role="radio" aria-checked={selected} className={selected ? 'is-selected' : ''} onClick={() => void save({ theme: value }, `Tema ${label.toLowerCase()} guardado.`)} key={value}><Icon aria-hidden="true" /><span>{label}</span>{selected && <Check className="segmented-control__check" aria-hidden="true" />}</button>;
            })}
          </div>
          <label className="setting-row" htmlFor="reduce-motion"><span><strong>Reducir movimiento</strong><small>Limita transiciones y entradas visuales.</small></span><span className="switch"><input id="reduce-motion" type="checkbox" checked={preferences.reduceMotion} onChange={(event) => void save({ reduceMotion: event.target.checked }, 'Preferencia de movimiento guardada.')} /><span aria-hidden="true" /></span></label>
        </section>

        <section className="settings-card" aria-labelledby="privacy-title">
          <div className="settings-card__heading"><div><p className="kicker">Privacidad</p><h2 id="privacy-title">Datos bajo tu control</h2><p>Favoritos e historial se guardan en {data.engine === 'sqlite' ? 'SQLite dentro de la aplicación' : 'IndexedDB del navegador'}. No se envían a servidores de EcoRuta.</p></div><ShieldCheck aria-hidden="true" /></div>
          <label className="setting-row" htmlFor="allow-history"><span><strong>Permitir registrar recorridos</strong><small>Cuando está desactivado, el mapa no muestra la acción para añadir actividades al historial.</small></span><span className="switch"><input id="allow-history" type="checkbox" checked={preferences.allowTripStorage} onChange={(event) => void save({ allowTripStorage: event.target.checked }, 'Preferencia de privacidad guardada.')} /><span aria-hidden="true" /></span></label>
          <div className="privacy-explainer"><Database aria-hidden="true" /><p>Geoapify recibe las consultas de búsqueda y las coordenadas necesarias para mapas, geocodificación y rutas. EcoRuta no le envía tu historial completo ni tus favoritos.</p></div>
        </section>

        <section className="settings-card" aria-labelledby="transfer-title">
          <div className="settings-card__heading"><div><p className="kicker">Copia manual</p><h2 id="transfer-title">Exportar e importar</h2><p>La copia JSON incluye favoritos e historial, usa una versión de formato y se valida antes de importar. Las preferencias no se incluyen.</p></div></div>
          <div className="data-action-row"><button type="button" className="button button--quiet" onClick={() => void exportData()} disabled={!data.ready}><Download aria-hidden="true" /> Exportar JSON</button><label className="button button--quiet file-button"><Upload aria-hidden="true" /> Seleccionar JSON<input type="file" accept="application/json,.json" onChange={(event) => void selectImport(event)} /></label></div>
          {pendingImport && <div className="import-confirm" role="group" aria-label="Confirmar importación"><p>Archivo válido: {pendingImport.favorites.length} favoritos y {pendingImport.trips.length} recorridos.</p><label>Modo de importación<select value={importStrategy} onChange={(event) => setImportStrategy(event.target.value as ImportStrategy)}><option value="merge">Combinar sin duplicar</option><option value="replace">Reemplazar datos locales</option></select></label><div><button type="button" className="button button--quiet button--small" onClick={() => setPendingImport(null)}>Cancelar</button><button type="button" className="button button--primary button--small" onClick={() => void executeImport()}>Importar</button></div></div>}
        </section>

        <section className="settings-card settings-card--danger" aria-labelledby="data-title">
          <div className="settings-card__heading"><div><p className="kicker">Datos locales</p><h2 id="data-title">Eliminar información</h2><p>Estas acciones son permanentes. Exporta una copia primero si quieres conservarla.</p></div></div>
          <div className="data-action-row"><button type="button" className="button button--quiet" onClick={() => setDeleteAction('favorites')}><Trash2 aria-hidden="true" /> Eliminar favoritos</button><button type="button" className="button button--quiet" onClick={() => setDeleteAction('trips')}><Trash2 aria-hidden="true" /> Eliminar historial</button><button type="button" className="button button--danger" onClick={() => setDeleteAction('all')}><Trash2 aria-hidden="true" /> Eliminar toda la actividad</button></div>
          {deleteAction && <div className="inline-confirm" role="group" aria-label="Confirmar eliminación de datos"><p>¿Confirmas esta eliminación? No existe recuperación automática.</p><div><button type="button" className="button button--quiet" onClick={() => setDeleteAction(null)}>Cancelar</button><button type="button" className="button button--danger" onClick={() => void executeDelete()}>Eliminar</button></div></div>}
          <div className="settings-separator" />
          {confirmReset ? <div className="inline-confirm" role="group" aria-label="Confirmar restablecimiento"><p>¿Restablecer alias, apariencia, modalidad, unidades y privacidad?</p><div><button type="button" className="button button--quiet" onClick={() => setConfirmReset(false)}>Cancelar</button><button type="button" className="button button--danger" onClick={() => void handleReset()}>Restablecer</button></div></div> : <button type="button" className="button button--quiet reset-button" onClick={() => setConfirmReset(true)}><RotateCcw aria-hidden="true" /> Restablecer configuración</button>}
        </section>
      </div>
      <p className="save-status" role="status" aria-live="polite">{data.error || savedMessage}</p>
    </div>
  );
}
