import api from '../../api/axiosConfig';

export const getSesiones = (params = {}) => api.get('/api/sesiones', { params });

export const getSesionById = (id, usuarioId) => 
  api.get(`/api/sesiones/${id}?usuarioId=${usuarioId}`);

export const createSesion = (data) => api.post('/api/sesiones', data);

export const updateSesion = (id, data) => api.put(`/api/sesiones/${id}`, data);

export const deleteSesion = (id, usuarioId) => 
  api.delete(`/api/sesiones/${id}`, { data: { usuarioId } });

export const joinSesion = (sesionId, usuarioId) => 
  api.post(`/api/sesiones/${sesionId}/inscribirse?usuarioId=${usuarioId}`);

export const getParticipantes = (sesionId, usuarioId) => 
  api.get(`/api/sesiones/${sesionId}/participantes?usuarioId=${usuarioId}`);

export const approveParticipante = (sesionId, participanteId, usuarioId) => 
  api.put(`/api/sesiones/${sesionId}/participantes/${participanteId}/aprobar?usuarioId=${usuarioId}`);

export const rejectParticipante = (sesionId, participanteId, usuarioId) => 
  api.put(`/api/sesiones/${sesionId}/participantes/${participanteId}/rechazar?usuarioId=${usuarioId}`);