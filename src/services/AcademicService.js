/**
 * Servicio para gestionar la lógica académica y de correlatividades
 * Maneja el cálculo de materias disponibles para cursar basado en la situación académica del estudiante
 */

import api from '../api/axiosConfig.js';
import EstudianteService from './EstudianteService.js';

// Estados posibles de una materia
export const ESTADOS_MATERIA = {
  APROBADA: 'Aprobada',
  REGULARIZADA: 'Regularizada',
  CURSANDO: 'Cursando',
  PUEDE_CURSAR: 'Puede Cursar',
  NO_DISPONIBLE: 'No Disponible'
};

/**
 * Servicio académico principal - Conectado al Backend
 */
class AcademicService {
  
  /**
   * Obtiene el plan de materias completo de una carrera desde el backend
   */
  static async obtenerPlanMateriasCarrera(nombreCarrera) {
    try {
      // Por ahora mantenemos los datos mock hasta que el backend tenga los endpoints completos
      // En el futuro esto vendría de: /api/carreras/{carrera}/plan
      const planesMock = await this.getPlanesEstudioMock();
      return planesMock[nombreCarrera] || [];
    } catch (error) {
      console.error(`Error al obtener plan de ${nombreCarrera}:`, error);
      throw new Error(`Error al cargar plan de estudios de ${nombreCarrera}`);
    }
  }

  /**
   * Obtiene la situación académica completa de un estudiante
   */
  static async obtenerSituacionAcademica(estudianteId) {
    try {
      const response = await EstudianteService.obtenerMateriasEstudiante(estudianteId);
      return response;
    } catch (error) {
      console.error(`Error al obtener situación académica del estudiante ${estudianteId}:`, error);
      throw new Error(`Error al cargar situación académica del estudiante ${estudianteId}`);
    }
  }

  /**
   * Calcula materias disponibles para un estudiante
   */
  static async calcularMateriasDisponibles(estudianteId, maxCargaHoraria = null) {
    try {
      const situacionAcademica = await this.obtenerSituacionAcademica(estudianteId);
      const planMaterias = await this.obtenerPlanMateriasCarrera(situacionAcademica.carrera);
      
      return calcularMateriasDisponibles(
        situacionAcademica.situacionAcademica, 
        situacionAcademica.carrera, 
        maxCargaHoraria,
        planMaterias
      );
    } catch (error) {
      console.error(`Error al calcular materias disponibles para estudiante ${estudianteId}:`, error);
      throw new Error(`Error al calcular materias disponibles`);
    }
  }

  /**
   * Analiza el progreso académico de un estudiante
   */
  static async analizarProgresoAcademico(estudianteId) {
    try {
      const situacionAcademica = await this.obtenerSituacionAcademica(estudianteId);
      const planMaterias = await this.obtenerPlanMateriasCarrera(situacionAcademica.carrera);
      
      return calcularEstadisticasProgreso(
        situacionAcademica.situacionAcademica,
        situacionAcademica.carrera,
        planMaterias
      );
    } catch (error) {
      console.error(`Error al analizar progreso del estudiante ${estudianteId}:`, error);
      throw new Error(`Error al analizar progreso académico`);
    }
  }

  /**
   * Simula escenarios académicos "¿Qué pasa si...?"
   */
  static async simularEscenarioAcademico(estudianteId, materiasARegularizar) {
    try {
      const situacionAcademica = await this.obtenerSituacionAcademica(estudianteId);
      const planMaterias = await this.obtenerPlanMateriasCarrera(situacionAcademica.carrera);
      
      return simularEscenario(
        situacionAcademica.situacionAcademica,
        materiasARegularizar,
        situacionAcademica.carrera,
        planMaterias
      );
    } catch (error) {
      console.error(`Error al simular escenario para estudiante ${estudianteId}:`, error);
      throw new Error(`Error al simular escenario académico`);
    }
  }

  /**
   * Obtiene todas las carreras disponibles
   */
  static async obtenerCarrerasDisponibles() {
    try {
      // En el futuro esto vendría de: /api/carreras
      const estudiantes = await EstudianteService.obtenerTodosEstudiantes();
      const carreras = [...new Set(estudiantes.map(e => e.carrera))];
      
      return carreras.map(carrera => ({
        nombre: carrera,
        planEstudio: this.obtenerPlanPorCarrera(carrera)
      }));
    } catch (error) {
      console.error('Error al obtener carreras disponibles:', error);
      throw new Error('Error al cargar carreras disponibles');
    }
  }

