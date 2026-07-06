const NOTIFICATION_ROUTES = {
  sesion_creada_conexion: { path: '/sesiones/:id', getId: (n) => n.sesionId },
  sesion_creada_materia: { path: '/sesiones/:id', getId: (n) => n.sesionId },
  sesion_cancelada: { path: '/sesiones/:id', getId: (n) => n.sesionId },
  sesion_recordatorio: { path: '/sesiones/:id', getId: (n) => n.sesionId },
  sesion_participante_nuevo: { path: '/sesiones/:id', getId: (n) => n.sesionId },
  sesion_solicitud_nueva: { path: '/sesiones/:id', getId: (n) => n.sesionId },
  denuncia_recibida: { path: '/materiales/:id', getId: (n) => n.materialId },
  material_suspendido: { path: '/materiales/:id', getId: (n) => n.materialId },
  material_revocado: { path: '/materiales/:id', getId: (n) => n.materialId },
  conexion_aprobo_materia: { path: '/social/feed/novedad/:id', getId: (n) => n.novedadId },
  novedad_like: { path: '/social/feed/novedad/:id', getId: (n) => n.novedadId },
  novedad_comentario: { path: '/social/feed/novedad/:id', getId: (n) => n.novedadId },
  comentario_respuesta: { path: '/social/feed/novedad/:id', getId: (n) => n.novedadId },
};

export function getNotificationLink(notif) {
  if (!notif?.tipo) return null;
  const config = NOTIFICATION_ROUTES[notif.tipo];
  if (!config) return null;
  const id = config.getId(notif);
  if (!id) return null;
  return config.path.replace(':id', id);
}
