const normalizarTexto = (valor) =>
  String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const normalizarNombreMateria = (nombre) => {
  const base = normalizarTexto(nombre).split(':')[0] || '';
  return base
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const claveMateriaEquivalente = (materia) => {
  const codigo = normalizarTexto(materia?.codigo);
  if (codigo) return `codigo:${codigo}`;

  const nombre = normalizarNombreMateria(materia?.nombre);
  if (nombre) return `nombre:${nombre}`;

  return `id:${materia?.id}`;
};

export const deduplicarMaterias = (materias = []) => {
  const vistas = new Set();

  return materias.filter((materia) => {
    const clave = claveMateriaEquivalente(materia);
    if (vistas.has(clave)) return false;
    vistas.add(clave);
    return true;
  });
};
