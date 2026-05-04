import api from '../api/axiosConfig.js';

/**
 * Servicio completo para gestión académica - Conectado al Backend Real
 * Usa las APIs creadas en /api/academico/
 */
class AcademicBackendService {
  
  /**
   * RF3.1 - Obtener situación académica completa del estudiante
   */
  static async obtenerSituacionAcademica(estudianteId) {
    try {
      const response = await api.get(`/api/academico/estudiante/${estudianteId}/situacion`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener situación académica:', error);
      throw new Error('Error al cargar la situación académica');
    }
  }

  /**
   * RF3.2 - Cargar/Actualizar situación académica manualmente
   */
  static async cargarSituacionAcademica(estudianteId, datosMateria) {
    try {
      const response = await api.post(`/api/academico/estudiante/${estudianteId}/situacion`, datosMateria);
      return response.data;
    } catch (error) {
      console.error('Error al cargar situación académica:', error);
      throw new Error('Error al guardar la situación académica');
    }
  }

  /**
   * RF3.3 - Registrar intento de final
   */
  static async registrarIntentoFinal(estudianteId, datosIntento) {
    try {
      const response = await api.post(`/api/academico/estudiante/${estudianteId}/finales`, datosIntento);
      return response.data;
    } catch (error) {
      console.error('Error al registrar intento de final:', error);
      throw new Error('Error al registrar el intento de final');
    }
  }

  /**
   * RF3.4 - Obtener histórico de finales
   */
  static async obtenerHistorialFinales(estudianteId) {
    try {
      const response = await api.get(`/api/academico/estudiante/${estudianteId}/finales`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial de finales:', error);
      throw new Error('Error al cargar el historial de finales');
    }
  }

  /**
   * RF3.5 - Registrar actividad de créditos
   */
  static async registrarActividadCreditos(estudianteId, datosActividad) {
    try {
      const response = await api.post(`/api/academico/estudiante/${estudianteId}/creditos`, datosActividad);
      return response.data;
    } catch (error) {
      console.error('Error al registrar actividad de créditos:', error);
      throw new Error('Error al registrar la actividad de créditos');
    }
  }

  /**
   * RF3.6 - Obtener actividades de créditos
   */
  static async obtenerActividadesCreditos(estudianteId) {
    try {
      const response = await api.get(`/api/academico/estudiante/${estudianteId}/creditos`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener actividades de créditos:', error);
      throw new Error('Error al cargar las actividades de créditos');
    }
  }

  /**
   * RF3.7 - Dashboard académico completo
   */
  static async obtenerDashboardAcademico(estudianteId) {
    try {
      const response = await api.get(`/api/academico/estudiante/${estudianteId}/dashboard`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener dashboard académico:', error);
      throw new Error('Error al cargar el dashboard académico');
    }
  }

  /**
   * Métodos auxiliares para facilitar el uso en componentes
   */

  /**
   * Obtener resumen completo del estudiante (dashboard + situación)
   */
  static async obtenerResumenCompleto(estudianteId) {
    try {
      const [dashboard, situacion, finales, creditos] = await Promise.all([
        this.obtenerDashboardAcademico(estudianteId),
        this.obtenerSituacionAcademica(estudianteId),
        this.obtenerHistorialFinales(estudianteId),
        this.obtenerActividadesCreditos(estudianteId)
      ]);

      return {
        dashboard,
        situacion,
        finales,
        creditos,
        resumen: {
          materiasAprobadas: situacion.situaciones?.filter(s => s.estado === 'aprobada').length || 0,
          materiasRegularizadas: situacion.situaciones?.filter(s => s.estado === 'regularizada').length || 0,
          materiasCursando: situacion.situaciones?.filter(s => s.estado === 'cursada').length || 0,
          totalFinales: finales.intentos?.length || 0,
          finalesAprobados: finales.intentos?.filter(f => f.resultado === 'aprobado').length || 0,
          totalCreditos: creditos.resumen?.totalCreditos || 0,
          actividadesPendientes: creditos.actividades?.filter(a => a.estado === 'pendiente').length || 0
        }
      };
    } catch (error) {
      console.error('Error al obtener resumen completo:', error);
      throw new Error('Error al cargar el resumen académico completo');
    }
  }

  /**
   * Validar si el estudiante puede cursar una materia (lógica de correlatividades)
   */
  static validarCorrelatividades(situacionAcademica, materiaId) {
    // Esta lógica se expandirá cuando tengamos los datos de correlatividades del backend
    const materiasSituacion = situacionAcademica.situaciones || [];
    const materiaEncontrada = materiasSituacion.find(s => s.materiaId === materiaId);
    
    if (materiaEncontrada) {
      return {
        puedeInscribirse: materiaEncontrada.estado === 'aprobada',
        estado: materiaEncontrada.estado,
        razon: materiaEncontrada.estado === 'aprobada' ? 'Materia ya aprobada' : `Materia ${materiaEncontrada.estado}`
      };
    }

    return {
      puedeInscribirse: true,
      estado: 'no_cursada',
      razon: 'Materia disponible para cursar'
    };
  }
}

export default AcademicBackendService;