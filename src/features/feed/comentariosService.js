import api from '../../api/axiosConfig';

export const getComentarios = (novedadId) => api.get(`/api/novedades/${novedadId}/comentarios`);

export const createComentario = (novedadId, data) => api.post(`/api/novedades/${novedadId}/comentarios`, data);

export const updateComentario = (novedadId, comentarioId, data) => api.put(`/api/novedades/${novedadId}/comentarios/${comentarioId}`, data);

export const deleteComentario = (novedadId, comentarioId, estudianteId) => api.delete(`/api/novedades/${novedadId}/comentarios/${comentarioId}`, { data: { estudianteId } });

export const likeComentario = (novedadId, comentarioId, estudianteId) => api.post(`/api/novedades/${novedadId}/comentarios/${comentarioId}/like`, { estudianteId });

export const unlikeComentario = (novedadId, comentarioId, estudianteId) => api.post(`/api/novedades/${novedadId}/comentarios/${comentarioId}/unlike`, { estudianteId });
