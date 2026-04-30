import config from '../config/config.js';

const API_BASE_URL = config.API_BASE_URL;

// Datos mock para la presentación
const ESTUDIANTES_MOCK = {
  1: {
    id: 1,
    nombre: 'Juan',
    apellido: 'Pérez',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    carrera: 'Licenciatura en Informática',
    planEstudio: 'Plan 2026',
    email: 'juan.perez@unahur.edu.ar'
  },
  2: {
    id: 2,
    nombre: 'María',
    apellido: 'González',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face',
    carrera: 'Licenciatura en Informática',
    planEstudio: 'Plan 2026',
    email: 'maria.gonzalez@unahur.edu.ar'
  },
  3: {
    id: 3,
    nombre: 'Carlos',
    apellido: 'López',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    carrera: 'Tecnicatura en Inteligencia Artificial',
    planEstudio: 'Plan 2024',
    email: 'carlos.lopez@unahur.edu.ar'
  }
};

const MATERIAS_MOCK = {
  1: { // Juan Pérez - Estudiante avanzado
    carrera: 'Licenciatura en Informática',
    planEstudio: 'Plan 2026',
    estadisticas: {
      materiasAprobadas: 8,
      materiasRegularizadas: 1,
      materiasCursando: 3,
      materiasSinCursar: 33
    },
    situacionAcademica: [
      { id: 1, nombre: 'Introducción a la Programación', año: 1, cuatrimestre: 1, estado: 'Aprobada', nota: 7, fecha: '2024-07-18' },
      { id: 2, nombre: 'Organización de Computadoras', año: 1, cuatrimestre: 1, estado: 'Aprobada', nota: 8, fecha: '2024-12-10' },
      { id: 3, nombre: 'Matemática I', año: 1, cuatrimestre: 1, estado: 'Aprobada', nota: 9, fecha: '2024-12-15' },
      { id: 4, nombre: 'Estructuras de Datos', año: 1, cuatrimestre: 2, estado: 'Aprobada', nota: 8, fecha: '2025-07-20' },
      { id: 5, nombre: 'Programación con Objetos I', año: 1, cuatrimestre: 2, estado: 'Aprobada', nota: 9, fecha: '2025-07-22' },
      { id: 6, nombre: 'Bases de Datos', año: 1, cuatrimestre: 2, estado: 'Aprobada', nota: 9, fecha: '2025-12-12' },
      { id: 7, nombre: 'Inglés I', año: 1, cuatrimestre: 2, estado: 'Aprobada', nota: 8, fecha: '2025-12-18' },
      { id: 8, nombre: 'Nuevos Entornos y Lenguajes', año: 1, cuatrimestre: 1, estado: 'Aprobada', nota: 10, fecha: '2024-07-15' },
      { id: 9, nombre: 'Matemática II', año: 2, cuatrimestre: 1, estado: 'Regularizada', nota: null, fecha: null },
      { id: 10, nombre: 'Programación con Objetos II', año: 2, cuatrimestre: 1, estado: 'Cursando', nota: null, fecha: null },
      { id: 11, nombre: 'Redes de Computadoras', año: 2, cuatrimestre: 1, estado: 'Cursando', nota: null, fecha: null },
      { id: 12, nombre: 'Sistemas Operativos', año: 2, cuatrimestre: 1, estado: 'Cursando', nota: null, fecha: null }
    ]
  },
  2: { // María González - Estudiante intermedio
    carrera: 'Licenciatura en Informática',
    planEstudio: 'Plan 2026',
    estadisticas: {
      materiasAprobadas: 5,
      materiasRegularizadas: 2,
      materiasCursando: 2,
      materiasSinCursar: 36
    },
    situacionAcademica: [
      { id: 1, nombre: 'Matemática I', año: 1, cuatrimestre: 1, estado: 'Aprobada', nota: 8, fecha: '2024-07-15' },
      { id: 2, nombre: 'Introducción a la Programación', año: 1, cuatrimestre: 1, estado: 'Aprobada', nota: 7, fecha: '2024-07-18' },
      { id: 3, nombre: 'Organización de Computadoras', año: 1, cuatrimestre: 1, estado: 'Aprobada', nota: 8, fecha: '2024-12-10' },
      { id: 4, nombre: 'Estructuras de Datos', año: 1, cuatrimestre: 2, estado: 'Regularizada', nota: null, fecha: null },
      { id: 5, nombre: 'Programación con Objetos I', año: 1, cuatrimestre: 2, estado: 'Cursando', nota: null, fecha: null },
      { id: 6, nombre: 'Matemática II', año: 2, cuatrimestre: 1, estado: 'Aprobada', nota: 7, fecha: '2025-07-22' },
      { id: 7, nombre: 'Algoritmos', año: 2, cuatrimestre: 2, estado: 'Aprobada', nota: 8, fecha: '2025-12-12' },
      { id: 8, nombre: 'Bases de Datos', año: 1, cuatrimestre: 2, estado: 'Cursando', nota: null, fecha: null },
      { id: 9, nombre: 'Inglés I', año: 1, cuatrimestre: 2, estado: 'Regularizada', nota: null, fecha: null }
    ]
  },
  3: { // Carlos López - Estudiante principiante IA
    carrera: 'Tecnicatura en Inteligencia Artificial',
    planEstudio: 'Plan 2024',
    estadisticas: {
      materiasAprobadas: 2,
      materiasRegularizadas: 0,
      materiasCursando: 3,
      materiasSinCursar: 17
    },
    situacionAcademica: [
      { id: 1, nombre: 'Introducción a la inteligencia artificial', año: 1, cuatrimestre: 1, estado: 'Aprobada', nota: 9, fecha: '2025-07-15' },
      { id: 2, nombre: 'Matemática para informática I', año: 1, cuatrimestre: 1, estado: 'Aprobada', nota: 10, fecha: '2025-07-18' },
      { id: 3, nombre: 'Álgebra lineal', año: 1, cuatrimestre: 2, estado: 'Cursando', nota: null, fecha: null },
      { id: 4, nombre: 'Taller de Programación I', año: 1, cuatrimestre: 2, estado: 'Cursando', nota: null, fecha: null },
      { id: 5, nombre: 'Cálculo', año: 1, cuatrimestre: 2, estado: 'Cursando', nota: null, fecha: null }
    ]
  }
};

