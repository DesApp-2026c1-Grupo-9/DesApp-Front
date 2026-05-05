import api from '../../api/axiosConfig';

export const getConexiones = (usuarioId) => {
  const params = usuarioId ? { usuarioId } : {};
  return api.get('/api/conexiones', { params });
};

export const getPendientes = (usuarioId) => {
  const params = usuarioId ? { usuarioId } : {};
  return api.get('/api/conexiones/pendientes', { params });
};

export const sendInvitation = (email, usuarioId) => {
  const params = usuarioId ? { usuarioId } : {};
  return api.post('/api/conexiones/invite', { email }, { params });
};

export const respondInvitation = (id, estado, usuarioId) => {
  const params = usuarioId ? { usuarioId } : {};
  return api.put(`/api/conexiones/respond/${id}`, { estado }, { params });
};

export const removeConexion = (id, usuarioId) => {
  const params = usuarioId ? { usuarioId } : {};
  return api.delete(`/api/conexiones/${id}`, { params });
};
