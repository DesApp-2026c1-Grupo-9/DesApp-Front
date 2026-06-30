import api from '../../api/axiosConfig';

export const getConexiones = (estudianteId) => {
  const params = estudianteId ? { estudianteId } : {};
  return api.get('/api/conexiones', { params });
};

export const getPendientes = (estudianteId) => {
  const params = estudianteId ? { estudianteId } : {};
  return api.get('/api/conexiones/pendientes', { params });
};

export const sendInvitation = (email, estudianteId) => {
  const params = estudianteId ? { estudianteId } : {};
  return api.post('/api/conexiones/invite', { email }, { params });
};

export const respondInvitation = (id, estado, estudianteId) => {
  const params = estudianteId ? { estudianteId } : {};
  return api.put(`/api/conexiones/respond/${id}`, { estado }, { params });
};

export const removeConexion = (id, estudianteId) => {
  const params = estudianteId ? { estudianteId } : {};
  return api.delete(`/api/conexiones/${id}`, { params });
};
