import api from '../../api/axiosConfig';

export const getFeed = () => api.get('/feed');

export const createPost = (data) => api.post('/feed', data);

export const deletePost = (postId) => api.delete(`/feed/${postId}`);

export const likePost = (postId, liked) => api.post(`/feed/${postId}/like`, { liked });

export const getPostById = (postId) => api.get(`/feed/${postId}`);

export const updatePost = (postId, data) => api.put(`/feed/${postId}`, data);