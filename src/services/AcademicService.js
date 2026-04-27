/**
 * Servicio para gestionar la lógica académica y de correlatividades
 * Maneja el cálculo de materias disponibles para cursar basado en la situación académica del estudiante
 */

// Estados posibles de una materia
export const ESTADOS_MATERIA = {
  APROBADA: 'Aprobada',
  REGULARIZADA: 'Regularizada',
  CURSANDO: 'Cursando',
  PUEDE_CURSAR: 'Puede Cursar',
  NO_DISPONIBLE: 'No Disponible'
};

// Mock data de materias y sus correlatividades (normalmente vendría del backend)
const MATERIAS_CARRERA = {
  'Licenciatura en Informática': [
    // Primer año
    {
      id: 1,
      nombre: 'Matemática I',
      año: 1,
      cuatrimestre: 1,
      correlativas: [],
      cargaHoraria: 8,
      cargaHorariaTotal: 128,
      area: 'CB'
    },
    {
      id: 2,
      nombre: 'Introducción a la Programación',
      año: 1,
      cuatrimestre: 1,
      correlativas: [],
      cargaHoraria: 8,
      cargaHorariaTotal: 128,
      area: 'AyL'
    },
    {
      id: 3,
      nombre: 'Organización de Computadoras',
      año: 1,
      cuatrimestre: 1,
      correlativas: [],
      cargaHoraria: 6,
      cargaHorariaTotal: 96,
      area: 'ASOyR'
    },
    {
      id: 4,
      nombre: 'Nuevos Entornos y Lenguajes',
      año: 1,
      cuatrimestre: 1,
      correlativas: [],
      cargaHoraria: 2,
      cargaHorariaTotal: 32,
      area: 'Otros'
    },
    {
      id: 5,
      nombre: 'Estructuras de Datos',
      año: 1,
      cuatrimestre: 2,
      correlativas: ['Introducción a la Programación'],
      cargaHoraria: 8,
      cargaHorariaTotal: 128,
      area: 'TC'
    },
    {
      id: 6,
      nombre: 'Programación con Objetos I',
      año: 1,
      cuatrimestre: 2,
      correlativas: ['Introducción a la Programación'],
      cargaHoraria: 8,
      cargaHorariaTotal: 128,
      area: 'AyL'
    },
    {
      id: 7,
      nombre: 'Bases de Datos',
      año: 1,
      cuatrimestre: 2,
      correlativas: ['Introducción a la Programación'],
      cargaHoraria: 6,
      cargaHorariaTotal: 96,
      area: 'ISBDySI'
    },
    {
      id: 8,
      nombre: 'Inglés I',
      año: 1,
      cuatrimestre: 2,
      correlativas: [],
      cargaHoraria: 2,
      cargaHorariaTotal: 32,
      area: 'Otros'
    },
    // Segundo Año
    {
      id: 9,
      nombre: 'Matemática II',
      año: 2,
      cuatrimestre: 1,
      correlativas: ['Matemática I'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'CB'
    },
    {
      id: 10,
      nombre: 'Programación con Objetos II',
      año: 2,
      cuatrimestre: 1,
      correlativas: ['Programación con Objetos I'],
      cargaHoraria: 6,
      cargaHorariaTotal: 96,
      area: 'AyL'
    },
    {
      id: 11,
      nombre: 'Redes de Computadoras',
      año: 2,
      cuatrimestre: 1,
      correlativas: ['Organización de Computadoras'],
      cargaHoraria: 6,
      cargaHorariaTotal: 96,
      area: 'ASOyR'
    },
    {
      id: 12,
      nombre: 'Sistemas Operativos',
      año: 2,
      cuatrimestre: 1,
      correlativas: ['Organización de Computadoras'],
      cargaHoraria: 6,
      cargaHorariaTotal: 96,
      area: 'ASOyR'
    },
    {
      id: 13,
      nombre: 'Programación Funcional',
      año: 2,
      cuatrimestre: 2,
      correlativas: ['Programación con Objetos I'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'AyL'
    },
    {
      id: 14,
      nombre: 'Construcción de Interfaces de Usuario',
      año: 2,
      cuatrimestre: 2,
      correlativas: ['Programación con Objetos II'],
      cargaHoraria: 6,
      cargaHorariaTotal: 96,
      area: 'ISBDySI'
    },
    {
      id: 15,
      nombre: 'Algoritmos',
      año: 2,
      cuatrimestre: 2,
      correlativas: ['Estructuras de Datos', 'Matemática II'],
      cargaHoraria: 6,
      cargaHorariaTotal: 96,
      area: 'AyL'
    },
    {
      id: 16,
      nombre: 'Estrategias de Persistencia',
      año: 2,
      cuatrimestre: 2,
      correlativas: ['Bases de Datos', 'Programación con Objetos II'],
      cargaHoraria: 6,
      cargaHorariaTotal: 96,
      area: 'ISBDySI'
    },
    {
      id: 17,
      nombre: 'Laboratorio de Sistemas Operativos y Redes',
      año: 2,
      cuatrimestre: 2,
      correlativas: ['Sistemas Operativos', 'Redes de Computadoras'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'ASOyR'
    },
    // Tercer Año
    {
      id: 18,
      nombre: 'Análisis Matemático',
      año: 3,
      cuatrimestre: 1,
      correlativas: ['Matemática II'],
      cargaHoraria: 6,
      cargaHorariaTotal: 96,
      area: 'CB'
    },
    {
      id: 19,
      nombre: 'Lógica y Programación',
      año: 3,
      cuatrimestre: 1,
      correlativas: ['Algoritmos'],
      cargaHoraria: 6,
      cargaHorariaTotal: 96,
      area: 'TC'
    },
    {
      id: 20,
      nombre: 'Elementos de Ingeniería de Software',
      año: 3,
      cuatrimestre: 1,
      correlativas: ['Programación con Objetos II'],
      cargaHoraria: 6,
      cargaHorariaTotal: 96,
      area: 'ISBDySI'
    },
    {
      id: 21,
      nombre: 'Seguridad de la Información',
      año: 3,
      cuatrimestre: 1,
      correlativas: ['Redes de Computadoras', 'Sistemas Operativos'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'ASOyR'
    },
    {
      id: 22,
      nombre: 'Materia UNAHUR I',
      año: 3,
      cuatrimestre: 1,
      correlativas: [],
      cargaHoraria: 2,
      cargaHorariaTotal: 32,
      area: 'Otros'
    },
    {
      id: 23,
      nombre: 'Inglés II',
      año: 3,
      cuatrimestre: 1,
      correlativas: ['Inglés I'],
      cargaHoraria: 2,
      cargaHorariaTotal: 32,
      area: 'Otros'
    },
    {
      id: 24,
      nombre: 'Matemática III',
      año: 3,
      cuatrimestre: 2,
      correlativas: ['Análisis Matemático'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'CB'
    },
    {
      id: 25,
      nombre: 'Programación Concurrente',
      año: 3,
      cuatrimestre: 2,
      correlativas: ['Programación con Objetos II', 'Sistemas Operativos'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'AyL'
    },
    {
      id: 26,
      nombre: 'Ingeniería de Requerimientos',
      año: 3,
      cuatrimestre: 2,
      correlativas: ['Elementos de Ingeniería de Software'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'ISBDySI'
    },
    {
      id: 27,
      nombre: 'Desarrollo de Aplicaciones',
      año: 3,
      cuatrimestre: 2,
      correlativas: ['Construcción de Interfaces de Usuario', 'Estrategias de Persistencia'],
      cargaHoraria: 6,
      cargaHorariaTotal: 96,
      area: 'ISBDySI'
    },
    // Cuarto Año
    {
      id: 28,
      nombre: 'Probabilidad y Estadística',
      año: 4,
      cuatrimestre: 1,
      correlativas: ['Matemática III'],
      cargaHoraria: 6,
      cargaHorariaTotal: 96,
      area: 'CB'
    },
    {
      id: 29,
      nombre: 'Gestión de Proyectos de Desarrollo de Software',
      año: 4,
      cuatrimestre: 1,
      correlativas: ['Ingeniería de Requerimientos'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'ISBDySI'
    },
    {
      id: 30,
      nombre: 'Lenguajes Formales y Autómatas',
      año: 4,
      cuatrimestre: 1,
      correlativas: ['Lógica y Programación'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'TC'
    },
    {
      id: 31,
      nombre: 'Programación con Objetos III',
      año: 4,
      cuatrimestre: 1,
      correlativas: ['Programación Concurrente'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'AyL'
    },
    {
      id: 32,
      nombre: 'Materia UNAHUR II',
      año: 4,
      cuatrimestre: 1,
      correlativas: ['Materia UNAHUR I'],
      cargaHoraria: 2,
      cargaHorariaTotal: 32,
      area: 'Otros'
    },
    {
      id: 33,
      nombre: 'Práctica Profesional Supervisada (PPS)',
      año: 4,
      cuatrimestre: 2,
      correlativas: ['Desarrollo de Aplicaciones'],
      cargaHoraria: 6,
      cargaHorariaTotal: 96,
      area: 'Otros'
    },
    {
      id: 34,
      nombre: 'Teoría de la Computación',
      año: 4,
      cuatrimestre: 2,
      correlativas: ['Lenguajes Formales y Autómatas'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'TC'
    },
    {
      id: 35,
      nombre: 'Arquitectura de Software I',
      año: 4,
      cuatrimestre: 2,
      correlativas: ['Gestión de Proyectos de Desarrollo de Software'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'ISBDySI'
    },
    {
      id: 36,
      nombre: 'Sistemas Distribuidos y Tiempo Real',
      año: 4,
      cuatrimestre: 2,
      correlativas: ['Laboratorio de Sistemas Operativos y Redes', 'Programación Concurrente'],
      cargaHoraria: 6,
      cargaHorariaTotal: 96,
      area: 'ASOyR'
    },
    // Quinto Año
    {
      id: 37,
      nombre: 'Tesina de Licenciatura',
      año: 5,
      cuatrimestre: 1, // Anual pero marcamos como 1er cuatrimestre
      correlativas: ['Práctica Profesional Supervisada (PPS)'],
      cargaHoraria: 5,
      cargaHorariaTotal: 160,
      area: 'Otros',
      esAnual: true
    },
    {
      id: 38,
      nombre: 'Materia Optativa I',
      año: 5,
      cuatrimestre: 1,
      correlativas: [],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'Optativa'
    },
    {
      id: 39,
      nombre: 'Características de Lenguajes de Programación',
      año: 5,
      cuatrimestre: 1,
      correlativas: ['Programación con Objetos III'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'AyL'
    },
    {
      id: 40,
      nombre: 'Arquitectura de Software II',
      año: 5,
      cuatrimestre: 1,
      correlativas: ['Arquitectura de Software I'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'ISBDySI'
    },
    {
      id: 41,
      nombre: 'Arquitectura de Computadoras',
      año: 5,
      cuatrimestre: 2,
      correlativas: ['Sistemas Distribuidos y Tiempo Real'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'ASOyR'
    },
    {
      id: 42,
      nombre: 'Materia Optativa II',
      año: 5,
      cuatrimestre: 2,
      correlativas: [],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'Optativa'
    },
    {
      id: 43,
      nombre: 'Parseo y generación de código',
      año: 5,
      cuatrimestre: 2,
      correlativas: ['Teoría de la Computación'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'AyL'
    },
    {
      id: 44,
      nombre: 'Ejercicio Profesional',
      año: 5,
      cuatrimestre: 2,
      correlativas: [],
      cargaHoraria: 3,
      cargaHorariaTotal: 48,
      area: 'APyS'
    },
    {
      id: 45,
      nombre: 'Tecnología y Sociedad',
      año: 5,
      cuatrimestre: 2,
      correlativas: [],
      cargaHoraria: 3,
      cargaHorariaTotal: 48,
      area: 'APyS'
    }
  ],
  'Tecnicatura en Inteligencia Artificial': [
    // Primer cuatrimestre
    {
      id: 1,
      nombre: 'Matemática para informática I',
      año: 1,
      cuatrimestre: 1,
      correlativas: [],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'CB'
    },
    {
      id: 2,
      nombre: 'Introducción a lógica y problemas computacionales',
      año: 1,
      cuatrimestre: 1,
      correlativas: [],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'AyL'
    },
    {
      id: 3,
      nombre: 'Introducción a la inteligencia artificial',
      año: 1,
      cuatrimestre: 1,
      correlativas: [],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'IA'
    },
    {
      id: 4,
      nombre: 'Nuevos entornos y lenguajes: la producción del conocimiento en la cultura digital',
      año: 1,
      cuatrimestre: 1,
      correlativas: [],
      cargaHoraria: 2,
      cargaHorariaTotal: 32,
      area: 'Gral.'
    },
    // Segundo cuatrimestre
    {
      id: 5,
      nombre: 'Álgebra lineal',
      año: 1,
      cuatrimestre: 2,
      correlativas: ['Matemática para informática I'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'CB'
    },
    {
      id: 6,
      nombre: 'Cálculo',
      año: 1,
      cuatrimestre: 2,
      correlativas: ['Matemática para informática I'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'CB'
    },
    {
      id: 7,
      nombre: 'Taller de Programación I',
      año: 1,
      cuatrimestre: 2,
      correlativas: ['Introducción a lógica y problemas computacionales'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'AyL'
    },
    {
      id: 8,
      nombre: 'Tecnología y sociedad',
      año: 1,
      cuatrimestre: 2,
      correlativas: [],
      cargaHoraria: 3,
      cargaHorariaTotal: 48,
      area: 'Gral.'
    },
    {
      id: 9,
      nombre: 'Inglés I',
      año: 1,
      cuatrimestre: 2,
      correlativas: [],
      cargaHoraria: 2,
      cargaHorariaTotal: 32,
      area: 'Gral.'
    },
    // Tercer cuatrimestre
    {
      id: 10,
      nombre: 'Bases de datos',
      año: 2,
      cuatrimestre: 1,
      correlativas: ['Álgebra lineal'],
      cargaHoraria: 6,
      cargaHorariaTotal: 96,
      area: 'ISBDySI'
    },
    {
      id: 11,
      nombre: 'Probabilidad y estadística',
      año: 2,
      cuatrimestre: 1,
      correlativas: ['Álgebra lineal', 'Cálculo'],
      cargaHoraria: 6,
      cargaHorariaTotal: 96,
      area: 'CB'
    },
    {
      id: 12,
      nombre: 'Taller de Programación II',
      año: 2,
      cuatrimestre: 1,
      correlativas: ['Taller de Programación I'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'AyL'
    },
    {
      id: 13,
      nombre: 'Fundamentos de redes neuronales',
      año: 2,
      cuatrimestre: 1,
      correlativas: ['Introducción a la inteligencia artificial', 'Álgebra lineal', 'Taller de Programación I'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'IA'
    },
    // Cuarto cuatrimestre
    {
      id: 14,
      nombre: 'Fundamentos de ciencias de datos',
      año: 2,
      cuatrimestre: 2,
      correlativas: ['Introducción a la inteligencia artificial', 'Álgebra lineal', 'Cálculo'],
      cargaHoraria: 3,
      cargaHorariaTotal: 48,
      area: 'IA'
    },
    {
      id: 15,
      nombre: 'Aprendizaje Automático',
      año: 2,
      cuatrimestre: 2,
      correlativas: ['Probabilidad y estadística', 'Fundamentos de redes neuronales'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'IA'
    },
    {
      id: 16,
      nombre: 'Electiva',
      año: 2,
      cuatrimestre: 2,
      correlativas: ['Probabilidad y estadística', 'Fundamentos de redes neuronales'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'Elec.'
    },
    {
      id: 17,
      nombre: 'Taller de Programación III',
      año: 2,
      cuatrimestre: 2,
      correlativas: ['Taller de Programación II'],
      cargaHoraria: 4,
      cargaHorariaTotal: 64,
      area: 'AyL'
    },
    {
      id: 18,
      nombre: 'Inglés II',
      año: 2,
      cuatrimestre: 2,
      correlativas: ['Inglés I'],
      cargaHoraria: 2,
      cargaHorariaTotal: 32,
      area: 'Gral.'
    },
    // Quinto cuatrimestre
    {
      id: 19,
      nombre: 'Materia UNAHUR',
      año: 3,
      cuatrimestre: 1,
      correlativas: [],
      cargaHoraria: 2,
      cargaHorariaTotal: 32,
      area: 'Gral.'
    },
    {
      id: 20,
      nombre: 'Aprendizaje Automático Avanzado',
      año: 3,
      cuatrimestre: 1,
      correlativas: ['Aprendizaje Automático', 'Taller de Programación III'],
      cargaHoraria: 6,
      cargaHorariaTotal: 96,
      area: 'IA'
    },
    {
      id: 21,
      nombre: 'Procesamiento de Imágenes y Visión por Computadora',
      año: 3,
      cuatrimestre: 1,
      correlativas: ['Aprendizaje Automático', 'Taller de Programación III'],
      cargaHoraria: 6,
      cargaHorariaTotal: 96,
      area: 'IA'
    },
    {
      id: 22,
      nombre: 'Proyecto integrador',
      año: 3,
      cuatrimestre: 1,
      correlativas: ['Aprendizaje Automático', 'Taller de Programación III'],
      cargaHoraria: 5,
      cargaHorariaTotal: 80,
      area: 'IA'
    }
  ]
};

/**
 * Verifica si un estudiante cumple con las correlatividades para cursar una materia
 * @param {string} nombreMateria - Nombre de la materia a verificar
 * @param {Array} situacionAcademica - Situación académica del estudiante
 * @param {string} carrera - Carrera del estudiante
 * @returns {Object} Resultado de la verificación
 */
export function verificarCorrelatividades(nombreMateria, situacionAcademica, carrera) {
  const materiasCarrera = MATERIAS_CARRERA[carrera] || [];
  const materia = materiasCarrera.find(m => m.nombre === nombreMateria);
  
  if (!materia) {
    return {
      puedeCorrer: false,
      motivo: 'Materia no encontrada',
      correlativasPendientes: [],
      correlativasCumplidas: []
    };
  }

  // Si no tiene correlatividades, puede cursar
  if (materia.correlativas.length === 0) {
    return {
      puedeCorrer: true,
      motivo: 'Sin correlatividades requeridas',
      correlativasPendientes: [],
      correlativasCumplidas: []
    };
  }

  const correlativasPendientes = [];
  const correlativasCumplidas = [];

  // Verificar cada correlativa
  for (const correlativa of materia.correlativas) {
    const estadoCorrelativa = situacionAcademica.find(m => m.nombre === correlativa);
    
    if (!estadoCorrelativa) {
      correlativasPendientes.push({
        nombre: correlativa,
        motivo: 'No cursada'
      });
    } else if (estadoCorrelativa.estado === ESTADOS_MATERIA.APROBADA || 
               estadoCorrelativa.estado === ESTADOS_MATERIA.REGULARIZADA) {
      correlativasCumplidas.push({
        nombre: correlativa,
        estado: estadoCorrelativa.estado
      });
    } else {
      correlativasPendientes.push({
        nombre: correlativa,
        motivo: `Estado actual: ${estadoCorrelativa.estado}`
      });
    }
  }

  const puedeCorrer = correlativasPendientes.length === 0;

  return {
    puedeCorrer,
    motivo: puedeCorrer ? 'Correlatividades cumplidas' : 'Faltan correlatividades',
    correlativasPendientes,
    correlativasCumplidas
  };
}

/**
 * Calcula qué materias puede cursar un estudiante
 * @param {Array} situacionAcademica - Situación académica actual del estudiante
 * @param {string} carrera - Carrera del estudiante
 * @param {number} maxCargaHoraria - Carga horaria máxima semanal (opcional)
 * @returns {Array} Lista de materias disponibles para cursar
 */
export function calcularMateriasDisponibles(situacionAcademica, carrera, maxCargaHoraria = null) {
  const materiasCarrera = MATERIAS_CARRERA[carrera] || [];
  const materiasDisponibles = [];

  // Obtener materias ya cursadas/aprobadas
  const materiasYaCursadas = situacionAcademica
    .filter(m => [ESTADOS_MATERIA.APROBADA, ESTADOS_MATERIA.REGULARIZADA, ESTADOS_MATERIA.CURSANDO]
      .includes(m.estado))
    .map(m => m.nombre);

  // Verificar cada materia de la carrera
  for (const materia of materiasCarrera) {
    // Saltear si ya está cursada/aprobada
    if (materiasYaCursadas.includes(materia.nombre)) {
      continue;
    }

    const verificacion = verificarCorrelatividades(materia.nombre, situacionAcademica, carrera);
    
    if (verificacion.puedeCorrer) {
      materiasDisponibles.push({
        ...materia,
        estado: ESTADOS_MATERIA.PUEDE_CURSAR,
        verificacion
      });
    }
  }

  // Si se especifica carga horaria máxima, filtrar combinaciones válidas
  if (maxCargaHoraria) {
    return filtrarPorCargaHoraria(materiasDisponibles, maxCargaHoraria);
  }

  return materiasDisponibles.sort((a, b) => {
    // Ordenar por año y luego por cuatrimestre
    if (a.año !== b.año) return a.año - b.año;
    return a.cuatrimestre - b.cuatrimestre;
  });
}

/**
 * Filtra materias por carga horaria máxima
 * @param {Array} materias - Lista de materias disponibles
 * @param {number} maxCargaHoraria - Carga horaria máxima semanal
 * @returns {Array} Combinaciones posibles de materias
 */
function filtrarPorCargaHoraria(materias, maxCargaHoraria) {
  // Implementación básica: devolver materias que individualmente no excedan el límite
  // En una implementación más avanzada, se podrían calcular combinaciones óptimas
  return materias.filter(materia => materia.cargaHoraria <= maxCargaHoraria);
}

/**
 * Simula el escenario "¿Qué pasa si regularizo X materias?"
 * @param {Array} situacionActual - Situación académica actual
 * @param {Array} materiasARegularizar - Nombres de materias que se regularizarían
 * @param {string} carrera - Carrera del estudiante
 * @returns {Object} Análisis del escenario
 */
export function simularEscenario(situacionActual, materiasARegularizar, carrera) {
  // Crear situación hipotética
  const situacionHipotetica = [...situacionActual];
  
  // Actualizar materias que se regularizarían
  for (const nombreMateria of materiasARegularizar) {
    const materiaIndex = situacionHipotetica.findIndex(m => m.nombre === nombreMateria);
    if (materiaIndex !== -1) {
      situacionHipotetica[materiaIndex] = {
        ...situacionHipotetica[materiaIndex],
        estado: ESTADOS_MATERIA.REGULARIZADA
      };
    } else {
      // Si no existe, agregarla como regularizada
      situacionHipotetica.push({
        nombre: nombreMateria,
        estado: ESTADOS_MATERIA.REGULARIZADA,
        año: new Date().getFullYear(),
        cuatrimestre: 2 // Suponer cuatrimestre actual
      });
    }
  }

  // Calcular nuevas materias disponibles
  const materiasDisponiblesActuales = calcularMateriasDisponibles(situacionActual, carrera);
  const materiasDisponiblesNuevas = calcularMateriasDisponibles(situacionHipotetica, carrera);

  // Encontrar materias que se desbloquearían
  const materiasDesbloqueadas = materiasDisponiblesNuevas.filter(
    nuevaMateria => !materiasDisponiblesActuales.some(
      actualMateria => actualMateria.nombre === nuevaMateria.nombre
    )
  );

  return {
    situacionHipotetica,
    materiasDisponiblesActuales: materiasDisponiblesActuales.length,
    materiasDisponiblesNuevas: materiasDisponiblesNuevas.length,
    materiasDesbloqueadas,
    beneficio: materiasDesbloqueadas.length
  };
}

/**
 * Calcula estadísticas de progreso académico
 * @param {Array} situacionAcademica - Situación académica del estudiante
 * @param {string} carrera - Carrera del estudiante
 * @returns {Object} Estadísticas académicas
 */
export function calcularEstadisticasProgreso(situacionAcademica, carrera) {
  const materiasCarrera = MATERIAS_CARRERA[carrera] || [];
  const totalMaterias = materiasCarrera.length;
  
  const aprobadas = situacionAcademica.filter(m => m.estado === ESTADOS_MATERIA.APROBADA).length;
  const regularizadas = situacionAcademica.filter(m => m.estado === ESTADOS_MATERIA.REGULARIZADA).length;
  const cursando = situacionAcademica.filter(m => m.estado === ESTADOS_MATERIA.CURSANDO).length;
  
  const materiasDisponibles = calcularMateriasDisponibles(situacionAcademica, carrera);
  
  // Análisis por año
  const progresoPorAño = {};
  for (let año = 1; año <= 5; año++) {
    const materiasDelAño = materiasCarrera.filter(m => m.año === año);
    const aprobadasDelAño = situacionAcademica.filter(
      m => m.estado === ESTADOS_MATERIA.APROBADA && 
      materiasDelAño.some(mc => mc.nombre === m.nombre)
    ).length;
    const regularizadasDelAño = situacionAcademica.filter(
      m => m.estado === ESTADOS_MATERIA.REGULARIZADA && 
      materiasDelAño.some(mc => mc.nombre === m.nombre)
    ).length;
    
    progresoPorAño[año] = {
      total: materiasDelAño.length,
      aprobadas: aprobadasDelAño,
      regularizadas: regularizadasDelAño,
      faltantes: materiasDelAño.length - aprobadasDelAño - regularizadasDelAño,
      porcentaje: materiasDelAño.length > 0 ? 
        ((aprobadasDelAño + regularizadasDelAño) / materiasDelAño.length) * 100 : 0
    };
  }

  return {
    totalMaterias,
    aprobadas,
    regularizadas,
    cursando,
    faltantes: totalMaterias - aprobadas - regularizadas - cursando,
    porcentajeAvance: (aprobadas / totalMaterias) * 100,
    materiasDisponibles: materiasDisponibles.length,
    progresoPorAño
  };
}