import { VideoLibrary, Cloud, GitHub, OpenInNew } from '@mui/icons-material';
import { DiscordIcon } from './dateHelpers';

export const LINK_TIPO = {
  YOUTUBE: 'youtube',
  DRIVE: 'drive',
  GITHUB: 'github',
  DISCORD: 'discord',
  DROPBOX: 'dropbox',
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const getLinkIcon = (tipoLink) => {
  switch (tipoLink) {
    case LINK_TIPO.YOUTUBE:
      return <VideoLibrary sx={{ color: '#FF0000' }} />;
    case LINK_TIPO.DRIVE:
      return <Cloud sx={{ color: '#4285F4' }} />;
    case LINK_TIPO.GITHUB:
      return <GitHub sx={{ color: '#333' }} />;
    case LINK_TIPO.DISCORD:
      return <DiscordIcon />;
    case LINK_TIPO.DROPBOX:
      return <Cloud sx={{ color: '#0061FF' }} />;
    default:
      return <OpenInNew sx={{ color: '#1976d2' }} />;
  }
};

export const isDiscordLink = (url) => {
  return url && url.includes('discord');
};

export const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const MAX_FILE_SIZE = 25 * 1024 * 1024;

export const validateMagicBytes = async (file) => {
  return new Promise((resolve) => {
    const allowedTypes = {
      pdf: [0x25, 0x50, 0x44, 0x46],
      doc: [0xd0, 0xcf],
      docx: [0x50, 0x4b, 0x03, 0x04],
      ppt: [0xd0, 0xcf],
      pptx: [0x50, 0x4b, 0x03, 0x04],
      xls: [0xd0, 0xcf],
      xlsx: [0x50, 0x4b, 0x03, 0x04],
      jpg: [0xff, 0xd8, 0xff],
      jpeg: [0xff, 0xd8, 0xff],
      png: [0x89, 0x50, 0x4e, 0x47],
      zip: [0x50, 0x4b, 0x03, 0x04],
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target.result).slice(0, 4);
      const header = Array.from(arr);

      for (const [ext, magic] of Object.entries(allowedTypes)) {
        if (magic.every((byte, i) => header[i] === byte)) {
          resolve({ valid: true });
          return;
        }
      }

      resolve({ valid: false, error: 'Tipo de archivo no permitido' });
    };

    reader.onerror = () => {
      resolve({ valid: false, error: 'Error al leer el archivo' });
    };

    reader.readAsArrayBuffer(file.slice(0, 4));
  });
};

export const SORT_OPTIONS = {
  FECHA_DESC: 'fecha_desc',
  FECHA_ASC: 'fecha_asc',
  RATING_DESC: 'rating_desc',
  RATING_ASC: 'rating_asc',
};

export const parseDiscordInvite = (url) => {
  if (!isDiscordLink(url)) return null;
  const parts = url.split('/');
  const inviteCode = parts[parts.length - 1];
  return {
    servidor: 'Servidor de Estudio',
    canal: 'General',
    inviteCode,
  };
};