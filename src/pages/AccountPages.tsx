import { ArrowLeft, ArrowRight, Check, KeyRound, LoaderCircle, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { getAuthErrorMessage } from '../services/auth/errors';
import { useAuth } from '../state/AuthContext';

function AccountFrame({ children, title, lead }: { children: ReactNode; title: string; lead: string }) {
  const { configured, ready, user } = useAuth();
  const status = !ready ? 'Comprobando sesión segura…' : user ? 'Sesión segura activa' : configured ? 'Acceso seguro con Firebase' : 'Acceso sin cuenta';

  return (
    <div className="page account-page">
      <section className="account-shell" aria-labelledby="account-title">
        <div className="account-visual" aria-hidden="true">
          <span className="account-visual__route account-visual__route--one" />
          <span className="account-visual__route account-visual__route--two" />
          <div className="account-visual__brand"><Brand /></div>
          <div className="account-visual__message"><p>Tu movilidad, a tu ritmo.</p><span>Camina, pedalea y conserva el control de tus datos.</span></div>
        </div>
        <div className="account-content">
          <div className="account-content__brand"><Brand /></div>
          <div className="account-status"><ShieldCheck aria-hidden="true" /> {status}</div>
          <div className="account-heading"><h1 id="account-title">{title}</h1><p>{lead}</p></div>
          {children}
        </div>
      </section>
    </div>
  );
}

function AuthAvailabilityNotice() {
  const { configured, initializationError } = useAuth();
  if (initializationError) return <p className="account-pending account-pending--error" role="alert"><LockKeyhole aria-hidden="true" /> {initializationError}</p>;
  if (configured) return <p className="account-pending"><LockKeyhole aria-hidden="true" /> Firebase gestiona la contraseña. Favoritos, historial y estadísticas permanecen únicamente en este dispositivo.</p>;
  return <div className="account-setup" role="status"><LockKeyhole aria-hidden="true" /><p><strong>Acceso con cuenta no disponible.</strong><span>Puedes usar el mapa, las rutas y la actividad local sin iniciar sesión.</span></p></div>;
}

function SubmitButton({ label, loading, disabled }: { label: string; loading: boolean; disabled: boolean }) {
  return <button className="button button--primary account-submit" type="submit" disabled={disabled}>{loading ? <LoaderCircle className="spin" aria-hidden="true" /> : null}{loading ? 'Procesando…' : label}{!loading && <ArrowRight aria-hidden="true" />}</button>;
}

function Feedback({ error, success }: { error: string; success?: string }) {
  if (error) return <p className="auth-feedback auth-feedback--error" role="alert">{error}</p>;
  if (success) return <p className="auth-feedback auth-feedback--success" role="status">{success}</p>;
  return null;
}

export function AccountWelcomePage() {
  const { configured, user } = useAuth();
  return (
    <AccountFrame title={user ? `Hola${user.displayName ? `, ${user.displayName}` : ''}.` : 'Bienvenido a EcoRuta.'} lead={user ? 'Tu sesión está activa. La actividad de movilidad continúa guardándose solo en este dispositivo.' : configured ? 'Identifícate con tu cuenta o continúa usando todas las funciones sin iniciar sesión.' : 'Usa mapas, rutas y actividad local sin iniciar sesión.'}>
      <div className="account-benefits" aria-label="Características de la cuenta">
        <p><Check aria-hidden="true" /><span><strong>Acceso opcional</strong><small>Mapa, rutas y actividad local siguen disponibles sin cuenta.</small></span></p>
        {configured ? <p><Check aria-hidden="true" /><span><strong>Recuperación segura</strong><small>Firebase gestiona credenciales y recuperación; EcoRuta no guarda contraseñas.</small></span></p> : <p><Check aria-hidden="true" /><span><strong>Datos locales</strong><small>Favoritos, historial y estadísticas permanecen en este dispositivo.</small></span></p>}
      </div>
      <div className="account-actions">
        {user ? <Link className="button button--primary" to="/profile">Ver perfil <ArrowRight aria-hidden="true" /></Link> : configured ? <><Link className="button button--primary" to="/account/sign-in">Iniciar sesión <ArrowRight aria-hidden="true" /></Link><Link className="button button--quiet" to="/account/register">Crear cuenta</Link></> : null}
        <Link className="account-skip" to="/">Continuar al mapa</Link>
      </div>
      <AuthAvailabilityNotice />
    </AccountFrame>
  );
}

function AuthField({ id, label, type = 'text', value, onChange, autoComplete }: { id: string; label: string; type?: string; value: string; onChange: (value: string) => void; autoComplete: string }) {
  const Icon = type === 'email' ? Mail : type === 'password' ? KeyRound : UserRound;
  return <label className="auth-field" htmlFor={id}><span>{label}</span><div><Icon aria-hidden="true" /><input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} placeholder={label} required={type !== 'text'} autoCapitalize={type === 'email' ? 'none' : undefined} autoCorrect={type === 'email' ? 'off' : undefined} spellCheck={type === 'email' ? false : undefined} /></div></label>;
}

