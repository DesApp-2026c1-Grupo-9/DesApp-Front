export const TIPO_EVENTO = {
  INSCRIPCION: 'inscripcion',
  REGULARIZACION: 'regularizacion',
  APROBACION: 'aprobacion',
};

export const TIPO_POST = {
  PUBLICACION: 'publicacion',
  EVENTO_ACADEMICO: 'evento_academico',
};

export const EVENT_TYPE_LABELS = {
  [TIPO_EVENTO.INSCRIPCION]: 'se inscribió a',
  [TIPO_EVENTO.REGULARIZACION]: 'regularizó',
  [TIPO_EVENTO.APROBACION]: 'aprobó',
};

export const POST_TYPE_LABELS = {
  [TIPO_POST.PUBLICACION]: 'Publicación',
  [TIPO_POST.EVENTO_ACADEMICO]: 'Evento Académico',
};