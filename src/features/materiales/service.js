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
  formData.append('estudianteId', data.creadorId);
  
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

export const updateMaterial = async (id, data, estudianteId) => {
  const response = await api.put(`/api/materiales/${id}?estudianteId=${estudianteId}`, data);
  return response.data.data;
};

export const deleteMaterial = async (id, estudianteId) => {
  await api.delete(`/api/materiales/${id}?estudianteId=${estudianteId}`);
  return id;
};

export const rateMaterial = async (id, value, estudianteId) => {
  const response = await api.post(`/api/materiales/${id}/rate?estudianteId=${estudianteId}`, { value });
  return response.data.data;
};

export const getMotivosDenuncia = async () => {
  const response = await api.get('/api/denuncias/motivos');
  return response.data.data;
};

export const verificarDenunciaExistente = async (materialId, estudianteId) => {
  const response = await api.get('/api/denuncias/verificar', {
    params: { materialId, estudianteId },
  });
  return response.data.yaDenuncio;
};

export const createDenuncia = async ({ materialId, motivoId, detalle, estudianteId }) => {
  const response = await api.post(`/api/denuncias?estudianteId=${estudianteId}`, {
    materialId,
    motivoId,
    detalle
  });
  return response.data;
};