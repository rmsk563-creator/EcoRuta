export function getAuthErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';

  switch (code) {
    case 'auth/invalid-email':
      return 'Revisa el formato del correo electrónico.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/email-already-in-use':
      return 'No se pudo completar el acceso con esos datos. Revisa la información o recupera tu contraseña.';
    case 'auth/weak-password':
    case 'auth/password-does-not-meet-requirements':
      return 'La contraseña no cumple la política de seguridad configurada.';
    case 'auth/user-disabled':
      return 'Esta cuenta no está disponible. Contacta al responsable de EcoRuta.';
    case 'auth/too-many-requests':
      return 'Se hicieron demasiados intentos. Espera unos minutos antes de volver a probar.';
    case 'auth/requires-recent-login':
      return 'Vuelve a iniciar sesión para completar esta operación de seguridad.';
    case 'auth/network-request-failed':
      return 'No se pudo conectar con Firebase. Revisa tu conexión e inténtalo nuevamente.';
    case 'auth/operation-not-allowed':
      return 'El acceso con correo y contraseña todavía no está habilitado en Firebase.';
    case 'auth/configuration-not-found':
    case 'auth/invalid-api-key':
      return 'La configuración de Firebase no es válida. Revisa las variables del proyecto.';
    default:
      return 'No se pudo completar la operación. Inténtalo nuevamente.';
  }
}
