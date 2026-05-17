import { mockMateriales, mockMaterias, getMockMaterialById } from './mockData';
import { detectLinkTipo } from './constants';

let materialesData = [...mockMateriales];
let nextId = materialesData.length + 1;

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const getMateriales = async (params = {}) => {
  await delay();
  let result = [...materialesData];

  if (params.materiaId) {
    result = result.filter(m => m.materiaId === params.materiaId);
  }

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    result = result.filter(m =>
      m.titulo.toLowerCase().includes(searchLower) ||
      m.descripcion.toLowerCase().includes(searchLower) ||
      m.tags.some(t => t.toLowerCase().includes(searchLower)) ||
      m.materia.nombre.toLowerCase().includes(searchLower)
    );
  }

  if (params.tags && params.tags.length > 0) {
    result = result.filter(m =>
      params.tags.some(tag => m.tags.includes(tag))
    );
  }

  switch (params.sortBy) {
    case 'fecha_asc':
      result.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      break;
    case 'rating_desc':
      result.sort((a, b) => {
        const ratioA = a.ratings.upvotes / (a.ratings.upvotes + a.ratings.downvotes || 1);
        const ratioB = b.ratings.upvotes / (b.ratings.upvotes + b.ratings.downvotes || 1);
        return ratioB - ratioA;
      });
      break;
    case 'rating_asc':
      result.sort((a, b) => {
        const ratioA = a.ratings.upvotes / (a.ratings.upvotes + a.ratings.downvotes || 1);
        const ratioB = b.ratings.upvotes / (b.ratings.upvotes + b.ratings.downvotes || 1);
        return ratioA - ratioB;
      });
      break;
    default:
      result.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }

  return { data: result };
};

export const getMaterialById = async (id) => {
  await delay();
  const material = getMockMaterialById(id);
  return { data: material };
};

export const getMaterias = async () => {
  await delay();
  return { data: mockMaterias };
};

export const createMaterial = async (data) => {
  await delay();
  const newMaterial = {
    id: nextId++,
    titulo: data.titulo,
    descripcion: data.descripcion || '',
    tipo: data.tipo,
    url: data.url || '',
    nombreArchivo: data.nombreArchivo || null,
    tamanho: data.tamanho || null,
    materiaId: data.materiaId,
    materia: mockMaterias.find(m => m.id === data.materiaId),
    creadorId: data.creadorId,
    creador: data.creador,
    tags: data.tags || [],
    tipoLink: data.tipo === 'link' ? detectLinkTipo(data.url) : null,
    discordInfo: data.tipoLink === 'discord' ? data.discordInfo : null,
    fecha: new Date().toISOString().split('T')[0],
    ratings: { upvotes: 0, downvotes: 0 },
    userRating: null
  };
  materialesData.push(newMaterial);
  return { data: newMaterial };
};

export const updateMaterial = async (id, data) => {
  await delay();
  const index = materialesData.findIndex(m => m.id === id);
  if (index === -1) throw new Error('Material no encontrado');

  const updated = {
    ...materialesData[index],
    titulo: data.titulo ?? materialesData[index].titulo,
    descripcion: data.descripcion ?? materialesData[index].descripcion,
    tags: data.tags ?? materialesData[index].tags
  };

  if (data.url) {
    updated.url = data.url;
    if (updated.tipo === 'link') {
      updated.tipoLink = detectLinkTipo(data.url);
    }
  }

  materialesData[index] = updated;
  return { data: updated };
};

export const deleteMaterial = async (id) => {
  await delay();
  const index = materialesData.findIndex(m => m.id === id);
  if (index === -1) throw new Error('Material no encontrado');
  materialesData.splice(index, 1);
  return { data: { success: true } };
};

export const rateMaterial = async (id, value) => {
  await delay();
  const index = materialesData.findIndex(m => m.id === id);
  if (index === -1) throw new Error('Material no encontrado');

  const material = materialesData[index];
  const currentRating = material.userRating;

  if (currentRating === value) {
    if (value === 1) material.ratings.upvotes--;
    else material.ratings.downvotes--;
    material.userRating = null;
  } else {
    if (currentRating) {
      if (currentRating === 1) material.ratings.upvotes--;
      else material.ratings.downvotes--;
    }
    if (value === 1) material.ratings.upvotes++;
    else material.ratings.downvotes++;
    material.userRating = value;
  }

  return { data: { ...material } };
};