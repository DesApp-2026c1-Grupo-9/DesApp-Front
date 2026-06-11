import api from '../../api/axiosConfig';

export const getNotificaciones = (params = {}) =>
  api.get('/api/notificaciones', { params });

export const getContador = (params = {}) =>
  api.get('/api/notificaciones/contador', { params });

export const marcarLeida = (id, params = {}) =>
  api.patch(`/api/notificaciones/${id}/leer`, null, { params });

export const marcarTodasLeidas = (params = {}) =>
  api.patch('/api/notificaciones/leer-todas', null, { params });
