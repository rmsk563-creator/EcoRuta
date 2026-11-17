import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import type { EcoRutaDataExport } from '../../data/types';

function exportFileName(date = new Date()) {
  return `ecoruta-datos-${date.toISOString().slice(0, 10)}.json`;
}

function downloadOnWeb(contents: string, fileName: string) {
  const blob = new Blob([contents], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportEcoRutaData(data: EcoRutaDataExport, date = new Date()) {
  const contents = JSON.stringify(data, null, 2);
  const fileName = exportFileName(date);

  if (!Capacitor.isNativePlatform()) {
    downloadOnWeb(contents, fileName);
    return;
  }

  const canShare = await Share.canShare();
  if (!canShare.value) throw new Error('Este dispositivo no permite compartir la copia JSON.');

  const file = await Filesystem.writeFile({
    path: fileName,
    data: contents,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  });

  try {
    await Share.share({
      title: 'Copia de datos de EcoRuta',
      text: 'Favoritos e historial exportados desde EcoRuta.',
      files: [file.uri],
      dialogTitle: 'Guardar o compartir copia JSON',
    });
  } finally {
    await Filesystem.deleteFile({ path: fileName, directory: Directory.Cache }).catch(() => undefined);
  }
}
