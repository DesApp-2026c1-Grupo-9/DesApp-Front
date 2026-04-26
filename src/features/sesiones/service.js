import api from '../../api/axiosConfig';

export const getSesiones = () => api.get('/sesiones');
export const createSesion = (data) => api.post('/sesiones', data);
