import { GeoapifyError } from './errors';

const MIN_REQUEST_INTERVAL_MS = 260;
const SESSION_REQUEST_LIMIT = 240;
const STORAGE_KEY = 'ecoruta.geoapify.requests';

function readSessionCount() {
  const value = Number.parseInt(sessionStorage.getItem(STORAGE_KEY) ?? '0', 10);
  return Number.isFinite(value) ? value : 0;
}

function wait(milliseconds: number, signal?: AbortSignal) {
  if (milliseconds <= 0) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, milliseconds);
    signal?.addEventListener('abort', () => {
      window.clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  });
}

class GeoapifyRequestManager {
  private nextSlot = 0;
  private sessionCount = readSessionCount();

  async acquire(signal?: AbortSignal) {
    if (this.sessionCount >= SESSION_REQUEST_LIMIT) {
      throw new GeoapifyError(
        'rate_limit',
        'Se alcanzó el límite de seguridad de esta sesión. Recarga EcoRuta para continuar con un uso controlado.',
      );
    }

    const now = Date.now();
    const slot = Math.max(now, this.nextSlot);
    this.nextSlot = slot + MIN_REQUEST_INTERVAL_MS;
    this.sessionCount += 1;
    sessionStorage.setItem(STORAGE_KEY, String(this.sessionCount));
    await wait(slot - now, signal);
  }
}

export const geoapifyRequestManager = new GeoapifyRequestManager();
