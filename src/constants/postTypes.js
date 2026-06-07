export const TIPO_EVENTO = {
  INSCRIPCION: 'inscripcion',
  REGULARIZACION: 'regularizacion',
  APROBACION: 'aprobacion',
  SESION_CREADA: 'sesion_creada',
  SESION_CANCELADA: 'sesion_cancelada',
};

export const TIPO_POST = {
  PUBLICACION: 'publicacion',
  EVENTO_ACADEMICO: 'evento_academico',
  EVENTO_SESION: 'evento_sesion',
};

export const EVENT_TYPE_LABELS = {
  [TIPO_EVENTO.INSCRIPCION]: 'se inscribió a',
  [TIPO_EVENTO.REGULARIZACION]: 'regularizó',
  [TIPO_EVENTO.APROBACION]: 'aprobó',
  [TIPO_EVENTO.SESION_CREADA]: 'creó sesión de',
  [TIPO_EVENTO.SESION_CANCELADA]: 'canceló sesión de',
};

export const POST_TYPE_LABELS = {
  [TIPO_POST.PUBLICACION]: 'Publicación',
  [TIPO_POST.EVENTO_ACADEMICO]: 'Evento Académico',
  [TIPO_POST.EVENTO_SESION]: 'Sesión de Estudio',
};