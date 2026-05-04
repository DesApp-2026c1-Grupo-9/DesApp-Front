import api from '../api/axiosConfig.js';

/**
 * Servicio para gestionar estudiantes - Conectado al Backend
 */
class EstudianteService {
  
  /**
   * Obtiene todos los estudiantes desde el backend
   */
  static async obtenerTodosEstudiantes() {
    try {
      const response = await api.get('/api/estudiantes');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
      throw new Error('Error al cargar la lista de estudiantes');
    }
  }

  /**
   * Obtiene información completa de un estudiante específico desde el backend
   */
  static async obtenerEstudiante(id) {
    try {
      const response = await api.get(`/api/estudiantes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener estudiante ${id}:`, error);
      throw new Error(`Error al cargar información del estudiante ${id}`);
    }
  }

  /**
   * Obtiene las materias y situación académica del estudiante desde el backend
   */
  static async obtenerMateriasEstudiante(id) {
    try {
      const response = await api.get(`/api/estudiantes/${id}/plan-materias`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener materias del estudiante ${id}:`, error);
      throw new Error(`Error al cargar materias del estudiante ${id}`);
    }
  }

  /**
   * Obtiene el plan de estudios del estudiante desde el backend
   */
  static async obtenerPlanEstudios(id) {
    try {
      const response = await api.get(`/api/estudiantes/${id}/plan-materias`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener plan de estudios del estudiante ${id}:`, error);
      throw new Error(`Error al cargar plan de estudios del estudiante ${id}`);
    }
  }

  /**
   * Busca estudiantes por término de búsqueda
   */
  static async buscarEstudiantes(termino = '') {
    try {
      const response = await this.obtenerTodosEstudiantes();
      const estudiantes = response.data || [];
      
      if (!termino.trim()) {
        return estudiantes;
      }
      
      const terminoLower = termino.toLowerCase().trim();
      
      return estudiantes.filter(estudiante => 
        estudiante.usuario.nombre.toLowerCase().includes(terminoLower) ||
        estudiante.usuario.apellido.toLowerCase().includes(terminoLower) ||
        estudiante.usuario.email.toLowerCase().includes(terminoLower) ||
        (estudiante.carreras && estudiante.carreras.some(carrera => 
          carrera.nombre.toLowerCase().includes(terminoLower)
        ))
      );
    } catch (error) {
      console.error('Error al buscar estudiantes:', error);
      throw new Error('Error en la búsqueda de estudiantes');
    }
  }

  /**
   * Obtiene estudiantes por carrera
   */
  static async obtenerEstudiantesPorCarrera(nombreCarrera) {
    try {
      const response = await this.obtenerTodosEstudiantes();
      const estudiantes = response.data || [];
      
      return estudiantes.filter(estudiante => 
        estudiante.carreras && estudiante.carreras.some(carrera =>
          carrera.nombre.toLowerCase().includes(nombreCarrera.toLowerCase())
        )
      );
    } catch (error) {
      console.error(`Error al obtener estudiantes de la carrera ${nombreCarrera}:`, error);
      throw new Error(`Error al cargar estudiantes de ${nombreCarrera}`);
    }
  }

  /**
   * Obtiene Diego Fernández como estudiante por defecto
   */
  static async obtenerEstudianteDefecto() {
    try {
      const response = await this.obtenerTodosEstudiantes();
      const estudiantes = response.data || [];
      
      // Buscar Diego Fernández
      const diego = estudiantes.find(estudiante => 
        estudiante.usuario.nombre.toLowerCase() === 'diego' &&
        estudiante.usuario.apellido.toLowerCase() === 'fernández'
      );
      
      if (diego) {
        return diego;
      }
      
      // Si no se encuentra Diego, devolver el primer estudiante disponible
      if (estudiantes.length > 0) {
        console.warn('Diego Fernández no encontrado, usando primer estudiante disponible');
        return estudiantes[0];
      }
      
      throw new Error('No hay estudiantes disponibles');
    } catch (error) {
      console.error('Error al obtener estudiante por defecto:', error);
      throw new Error('Error al cargar estudiante por defecto');
    }
  }

  /**
   * Actualiza el estado de una materia para un estudiante
   */
  static async actualizarEstadoMateria(estudianteId, materiaId, nuevoEstado, confirmarCascada = false) {
    try {
      const response = await api.patch(
        `/api/estudiantes/${estudianteId}/materias/${materiaId}/estado`,
        { estado: nuevoEstado, confirmarCascada }
      );
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar estado de materia ${materiaId}:`, error);
      
      // Si es un conflicto de correlatividades, devolver la información del conflicto
      if (error.response?.status === 409 && error.response?.data?.tipo === 'CONFLICTO_CORRELATIVIDADES') {
        throw {
          tipo: 'CONFLICTO_CORRELATIVIDADES',
          data: error.response.data
        };
      }
      
      throw new Error('Error al actualizar el estado de la materia');
    }
  }

  /**
   * Obtiene todas las carreras disponibles
   */
  static async obtenerCarreras() {
    try {
      const response = await api.get('/api/carreras');
      return response.data;
    } catch (error) {
      console.error('Error al obtener carreras:', error);
      throw new Error('Error al cargar las carreras');
    }
  }

  /**
   * Obtiene estadísticas generales de estudiantes
   */
  static async obtenerEstadisticasGenerales() {
    try {
      const response = await this.obtenerTodosEstudiantes();
      const estudiantes = response.data || [];
      
      const estadisticas = {
        totalEstudiantes: estudiantes.length,
        porCarrera: {},
        porNivel: {}
      };

      estudiantes.forEach(estudiante => {
        // Estadísticas por carrera
        const nombreCarrera = estudiante.carreras?.[0]?.nombre || 'Sin carrera';
        if (!estadisticas.porCarrera[nombreCarrera]) {
          estadisticas.porCarrera[nombreCarrera] = 0;
        }
        estadisticas.porCarrera[nombreCarrera]++;
      });

      return estadisticas;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw new Error('Error al cargar estadísticas de estudiantes');
    }
  }
}

export default EstudianteService;