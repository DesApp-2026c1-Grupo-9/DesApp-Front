import api from '../../api/axiosConfig';

export const getFeed = () => api.get('/feed');
export const createPost = (data) => api.post('/feed', data);