export function SignInPage() {
  const { configured, ready, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!configured || submitting.current) return;
    submitting.current = true;
    setError(''); setLoading(true);
    try {
      const signedInUser = await signIn(email.trim(), password);
      navigate(signedInUser.emailVerified ? '/' : '/account/verify', { replace: true });
    }
    catch (caught) { setError(getAuthErrorMessage(caught)); }
    finally { submitting.current = false; setLoading(false); }
  };
  return (
    <AccountFrame title="Qué bueno verte." lead="Inicia sesión con tu correo. Tus recorridos y favoritos no se suben a Firebase.">
      <form className="auth-form" onSubmit={(event) => void submit(event)} aria-busy={loading}>
        <AuthField id="sign-in-email" label="Correo electrónico" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <AuthField id="sign-in-password" label="Contraseña" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
        <Link className="auth-assist" to="/account/recover">¿Olvidaste tu contraseña?</Link>
        <Feedback error={error} />
        <SubmitButton label="Iniciar sesión" loading={loading} disabled={!configured || !ready || loading || !email.trim() || !password} />
      </form>
      <p className="account-switch">¿Aún no tienes cuenta? <Link to="/account/register">Crear cuenta</Link></p>
      <Link className="account-back" to="/account"><ArrowLeft aria-hidden="true" /> Volver</Link>
      <AuthAvailabilityNotice />
    </AccountFrame>
  );
}

export function RegisterPage() {
  const { configured, ready, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!configured || submitting.current) return;
    if (password.length < 8) { setError('Usa al menos 8 caracteres para la contraseña.'); return; }
    if (password !== confirmation) { setError('Las contraseñas no coinciden.'); return; }
    submitting.current = true;
    setError(''); setLoading(true);
    try {
      const result = await register({ email: email.trim(), password, displayName: name.trim() });
      navigate('/account/verify', { replace: true, state: { verificationSent: result.verificationSent } });
    }
    catch (caught) { setError(getAuthErrorMessage(caught)); }
    finally { submitting.current = false; setLoading(false); }
  };
  return (
    <AccountFrame title="Crea tu espacio." lead="Tu contraseña se envía directamente a Firebase mediante una conexión segura y no se guarda en EcoRuta.">
      <form className="auth-form" onSubmit={(event) => void submit(event)} aria-busy={loading}>
        <AuthField id="register-name" label="Nombre opcional" value={name} onChange={setName} autoComplete="name" />
        <AuthField id="register-email" label="Correo electrónico" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <AuthField id="register-password" label="Contraseña (mínimo 8 caracteres)" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
        <AuthField id="register-confirmation" label="Confirmar contraseña" type="password" value={confirmation} onChange={setConfirmation} autoComplete="new-password" />
        <Feedback error={error} />
        <SubmitButton label="Crear cuenta" loading={loading} disabled={!configured || !ready || loading || !email.trim() || !password || !confirmation} />
      </form>
      <p className="account-switch">¿Ya tienes cuenta? <Link to="/account/sign-in">Iniciar sesión</Link></p>
      <Link className="account-back" to="/account"><ArrowLeft aria-hidden="true" /> Volver</Link>
      <AuthAvailabilityNotice />
    </AccountFrame>
  );
}

