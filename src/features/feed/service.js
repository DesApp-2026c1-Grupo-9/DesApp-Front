import api from '../../api/axiosConfig';

export const getFeed = (params = {}) => api.get('/novedades', { params });

export const createPost = (data) => api.post('/novedades', data);

export const deletePost = (postId, usuarioId) => {
  return api.delete(`/novedades/${postId}?usuarioId=${usuarioId}`);
};

export const likePost = (postId, usuarioId) => {
  return api.post(`/novedades/${postId}/like`, { usuarioId });
};

export const unlikePost = (postId, usuarioId) => {
  return api.post(`/novedades/${postId}/unlike`, { usuarioId });
};

export const getPostById = (postId) => api.get(`/novedades/${postId}`);

export const updatePost = (postId, data, params = {}) => {
  const filteredParams = {};
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined) {
      filteredParams[key] = params[key];
    }
  });
  const queryString = new URLSearchParams(filteredParams).toString();
  const url = queryString ? `/novedades/${postId}?${queryString}` : `/novedades/${postId}`;
  return api.put(url, data);
};
