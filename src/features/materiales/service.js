import api from '../../api/axiosConfig';

export const getMateriales = async (params = {}) => {
  const response = await api.get('/api/materiales', { params });
  return response.data.data;
};

export const getMaterialById = async (id) => {
  const response = await api.get(`/api/materiales/${id}`);
  return response.data.data;
};

export const getMaterias = async () => {
  const response = await api.get('/api/materiales/materias');
  return response.data.data;
};

export const createMaterial = async (data) => {
  const formData = new FormData();
  formData.append('titulo', data.titulo);
  formData.append('descripcion', data.descripcion || '');
  formData.append('tipo', data.tipo);
  formData.append('materiaId', data.materiaId);
  formData.append('usuarioId', data.creadorId);
  
  if (data.tags && data.tags.length > 0) {
    data.tags.forEach(tag => formData.append('tags', tag));
  }

  if (data.tipo === 'file' && data.archivo) {
    formData.append('archivo', data.archivo);
  } else if (data.tipo === 'link' && data.url) {
    formData.append('url', data.url);
  }

  const response = await api.post('/api/materiales', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.data;
};

export const updateMaterial = async (id, data, usuarioId) => {
  const response = await api.put(`/api/materiales/${id}?usuarioId=${usuarioId}`, data);
  return response.data.data;
};

export const deleteMaterial = async (id, usuarioId) => {
  await api.delete(`/api/materiales/${id}?usuarioId=${usuarioId}`);
  return id;
};

export const rateMaterial = async (id, value, usuarioId) => {
  const response = await api.post(`/api/materiales/${id}/rate?usuarioId=${usuarioId}`, { value });
  return response.data.data;
};

export const getMotivosDenuncia = async () => {
  const response = await api.get('/api/denuncias/motivos');
  return response.data.data;
};

export const verificarDenunciaExistente = async (materialId, usuarioId) => {
  const response = await api.get('/api/denuncias/verificar', {
    params: { materialId, usuarioId },
  });
  return response.data.yaDenuncio;
};

export const createDenuncia = async ({ materialId, motivoId, detalle, usuarioId }) => {
  const response = await api.post(`/api/denuncias?usuarioId=${usuarioId}`, {
    materialId,
    motivoId,
    detalle
  });
  return response.data;
};