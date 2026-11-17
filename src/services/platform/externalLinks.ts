import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

export function isAllowedExternalUrl(value: string) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export async function openExternalUrl(url: string) {
  if (!isAllowedExternalUrl(url)) throw new Error('EcoRuta solo abre enlaces externos seguros.');

  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url, presentationStyle: 'fullscreen' });
    return;
  }

  const popup = window.open(url, '_blank', 'noopener,noreferrer');
  if (!popup) throw new Error('El navegador bloqueó la apertura del enlace.');
}
