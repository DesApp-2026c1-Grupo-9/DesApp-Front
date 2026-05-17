export const mockMaterias = [
  { id: 1, nombre: "Algoritmos y Estructuras de Datos", codigo: "AED-101" },
  { id: 2, nombre: "Análisis Matemático I", codigo: "AM1-202" },
  { id: 3, nombre: "Introducción a la Programación", codigo: "INT-101" },
  { id: 4, nombre: "Sistemas Operativos", codigo: "SO-301" }
];

export const mockUsuarios = [
  { id: 1, nombre: "Juan Pérez", email: "juan@email.com" },
  { id: 2, nombre: "María García", email: "maria@email.com" },
  { id: 3, nombre: "Carlos López", email: "carlos@email.com" }
];

export const mockMateriales = [
  {
    id: 1,
    titulo: "Apuntes de Complejidad Algorítmica",
    descripcion: "Resumen completo de los temas de la unidad 3: notación Big-O, complejidad temporal y espacial",
    tipo: "file",
    url: "/files/complejidad.pdf",
    nombreArchivo: "complejidad.pdf",
    tamanho: 2048576,
    materiaId: 1,
    materia: mockMaterias[0],
    creadorId: 1,
    creador: mockUsuarios[0],
    tags: ["parcial", "complejidad", "algoritmos", "teoría"],
    tipoLink: null,
    fecha: "2026-03-15",
    ratings: { upvotes: 12, downvotes: 2 },
    userRating: null
  },
  {
    id: 2,
    titulo: "Guía de Trabajos Prácticos - Unidad 3",
    descripcion: "Ejercicios resueltos de árboles y grafos",
    tipo: "file",
    url: "/files/tp3.pdf",
    nombreArchivo: "tp3.pdf",
    tamanho: 1536000,
    materiaId: 1,
    materia: mockMaterias[0],
    creadorId: 2,
    creador: mockUsuarios[1],
    tags: ["tp", "práctica", "árboles", "grafos"],
    tipoLink: null,
    fecha: "2026-03-20",
    ratings: { upvotes: 8, downvotes: 1 },
    userRating: 1
  },
  {
    id: 3,
    titulo: "Explicación de Árboles Binarios",
    descripcion: "Video explicativo sobre árboles binarios de búsqueda",
    tipo: "link",
    url: "https://youtube.com/watch?v=abc123",
    materiaId: 1,
    materia: mockMaterias[0],
    creadorId: 1,
    creador: mockUsuarios[0],
    tags: ["video", "árboles", "explicación"],
    tipoLink: "youtube",
    fecha: "2026-03-10",
    ratings: { upvotes: 15, downvotes: 3 },
    userRating: null
  },
  {
    id: 4,
    titulo: "Servidor de Estudio - Algoritmos",
    descripcion: "Únete a nuestro servidor de Discord para estudiar juntos",
    tipo: "link",
    url: "https://discord.gg/invite/abc123",
    materiaId: 1,
    materia: mockMaterias[0],
    creadorId: 3,
    creador: mockUsuarios[2],
    tags: ["discord", "grupo", "estudio"],
    tipoLink: "discord",
    discordInfo: { servidor: "Algoritmos FC", canal: "general" },
    fecha: "2026-03-05",
    ratings: { upvotes: 20, downvotes: 1 },
    userRating: 1
  },
  {
    id: 5,
    titulo: "Teoría de Límites y Continuidad",
    descripcion: "Apuntes teóricos de límites y continuidad para el primer parcial",
    tipo: "file",
    url: "/files/limites.pdf",
    nombreArchivo: "limites.pdf",
    tamanho: 3072000,
    materiaId: 2,
    materia: mockMaterias[1],
    creadorId: 2,
    creador: mockUsuarios[1],
    tags: ["parcial", "límites", "teoría", "am1"],
    tipoLink: null,
    fecha: "2026-04-01",
    ratings: { upvotes: 5, downvotes: 0 },
    userRating: null
  },
  {
    id: 6,
    titulo: "Ejercicios Resueltos - Serie 2",
    descripcion: "Serie de ejercicios resueltos del segundo práctico",
    tipo: "file",
    url: "/files/serie2.xlsx",
    nombreArchivo: "serie2.xlsx",
    tamanho: 512000,
    materiaId: 2,
    materia: mockMaterias[1],
    creadorId: 1,
    creador: mockUsuarios[0],
    tags: ["práctica", "ejercicios", "resueltos"],
    tipoLink: null,
    fecha: "2026-04-05",
    ratings: { upvotes: 3, downvotes: 2 },
    userRating: -1
  },
  {
    id: 7,
    titulo: "Tutorial: Derivadas paso a paso",
    descripcion: "Video tutorial sobre derivadas",
    tipo: "link",
    url: "https://youtube.com/watch?v=xyz789",
    materiaId: 2,
    materia: mockMaterias[1],
    creadorId: 3,
    creador: mockUsuarios[2],
    tags: ["video", "derivadas", "tutorial"],
    tipoLink: "youtube",
    fecha: "2026-03-25",
    ratings: { upvotes: 10, downvotes: 1 },
    userRating: null
  },
  {
    id: 8,
    titulo: "Repositorio de Código - Proyectos",
    descripcion: "Repositorio con ejemplos de proyectos en Python",
    tipo: "link",
    url: "https://github.com/user/proyectos-python",
    materiaId: 3,
    materia: mockMaterias[2],
    creadorId: 1,
    creador: mockUsuarios[0],
    tags: ["github", "código", "python", "proyectos"],
    tipoLink: "github",
    fecha: "2026-02-20",
    ratings: { upvotes: 8, downvotes: 0 },
    userRating: 1
  },
  {
    id: 9,
    titulo: "Documentación Oficial de Estructuras de Datos",
    descripcion: "Link a la documentación oficial de Python sobre estructuras de datos",
    tipo: "link",
    url: "https://docs.python.org/3/tutorial/datastructures.html",
    materiaId: 1,
    materia: mockMaterias[0],
    creadorId: 2,
    creador: mockUsuarios[1],
    tags: ["documentación", "python", "referencia"],
    tipoLink: "web",
    fecha: "2026-02-28",
    ratings: { upvotes: 6, downvotes: 1 },
    userRating: null
  },
  {
    id: 10,
    titulo: "Carpeta Compartida - Material AM1",
    descripcion: "Carpeta en Drive con todos los materiales de Análisis Matemático I",
    tipo: "link",
    url: "https://drive.google.com/drive/folders/abc123",
    materiaId: 2,
    materia: mockMaterias[1],
    creadorId: 3,
    creador: mockUsuarios[2],
    tags: ["drive", "carpeta", "compartida"],
    tipoLink: "drive",
    fecha: "2026-02-15",
    ratings: { upvotes: 25, downvotes: 2 },
    userRating: 1
  }
];

export const getMockMaterialById = (id) => {
  return mockMateriales.find(m => m.id === id) || null;
};

export const getMockMaterialesByMateria = (materiaId) => {
  return mockMateriales.filter(m => m.materiaId === materiaId);
};