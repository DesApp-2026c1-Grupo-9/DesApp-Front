import api from '../../api/axiosConfig';

export const getPerfil = () => api.get('/perfil');
export const updatePerfil = (data) => api.put('/perfil', data);
