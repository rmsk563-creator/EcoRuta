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
    const duration = preferences.reduceMotion ? 120 : 900;
    const leaveTimer = window.setTimeout(() => setLeaving(true), duration);
    const removeTimer = window.setTimeout(() => {
      sessionStorage.setItem(SPLASH_KEY, 'true');
      setVisible(false);
    }, duration + (preferences.reduceMotion ? 20 : 260));
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, [preferences.reduceMotion, visible]);

  if (!visible) return null;

  return (
    <div className={`splash${leaving ? ' is-leaving' : ''}`} aria-hidden="true">
      <div className="splash__content">
        <Brand />
        <p>Muévete mejor.</p>
      </div>
    </div>
  );
}

