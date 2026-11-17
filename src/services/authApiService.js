/**
 * LAZO V2 — Academic Authentication API Service
 * Gestión de sesión, autenticación de evaluadores y cookies firmadas HMAC
 */

export async function loginReviewerApi(passkey, reviewerName) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ passkey, reviewerName })
  });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || data.error || 'Clave de acceso no válida');
    error.status = res.status;
    error.code = data.code;
    throw error;
  }
  return data;
}

export async function fetchSessionApi() {
  try {
    const res = await fetch('/api/auth/session', {
      credentials: 'include'
    });
    if (!res.ok) return { authenticated: false };
    return await res.json();
  } catch (err) {
    console.warn('[authApiService] No se pudo verificar sesión previa:', err);
    return { authenticated: false };
  }
}

export async function logoutReviewerApi() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (err) {
    console.warn('[authApiService] Error al cerrar sesión en el servidor:', err);
  }
}