/**
 * Servicio para gestionar estudiantes
 */
class EstudianteService {
  
  /**
   * Obtiene todos los estudiantes
   */
  static async obtenerTodosEstudiantes() {
    // Simulamos delay de red
    await new Promise(resolve => setTimeout(resolve, 300));
    return Object.values(ESTUDIANTES_MOCK);
  }

  /**
   * Obtiene información completa de un estudiante específico
   */
  static async obtenerEstudiante(id) {
    // Simulamos delay de red
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const estudiante = ESTUDIANTES_MOCK[id];
    const materias = MATERIAS_MOCK[id];
    
    if (!estudiante) {
      throw new Error(`Estudiante con ID ${id} no encontrado`);
    }
    
    if (!materias) {
      throw new Error(`Materias del estudiante ${id} no encontradas`);
    }
    
    // Calcular promedio de materias aprobadas
    const materiasAprobadas = materias.situacionAcademica.filter(m => m.estado === 'Aprobada' && m.nota);
    const promedio = materiasAprobadas.length > 0 
      ? (materiasAprobadas.reduce((sum, m) => sum + m.nota, 0) / materiasAprobadas.length).toFixed(1)
      : 0;
    
    // Combinar datos del estudiante con su situación académica
    return {
      ...estudiante,
      ...materias,
      promedio: parseFloat(promedio)
    };
  }

  /**
   * Obtiene las materias y situación académica del estudiante
   */
  static async obtenerMateriasEstudiante(id) {
    // Simulamos delay de red
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const materias = MATERIAS_MOCK[id];
    if (!materias) {
      throw new Error(`Materias del estudiante ${id} no encontradas`);
    }
    return materias;
  }

  /**
   * Obtiene el plan de estudios del estudiante
   */
  static async obtenerPlanEstudios(id) {
    // Simulamos delay de red
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const materias = MATERIAS_MOCK[id];
    if (!materias) {
      throw new Error(`Plan de estudios del estudiante ${id} no encontrado`);
    }
    
    return {
      carrera: materias.carrera,
      planEstudio: materias.planEstudio,
      materias: materias.situacionAcademica
    };
  }

  /**
   * MÉTODO FALLBACK: Intenta conectar al backend, si falla usa datos mock
   */
  static async obtenerEstudianteConFallback(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/estudiantes/${id}`);
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn(`Backend no disponible, usando datos mock para estudiante ${id}`);
      return this.obtenerEstudiante(id);
    }
  }
}

export default EstudianteService;