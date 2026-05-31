export const MATERIAL_TIPO = {
  FILE: 'file',
  LINK: 'link'
};

export const LINK_TIPO = {
  YOUTUBE: 'youtube',
  DRIVE: 'drive',
  DROPBOX: 'dropbox',
  DISCORD: 'discord',
  GITHUB: 'github',
  WEB: 'web'
};

export const SORT_OPTIONS = {
  FECHA_DESC: 'fecha_desc',
  FECHA_ASC: 'fecha_asc',
  RATING_DESC: 'rating_desc',
  RATING_ASC: 'rating_asc'
};

export const FILEtiposPERMITIDOS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'application/zip',
  'application/x-zip-compressed',
  'application/zip-compressed',
];

export const FILE_EXTENSIONES_PERMITIDAS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip'];

export const MAX_FILE_SIZE = 25 * 1024 * 1024;

export const MAGIC_BYTES = {
  pdf: [0x25, 0x50, 0x44, 0x46],
  doc: [0xD0, 0xCF, 0x11, 0xE0],
  docx: [0x50, 0x4B, 0x03, 0x04],
  ppt: [0xD0, 0xCF, 0x11, 0xE0],
  pptx: [0x50, 0x4B, 0x03, 0x04],
  xls: [0xD0, 0xCF, 0x11, 0xE0],
  xlsx: [0x50, 0x4B, 0x03, 0x04],
  jpg: [0xFF, 0xD8, 0xFF],
  jpeg: [0xFF, 0xD8, 0xFF],
  png: [0x89, 0x50, 0x4E, 0x47],
  zip: [0x50, 0x4B, 0x03, 0x04]
};

export const MAGIC_BYTES_SIGNATURES = Object.entries(MAGIC_BYTES).map(([ext, bytes]) => ({
  ext,
  bytes: new Uint8Array(bytes),
  length: bytes.length
}));

export const validateMagicBytes = async (file) => {
  const ext = file.name.split('.').pop().toLowerCase();
  const signature = MAGIC_BYTES_SIGNATURES.find(s => s.ext === ext);
  
  if (!signature) return { valid: false, error: 'Extensión no permitida' };
  
  const buffer = await file.slice(0, signature.length).arrayBuffer();
  const fileBytes = new Uint8Array(buffer);
  
  for (let i = 0; i < signature.length; i++) {
    if (fileBytes[i] !== signature.bytes[i]) {
      return { valid: false, error: `El archivo no es un ${ext.toUpperCase()} válido` };
    }
  }
  
  return { valid: true };
};

export const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isDiscordLink = (url) => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.includes('discord') && lowerUrl.includes('/invite');
};

export const detectLinkTipo = (url) => {
  if (!url) return LINK_TIPO.WEB;
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return LINK_TIPO.YOUTUBE;
  if (lowerUrl.includes('drive.google.com')) return LINK_TIPO.DRIVE;
  if (lowerUrl.includes('dropbox.com')) return LINK_TIPO.DROPBOX;
  if (isDiscordLink(url)) return LINK_TIPO.DISCORD;
  if (lowerUrl.includes('github.com')) return LINK_TIPO.GITHUB;
  return LINK_TIPO.WEB;
};