export function RecoverAccountPage() {
  const { configured, ready, sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const submitting = useRef(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!configured || submitting.current) return;
    submitting.current = true;
    setError(''); setSuccess(''); setLoading(true);
    try { await sendPasswordReset(email.trim()); setSuccess('Si existe una cuenta con ese correo, Firebase enviará las instrucciones de recuperación.'); }
    catch (caught) { setError(getAuthErrorMessage(caught)); }
    finally { submitting.current = false; setLoading(false); }
  };
  return (
    <AccountFrame title="Recupera tu acceso." lead="Recibirás un correo de Firebase para establecer una nueva contraseña.">
      <form className="auth-form" onSubmit={(event) => void submit(event)} aria-busy={loading}>
        <AuthField id="recover-email" label="Correo electrónico" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <Feedback error={error} success={success} />
        <SubmitButton label="Enviar enlace seguro" loading={loading} disabled={!configured || !ready || loading || !email.trim()} />
      </form>
      <Link className="account-back" to="/account/sign-in"><ArrowLeft aria-hidden="true" /> Volver a iniciar sesión</Link>
      <AuthAvailabilityNotice />
    </AccountFrame>
  );
}

export function VerifyEmailPage() {
  const { configured, ready, user, resendEmailVerification, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initialSent = Boolean((location.state as { verificationSent?: boolean } | null)?.verificationSent);
  const [loadingAction, setLoadingAction] = useState<'resend' | 'refresh' | ''>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(initialSent ? 'Te enviamos un correo de verificación. Revisa también la carpeta de spam.' : '');
  const submitting = useRef(false);

  const run = async (action: 'resend' | 'refresh') => {
    if (!configured || !ready || !user || submitting.current) return;
    submitting.current = true;
    setLoadingAction(action);
    setError('');
    setSuccess('');
    try {
      if (action === 'resend') {
        await resendEmailVerification();
        setSuccess('Correo de verificación enviado. Revisa tu bandeja de entrada y spam.');
      } else {
        const refreshedUser = await refreshUser();
        if (refreshedUser?.emailVerified) navigate('/', { replace: true });
        else setError('El correo todavía no aparece verificado. Abre el enlace recibido y vuelve a comprobar.');
      }
    } catch (caught) {
      setError(getAuthErrorMessage(caught));
    } finally {
      submitting.current = false;
      setLoadingAction('');
    }
  };

  return (
    <AccountFrame title="Verifica tu correo." lead="Firebase necesita confirmar que la dirección te pertenece antes de completar la configuración de la cuenta.">
      {user ? (
        <div className="verify-email" aria-busy={Boolean(loadingAction)}>
          <p className="verify-email__address"><Mail aria-hidden="true" /><span><small>Correo de la cuenta</small><strong>{user.email}</strong></span></p>
          {user.emailVerified ? (
            <><Feedback error="" success="Correo verificado correctamente." /><Link className="button button--primary" to="/">Continuar al mapa <ArrowRight aria-hidden="true" /></Link></>
          ) : (
            <>
              <Feedback error={error} success={success} />
              <button className="button button--primary" type="button" onClick={() => void run('refresh')} disabled={Boolean(loadingAction)}>
                {loadingAction === 'refresh' ? <LoaderCircle className="spin" aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}
                {loadingAction === 'refresh' ? 'Comprobando…' : 'Ya verifiqué mi correo'}
              </button>
              <button className="button button--quiet" type="button" onClick={() => void run('resend')} disabled={Boolean(loadingAction)}>
                {loadingAction === 'resend' ? <LoaderCircle className="spin" aria-hidden="true" /> : <Mail aria-hidden="true" />}
                {loadingAction === 'resend' ? 'Enviando…' : 'Reenviar correo'}
              </button>
              <Link className="account-skip" to="/">Continuar al mapa por ahora</Link>
            </>
          )}
        </div>
      ) : ready ? (
        <div className="account-setup" role="status"><LockKeyhole aria-hidden="true" /><p><strong>No hay una sesión activa.</strong><span>Inicia sesión para verificar el correo asociado a tu cuenta.</span></p></div>
      ) : <div className="route-loading" role="status">Comprobando la sesión…</div>}
      {!user && ready ? <Link className="button button--primary" to="/account/sign-in">Iniciar sesión</Link> : null}
      <AuthAvailabilityNotice />
    </AccountFrame>
  );
}
