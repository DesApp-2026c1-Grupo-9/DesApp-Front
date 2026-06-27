import api from '../../api/axiosConfig';

export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const updateUser = (estudianteId, data) => api.put(`/api/estudiantes/${estudianteId}`, data);

export const uploadAvatar = (estudianteId, file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return api.post(`/api/estudiantes/${estudianteId}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
