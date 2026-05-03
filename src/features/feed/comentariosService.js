import api from '../../api/axiosConfig';

export const getComentarios = (novedadId) => api.get(`/novedades/${novedadId}/comentarios`);

export const createComentario = (novedadId, data) => api.post(`/novedades/${novedadId}/comentarios`, data);

export const updateComentario = (novedadId, comentarioId, data) => api.put(`/novedades/${novedadId}/comentarios/${comentarioId}`, data);

export const deleteComentario = (novedadId, comentarioId, usuarioId) => api.delete(`/novedades/${novedadId}/comentarios/${comentarioId}`, { data: { usuarioId } });

export const likeComentario = (novedadId, comentarioId, usuarioId) => api.post(`/novedades/${novedadId}/comentarios/${comentarioId}/like`, { usuarioId });

export const unlikeComentario = (novedadId, comentarioId, usuarioId) => api.post(`/novedades/${novedadId}/comentarios/${comentarioId}/unlike`, { usuarioId });
