import api from '../../api/axiosConfig';

export const getFeed = (params = {}) => api.get('/novedades', { params });

export const createPost = (data) => api.post('/novedades', data);

export const deletePost = (postId) => api.delete(`/novedades/${postId}`);

export const likePost = (postId, autorId) => api.post(`/novedades/${postId}/like`, { autorId });

export const unlikePost = (postId, autorId) => api.post(`/novedades/${postId}/unlike`, { autorId });

export const getPostById = (postId) => api.get(`/novedades/${postId}`);

export const updatePost = (postId, data) => api.put(`/novedades/${postId}`, data);
