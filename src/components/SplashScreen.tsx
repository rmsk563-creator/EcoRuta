import { useEffect, useState } from 'react';
import { Brand } from './Brand';
import { usePreferences } from '../state/PreferencesContext';

const SPLASH_KEY = 'ecoruta.splash.seen';

export function SplashScreen() {
  const { preferences } = usePreferences();
  const [visible, setVisible] = useState(() => sessionStorage.getItem(SPLASH_KEY) !== 'true');
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const duration = preferences.reduceMotion ? 160 : 1540;
    const leaveTimer = window.setTimeout(() => setLeaving(true), duration);
    const removeTimer = window.setTimeout(() => {
      sessionStorage.setItem(SPLASH_KEY, 'true');
      setVisible(false);
    }, duration + (preferences.reduceMotion ? 30 : 300));
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, [preferences.reduceMotion, visible]);

  if (!visible) return null;

  return (
    <div className={`splash${leaving ? ' is-leaving' : ''}`} aria-hidden="true">
      <span className="splash__halo" />
      <div className="splash__content">
        <Brand />
        <div className="splash__route">
          <svg viewBox="0 0 220 42" role="presentation">
            <path d="M7 29C35 29 35 9 64 9s29 24 58 24 31-23 59-23c15 0 23 6 32 13" />
            <circle cx="7" cy="29" r="4" />
            <circle cx="213" cy="23" r="4" />
          </svg>
        </div>
        <div className="splash__copy">
          <p>Muévete mejor.</p>
          <span>Rutas sostenibles para Lima</span>
        </div>
      </div>
    </div>
  );
}
