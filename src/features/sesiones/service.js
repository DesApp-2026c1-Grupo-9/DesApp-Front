import api from '../../api/axiosConfig';

export const getSesiones = (params = {}) => api.get('/api/sesiones', { params });

export const getSesionById = (id, estudianteId) => 
  api.get(`/api/sesiones/${id}?estudianteId=${estudianteId}`);

export const createSesion = (data) => api.post('/api/sesiones', data);

export const updateSesion = (id, data) => api.put(`/api/sesiones/${id}`, data);

export const deleteSesion = (id, estudianteId) => 
  api.delete(`/api/sesiones/${id}`, { data: { estudianteId } });

export const joinSesion = (sesionId, estudianteId) => 
  api.post(`/api/sesiones/${sesionId}/inscribirse?estudianteId=${estudianteId}`);

export const getParticipantes = (sesionId, estudianteId) => 
  api.get(`/api/sesiones/${sesionId}/participantes?estudianteId=${estudianteId}`);

export const approveParticipante = (sesionId, participanteId, estudianteId) => 
  api.put(`/api/sesiones/${sesionId}/participantes/${participanteId}/aprobar?estudianteId=${estudianteId}`);

export const rejectParticipante = (sesionId, participanteId, estudianteId) => 
  api.put(`/api/sesiones/${sesionId}/participantes/${participanteId}/rechazar?estudianteId=${estudianteId}`);

export const leaveSesion = (sesionId, participanteId, estudianteId) => 
  api.delete(`/api/sesiones/${sesionId}/participantes/${participanteId}?estudianteId=${estudianteId}`);