  /**
   * Método auxiliar para obtener el plan de estudios por carrera
   */
  static obtenerPlanPorCarrera(carrera) {
    const planes = {
      'Licenciatura en Informática': 'Plan 2026',
      'Tecnicatura en Inteligencia Artificial': 'Plan 2024',
      'Tecnicatura en Programación': 'Plan 2025',
      'Licenciatura en Biotecnología': 'Plan 2026'
    };
    return planes[carrera] || 'Plan Estándar';
  }

  /**
   * Mock data temporal - En el futuro esto vendrá del backend
   */
  static async getPlanesEstudioMock() {
    // Esta función contiene los datos mock que eventualmente vendrán del backend
    // Mantenemos una versión simplificada para las funciones de cálculo
    return {
      'Licenciatura en Informática': [
        // Primer año
        { id: 1, nombre: 'Matemática I', año: 1, cuatrimestre: 1, correlativas: [], cargaHoraria: 8, area: 'CB' },
        { id: 2, nombre: 'Introducción a la Programación', año: 1, cuatrimestre: 1, correlativas: [], cargaHoraria: 8, area: 'AyL' },
        { id: 3, nombre: 'Organización de Computadoras', año: 1, cuatrimestre: 1, correlativas: [], cargaHoraria: 6, area: 'ASOyR' },
        { id: 4, nombre: 'Nuevos Entornos y Lenguajes', año: 1, cuatrimestre: 1, correlativas: [], cargaHoraria: 2, area: 'Otros' },
        { id: 5, nombre: 'Estructuras de Datos', año: 1, cuatrimestre: 2, correlativas: ['Introducción a la Programación'], cargaHoraria: 8, area: 'TC' },
        { id: 6, nombre: 'Programación con Objetos I', año: 1, cuatrimestre: 2, correlativas: ['Introducción a la Programación'], cargaHoraria: 8, area: 'AyL' },
        { id: 7, nombre: 'Bases de Datos', año: 1, cuatrimestre: 2, correlativas: ['Introducción a la Programación'], cargaHoraria: 6, area: 'ISBDySI' },
        { id: 8, nombre: 'Inglés I', año: 1, cuatrimestre: 2, correlativas: [], cargaHoraria: 2, area: 'Otros' },
        // Segundo Año
        { id: 9, nombre: 'Matemática II', año: 2, cuatrimestre: 1, correlativas: ['Matemática I'], cargaHoraria: 4, area: 'CB' },
        { id: 10, nombre: 'Programación con Objetos II', año: 2, cuatrimestre: 1, correlativas: ['Programación con Objetos I'], cargaHoraria: 6, area: 'AyL' },
        { id: 11, nombre: 'Redes de Computadoras', año: 2, cuatrimestre: 1, correlativas: ['Organización de Computadoras'], cargaHoraria: 6, area: 'ASOyR' },
        { id: 12, nombre: 'Sistemas Operativos', año: 2, cuatrimestre: 1, correlativas: ['Organización de Computadoras'], cargaHoraria: 6, area: 'ASOyR' },
        { id: 13, nombre: 'Programación Funcional', año: 2, cuatrimestre: 2, correlativas: ['Programación con Objetos I'], cargaHoraria: 4, area: 'AyL' },
        { id: 14, nombre: 'Construcción de Interfaces de Usuario', año: 2, cuatrimestre: 2, correlativas: ['Programación con Objetos II'], cargaHoraria: 6, area: 'ISBDySI' },
        { id: 15, nombre: 'Algoritmos', año: 2, cuatrimestre: 2, correlativas: ['Estructuras de Datos', 'Matemática II'], cargaHoraria: 6, area: 'AyL' },
        { id: 16, nombre: 'Estrategias de Persistencia', año: 2, cuatrimestre: 2, correlativas: ['Bases de Datos', 'Programación con Objetos II'], cargaHoraria: 6, area: 'ISBDySI' },
        // Más materias...
        { id: 27, nombre: 'Desarrollo de Aplicaciones', año: 3, cuatrimestre: 2, correlativas: ['Construcción de Interfaces de Usuario', 'Estrategias de Persistencia'], cargaHoraria: 6, area: 'ISBDySI' },
      ],
      'Tecnicatura en Inteligencia Artificial': [
        { id: 1, nombre: 'Matemática I', año: 1, cuatrimestre: 1, correlativas: [], cargaHoraria: 4, area: 'CB' },
        { id: 2, nombre: 'Introducción a la Programación', año: 1, cuatrimestre: 1, correlativas: [], cargaHoraria: 4, area: 'AyL' },
        { id: 3, nombre: 'Organización de Computadoras', año: 1, cuatrimestre: 1, correlativas: [], cargaHoraria: 4, area: 'ASOyR' },
        { id: 4, nombre: 'Nuevos Entornos y Lenguajes', año: 1, cuatrimestre: 1, correlativas: [], cargaHoraria: 4, area: 'Otros' },
        { id: 5, nombre: 'Álgebra Lineal', año: 1, cuatrimestre: 2, correlativas: ['Matemática I'], cargaHoraria: 4, area: 'CB' },
        { id: 6, nombre: 'Estadística y Probabilidad', año: 1, cuatrimestre: 2, correlativas: ['Matemática I'], cargaHoraria: 4, area: 'CB' },
        { id: 7, nombre: 'Machine Learning I', año: 2, cuatrimestre: 1, correlativas: ['Álgebra Lineal', 'Estadística y Probabilidad'], cargaHoraria: 6, area: 'IA' },
      ],
      'Tecnicatura en Programación': [
        { id: 1, nombre: 'Lógica y Matemática Discreta', año: 1, cuatrimestre: 1, correlativas: [], cargaHoraria: 4, area: 'CB' },
        { id: 2, nombre: 'Introducción a la Programación', año: 1, cuatrimestre: 1, correlativas: [], cargaHoraria: 6, area: 'AyL' },
        { id: 3, nombre: 'Programación Orientada a Objetos', año: 1, cuatrimestre: 2, correlativas: ['Introducción a la Programación'], cargaHoraria: 6, area: 'AyL' },
        { id: 4, nombre: 'Estructuras de Datos y Algoritmos', año: 1, cuatrimestre: 2, correlativas: ['Introducción a la Programación'], cargaHoraria: 6, area: 'AyL' },
        { id: 5, nombre: 'Base de Datos', año: 2, cuatrimestre: 1, correlativas: ['Programación Orientada a Objetos'], cargaHoraria: 6, area: 'BD' },
        { id: 6, nombre: 'Desarrollo Web', año: 2, cuatrimestre: 1, correlativas: ['Programación Orientada a Objetos'], cargaHoraria: 6, area: 'Web' },
        { id: 7, nombre: 'Desarrollo de Aplicaciones', año: 2, cuatrimestre: 2, correlativas: ['Base de Datos', 'Desarrollo Web'], cargaHoraria: 8, area: 'App' },
        { id: 8, nombre: 'Testing y Calidad de Software', año: 2, cuatrimestre: 2, correlativas: ['Desarrollo Web'], cargaHoraria: 4, area: 'QA' },
      ],
      'Licenciatura en Biotecnología': [
        { id: 1, nombre: 'Química General', año: 1, cuatrimestre: 1, correlativas: [], cargaHoraria: 6, area: 'CB' },
        { id: 2, nombre: 'Matemática', año: 1, cuatrimestre: 1, correlativas: [], cargaHoraria: 6, area: 'CB' },
        { id: 3, nombre: 'Biología General', año: 1, cuatrimestre: 1, correlativas: [], cargaHoraria: 6, area: 'Bio' },
        { id: 4, nombre: 'Física', año: 1, cuatrimestre: 2, correlativas: ['Matemática'], cargaHoraria: 6, area: 'CB' },
        { id: 5, nombre: 'Química Orgánica', año: 1, cuatrimestre: 2, correlativas: ['Química General'], cargaHoraria: 6, area: 'Quim' },
        { id: 6, nombre: 'Biología Molecular', año: 2, cuatrimestre: 1, correlativas: ['Biología General', 'Química Orgánica'], cargaHoraria: 8, area: 'Bio' },
      ]
    };
  }
}

