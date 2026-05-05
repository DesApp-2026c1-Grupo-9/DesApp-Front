import api from '../../api/axiosConfig';

export const getFeed = (params = {}) => api.get('/api/novedades', { params });

export const createPost = (data) => api.post('/api/novedades', data);

export const deletePost = (postId, usuarioId) => {
  return api.delete(`/api/novedades/${postId}?usuarioId=${usuarioId}`);
};

export const likePost = (postId, usuarioId) => {
  return api.post(`/api/novedades/${postId}/like`, { usuarioId });
};

export const unlikePost = (postId, usuarioId) => {
  return api.post(`/api/novedades/${postId}/unlike`, { usuarioId });
};

export const getPostById = (postId) => api.get(`/api/novedades/${postId}`);

export const updatePost = (postId, data, params = {}) => {
  const filteredParams = {};
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined) {
      filteredParams[key] = params[key];
    }
  });
  const queryString = new URLSearchParams(filteredParams).toString();
  const url = queryString ? `/api/novedades/${postId}?${queryString}` : `/api/novedades/${postId}`;
  return api.put(url, data);
};
