import { ArrowLeft, ArrowRight, Check, KeyRound, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Brand } from '../components/Brand';

function AccountFrame({ children, title, lead }: { children: ReactNode; title: string; lead: string }) {
  return (
    <div className="page account-page">
      <section className="account-shell" aria-labelledby="account-title">
        <div className="account-visual" aria-hidden="true">
          <span className="account-visual__route account-visual__route--one" />
          <span className="account-visual__route account-visual__route--two" />
          <div className="account-visual__brand"><Brand /></div>
          <div className="account-visual__message">
            <p>Tu movilidad, a tu ritmo.</p>
            <span>Camina, pedalea y conserva el control de tus datos.</span>
          </div>
        </div>
        <div className="account-content">
          <div className="account-content__brand"><Brand /></div>
          <div className="account-status"><ShieldCheck aria-hidden="true" /> Diseño preparado · conexión pendiente</div>
          <div className="account-heading">
            <h1 id="account-title">{title}</h1>
            <p>{lead}</p>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}

function PendingSubmit({ label }: { label: string }) {
  return <button className="button button--primary account-submit" type="submit" disabled>{label}<ArrowRight aria-hidden="true" /></button>;
}

function PendingNotice() {
  return <p className="account-pending"><LockKeyhole aria-hidden="true" /> La cuenta se habilitará después de elegir y conectar un proveedor de autenticación seguro.</p>;
}

export function AccountWelcomePage() {
  return (
    <AccountFrame title="Bienvenido a EcoRuta." lead="La aplicación sigue disponible sin cuenta. El acceso personal se activará únicamente cuando elijas el proveedor.">
      <div className="account-benefits" aria-label="Beneficios previstos de una cuenta">
        <p><Check aria-hidden="true" /><span><strong>Continuidad entre dispositivos</strong><small>Preparado para una futura sincronización autorizada.</small></span></p>
        <p><Check aria-hidden="true" /><span><strong>Recuperación segura</strong><small>Acceso y recuperación gestionados por el proveedor elegido.</small></span></p>
      </div>
      <div className="account-actions">
        <Link className="button button--primary" to="/account/sign-in">Iniciar sesión <ArrowRight aria-hidden="true" /></Link>
        <Link className="button button--quiet" to="/account/register">Crear cuenta</Link>
        <Link className="account-skip" to="/">Continuar sin cuenta</Link>
      </div>
      <PendingNotice />
    </AccountFrame>
  );
}

function AuthField({ id, label, type = 'text', icon, autoComplete }: { id: string; label: string; type?: string; icon: ReactNode; autoComplete: string }) {
  return <label className="auth-field" htmlFor={id}><span>{label}</span><div>{icon}<input id={id} type={type} autoComplete={autoComplete} placeholder={label} /></div></label>;
}

export function SignInPage() {
  const preventPendingSubmit = (event: FormEvent) => event.preventDefault();
  return (
    <AccountFrame title="Qué bueno verte." lead="La interfaz está lista, pero todavía no envía credenciales ni crea sesiones.">
      <form className="auth-form" onSubmit={preventPendingSubmit}>
        <AuthField id="sign-in-email" label="Correo electrónico" type="email" autoComplete="email" icon={<Mail aria-hidden="true" />} />
        <AuthField id="sign-in-password" label="Contraseña" type="password" autoComplete="current-password" icon={<KeyRound aria-hidden="true" />} />
        <Link className="auth-assist" to="/account/recover">¿Olvidaste tu contraseña?</Link>
        <PendingSubmit label="Iniciar sesión" />
      </form>
      <p className="account-switch">¿Aún no tienes cuenta? <Link to="/account/register">Crear cuenta</Link></p>
      <Link className="account-back" to="/account"><ArrowLeft aria-hidden="true" /> Volver</Link>
      <PendingNotice />
    </AccountFrame>
  );
}

export function RegisterPage() {
  const preventPendingSubmit = (event: FormEvent) => event.preventDefault();
  return (
    <AccountFrame title="Crea tu espacio." lead="Estos campos muestran la experiencia prevista. Ningún dato se guarda ni se transmite todavía.">
      <form className="auth-form" onSubmit={preventPendingSubmit}>
        <AuthField id="register-name" label="Nombre" autoComplete="name" icon={<UserRound aria-hidden="true" />} />
        <AuthField id="register-email" label="Correo electrónico" type="email" autoComplete="email" icon={<Mail aria-hidden="true" />} />
        <AuthField id="register-password" label="Contraseña" type="password" autoComplete="new-password" icon={<KeyRound aria-hidden="true" />} />
        <PendingSubmit label="Crear cuenta" />
      </form>
      <p className="account-switch">¿Ya tienes cuenta? <Link to="/account/sign-in">Iniciar sesión</Link></p>
      <Link className="account-back" to="/account"><ArrowLeft aria-hidden="true" /> Volver</Link>
      <PendingNotice />
    </AccountFrame>
  );
}

export function RecoverAccountPage() {
  const preventPendingSubmit = (event: FormEvent) => event.preventDefault();
  return (
    <AccountFrame title="Recupera tu acceso." lead="El flujo de recuperación se conectará al proveedor elegido para evitar soluciones inseguras o simuladas.">
      <form className="auth-form" onSubmit={preventPendingSubmit}>
        <AuthField id="recover-email" label="Correo electrónico" type="email" autoComplete="email" icon={<Mail aria-hidden="true" />} />
        <PendingSubmit label="Enviar enlace seguro" />
      </form>
      <Link className="account-back" to="/account/sign-in"><ArrowLeft aria-hidden="true" /> Volver a iniciar sesión</Link>
      <PendingNotice />
    </AccountFrame>
  );
}
