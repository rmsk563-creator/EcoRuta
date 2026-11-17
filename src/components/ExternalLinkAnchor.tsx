import { useState, type AnchorHTMLAttributes, type MouseEvent } from 'react';
import { Capacitor } from '@capacitor/core';
import { openExternalUrl } from '../services/platform/externalLinks';

type ExternalLinkAnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string;
};

export function ExternalLinkAnchor({ href, onClick, children, ...props }: ExternalLinkAnchorProps) {
  const [error, setError] = useState('');

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || !Capacitor.isNativePlatform()) return;
    event.preventDefault();
    setError('');
    void openExternalUrl(href).catch(() => setError('No se pudo abrir el enlace.'));
  };

  return (
    <>
      <a href={href} target="_blank" rel="noreferrer" onClick={handleClick} {...props}>{children}</a>
      {error && <span className="visually-hidden" role="status">{error}</span>}
    </>
  );
}