/**
 * Verifica si un estudiante cumple con las correlatividades para cursar una materia
 */
export function verificarCorrelatividades(nombreMateria, situacionAcademica, carrera, planMaterias = null) {
  // Si no se proporciona plan, usar el método estático de AcademicService
  if (!planMaterias) {
    // En un uso real, esto debería ser asíncrono, pero para mantener compatibilidad...
    console.warn('Función llamada sin plan de materias - usar versión asíncrona');
    return {
      puedeCorrer: false,
      motivo: 'Datos de plan no disponibles',
      correlativasPendientes: [],
      correlativasCumplidas: []
    };
  }

  const materia = planMaterias.find(m => m.nombre === nombreMateria);
  
  if (!materia) {
    return {
      puedeCorrer: false,
      motivo: 'Materia no encontrada',
      correlativasPendientes: [],
      correlativasCumplidas: []
    };
  }

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
 */
export function calcularMateriasDisponibles(situacionAcademica, carrera, maxCargaHoraria = null, planMaterias = null) {
  if (!planMaterias) {
    return [];
  }

  const materiasDisponibles = [];
  const materiasYaCursadas = situacionAcademica
    .filter(m => [ESTADOS_MATERIA.APROBADA, ESTADOS_MATERIA.REGULARIZADA, ESTADOS_MATERIA.CURSANDO]
      .includes(m.estado))
    .map(m => m.nombre);

  for (const materia of planMaterias) {
    if (materiasYaCursadas.includes(materia.nombre)) {
      continue;
    }

    const verificacion = verificarCorrelatividades(materia.nombre, situacionAcademica, carrera, planMaterias);
    
    if (verificacion.puedeCorrer) {
      materiasDisponibles.push({
        ...materia,
        estado: ESTADOS_MATERIA.PUEDE_CURSAR,
        verificacion
      });
    }
  }

  if (maxCargaHoraria) {
    return materiasDisponibles.filter(materia => materia.cargaHoraria <= maxCargaHoraria);
  }

  return materiasDisponibles.sort((a, b) => {
    if (a.año !== b.año) return a.año - b.año;
    return a.cuatrimestre - b.cuatrimestre;
  });
}

/**
 * Simula el escenario "¿Qué pasa si regularizo X materias?"
 */
export function simularEscenario(situacionActual, materiasARegularizar, carrera, planMaterias = null) {
  if (!planMaterias) {
    return { error: 'Plan de materias no disponible' };
  }

  const situacionHipotetica = [...situacionActual];
  
  for (const nombreMateria of materiasARegularizar) {
    const materiaIndex = situacionHipotetica.findIndex(m => m.nombre === nombreMateria);
    if (materiaIndex !== -1) {
      situacionHipotetica[materiaIndex] = {
        ...situacionHipotetica[materiaIndex],
        estado: ESTADOS_MATERIA.REGULARIZADA
      };
    } else {
      situacionHipotetica.push({
        nombre: nombreMateria,
        estado: ESTADOS_MATERIA.REGULARIZADA,
        año: new Date().getFullYear(),
        cuatrimestre: 2
      });
    }
  }

  const materiasDisponiblesActuales = calcularMateriasDisponibles(situacionActual, carrera, null, planMaterias);
  const materiasDisponiblesNuevas = calcularMateriasDisponibles(situacionHipotetica, carrera, null, planMaterias);

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
 */
export function calcularEstadisticasProgreso(situacionAcademica, carrera, planMaterias = null) {
  if (!planMaterias) {
    return { error: 'Plan de materias no disponible' };
  }

  const totalMaterias = planMaterias.length;
  const aprobadas = situacionAcademica.filter(m => m.estado === ESTADOS_MATERIA.APROBADA).length;
  const regularizadas = situacionAcademica.filter(m => m.estado === ESTADOS_MATERIA.REGULARIZADA).length;
  const cursando = situacionAcademica.filter(m => m.estado === ESTADOS_MATERIA.CURSANDO).length;
  
  const materiasDisponibles = calcularMateriasDisponibles(situacionAcademica, carrera, null, planMaterias);
  
  // Análisis por año
  const progresoPorAño = {};
  const añosCarrera = Math.max(...planMaterias.map(m => m.año));
  
  for (let año = 1; año <= añosCarrera; año++) {
    const materiasDelAño = planMaterias.filter(m => m.año === año);
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
    porcentajeAvance: totalMaterias > 0 ? (aprobadas / totalMaterias) * 100 : 0,
    materiasDisponibles: materiasDisponibles.length,
    progresoPorAño
  };
}

export default AcademicService;