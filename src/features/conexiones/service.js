import api from '../../api/axiosConfig';

export const getConexiones = () => api.get('/conexiones');
export const sendInvitation = (email) => api.post('/conexiones/invite', { email });
export const respondInvitation = (id, status) => api.put(`/conexiones/respond/${id}`, { status });
