import api from '../../api/axiosConfig';

export const getFeed = (params = {}) => api.get('/api/novedades', { params });

export const createPost = (data) => api.post('/api/novedades', data);

export const deletePost = (postId, estudianteId) => {
  return api.delete(`/api/novedades/${postId}?estudianteId=${estudianteId}`);
};

export const likePost = (postId, estudianteId) => {
  return api.post(`/api/novedades/${postId}/like`, { estudianteId });
};

export const unlikePost = (postId, estudianteId) => {
  return api.post(`/api/novedades/${postId}/unlike`, { estudianteId });
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
