import api from '../../api/axiosConfig';

export const getFeed = (params = {}) => api.get('/novedades', { params });

export const createPost = (data) => api.post('/novedades', data);

export const deletePost = (postId) => api.delete(`/novedades/${postId}`);

export const likePost = (postId, usuarioId) => api.post(`/novedades/${postId}/like?usuarioId=${usuarioId}`);

export const unlikePost = (postId, usuarioId) => api.post(`/novedades/${postId}/unlike?usuarioId=${usuarioId}`);

export const getPostById = (postId) => api.get(`/novedades/${postId}`);

export const updatePost = (postId, data, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `/novedades/${postId}?${queryString}` : `/novedades/${postId}`;
  return api.put(url, data);
};
