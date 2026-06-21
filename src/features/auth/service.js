import api from '../../api/axiosConfig';

export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const updateUser = (id, data) => api.put(`/api/usuarios/${id}`, data);

export const uploadAvatar = (id, file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return api.post(`/api/usuarios/${id}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
