import api from '../../api/axiosConfig';

export const getCarreras = () => api.get('/carreras');

export const getCarreraById = (id) => api.get(`/carreras/${id}`);
