import api from '../../api/axiosConfig';

export const getComentarios = (novedadId) => api.get(`/api/novedades/${novedadId}/comentarios`);

export const createComentario = (novedadId, data) => api.post(`/api/novedades/${novedadId}/comentarios`, data);

export const updateComentario = (novedadId, comentarioId, data) => api.put(`/api/novedades/${novedadId}/comentarios/${comentarioId}`, data);

export const deleteComentario = (novedadId, comentarioId, usuarioId) => api.delete(`/api/novedades/${novedadId}/comentarios/${comentarioId}`, { data: { usuarioId } });

export const likeComentario = (novedadId, comentarioId, usuarioId) => api.post(`/api/novedades/${novedadId}/comentarios/${comentarioId}/like`, { usuarioId });

export const unlikeComentario = (novedadId, comentarioId, usuarioId) => api.post(`/api/novedades/${novedadId}/comentarios/${comentarioId}/unlike`, { usuarioId });
