import { Box } from '@mui/material';

export const formatFechaSeguro = (fecha) => {
  if (!fecha) return 'Fecha no disponible';
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return 'Fecha no disponible';
  return date.toLocaleString();
};

export const formatFechaDate = (fecha, locale = 'es-AR') => {
  if (!fecha) return '';
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale);
};

export const formatFechaDateTime = (fecha, locale = 'es-AR') => {
  if (!fecha) return '';
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString(locale);
};

export const formatFechaRelative = (fecha) => {
  if (!fecha) return 'Fecha no disponible';
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return 'Fecha no disponible';

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'ahora';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString();
};

export const formatHora = (fecha) => {
  if (!fecha) return '';
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatFechaCorta = (fecha) => {
  if (!fecha) return '';
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatFechaCompleta = (fecha) => {
  if (!fecha) return '';
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const getFechaYHora = (fecha) => {
  if (!fecha) return 'Fecha no disponible';
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return 'Fecha no disponible';
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isToday = (fecha) => {
  if (!fecha) return false;
  const date = new Date(fecha);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isYesterday = (fecha) => {
  if (!fecha) return false;
  const date = new Date(fecha);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

export const isTomorrow = (fecha) => {
  if (!fecha) return false;
  const date = new Date(fecha);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
};

export const getRelativeDateLabel = (fecha) => {
  if (isToday(fecha)) return `Hoy, ${formatHora(fecha)}`;
  if (isYesterday(fecha)) return `Ayer, ${formatHora(fecha)}`;
  if (isTomorrow(fecha)) return `Mañana, ${formatHora(fecha)}`;
  return getFechaYHora(fecha);
};

export const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return '-';
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  if (isNaN(nacimiento.getTime())) return '-';
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
};

export const DiscordIcon = () => (
  <Box
    component="span"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: '1.3rem',
    }}
  >
    🎮
  </Box>
);