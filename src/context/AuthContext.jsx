import React, { createContext, useContext, useState, useEffect } from 'react';
import EstudianteService from '../services/EstudianteService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [estudianteActual, setEstudianteActual] = useState(null);
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizarEstudiantes = (payload) => {
    if (Array.isArray(payload)) return payload;
    return payload?.data || [];
  };

  const cargarEstudiantesDisponibles = async () => {
    const estudiantesData = await EstudianteService.obtenerTodosEstudiantes();
    const estudiantes = normalizarEstudiantes(estudiantesData);
    setEstudiantesDisponibles(estudiantes);
    return estudiantes;
  };

  useEffect(() => {
    // Cargar estudiante por defecto y cachear lista para cambios globales de contexto
    const cargarEstudianteActual = async () => {
      try {
        setLoading(true);
        const estudiantes = await cargarEstudiantesDisponibles();
        const usuarioSeleccionadoId = Number(localStorage.getItem('mockStudentId'));

        let estudiante = null;

        if (usuarioSeleccionadoId) {
          estudiante = estudiantes.find(
            (e) => Number(e?.usuario?.id) === usuarioSeleccionadoId
          ) || null;
        }

        if (!usuarioSeleccionadoId) {
          estudiante =
            estudiantes.find(
              (e) =>
                e?.usuario?.nombre?.toLowerCase() === 'diego' &&
                e?.usuario?.apellido?.toLowerCase() === 'fernández'
            ) || estudiantes[0] || null;
        }

        if (usuarioSeleccionadoId && !estudiante) {
          // Caso administrador u otro usuario sin estudiante asociado.
          setEstudianteActual(null);
          return;
        }

        if (!estudiante) {
          throw new Error('No hay estudiantes disponibles');
        }

        setEstudianteActual(estudiante);
        console.log('Estudiante cargado:', estudiante.usuario?.nombre, estudiante.usuario?.apellido);
      } catch (error) {
        console.error('Error al cargar estudiante actual:', error);
        // Si hay error, usar datos de backup actualizados
        setEstudianteActual({
          id: 6,
          usuario: {
            id: 10,
            nombre: 'Diego',
            apellido: 'Fernández',
            email: 'diego.fernandez@estudiante.unahur.edu.ar'
          },
          carreras: [{
            id: 4,
            nombre: 'Tecnicatura en Inteligencia Artificial'
          }]
        });
      } finally {
        setLoading(false);
      }
    };

    cargarEstudianteActual();
  }, []);

  const cambiarEstudiante = async (nuevoId) => {
    try {
      setLoading(true);
      const estudianteData = await EstudianteService.obtenerEstudiante(nuevoId);
      console.log('Datos recibidos para cambiar estudiante:', estudianteData);
      // El backend devuelve { data: estudiante }
      const estudiante = estudianteData.data || estudianteData;
      console.log('Estudiante seleccionado:', estudiante);
      setEstudianteActual(estudiante);
    } catch (error) {
      console.error('Error al cambiar estudiante:', error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstudiantePorUsuarioId = async (usuarioId) => {
    try {
      setLoading(true);
      const usuarioIdNumero = Number(usuarioId);

      let estudiantes = estudiantesDisponibles;
      if (!estudiantes.length) {
        estudiantes = await cargarEstudiantesDisponibles();
      }

      const estudiante = estudiantes.find(
        (e) => Number(e?.usuario?.id) === usuarioIdNumero
      );

      if (!estudiante) {
        setEstudianteActual(null);
        return;
      }

      setEstudianteActual(estudiante);
    } catch (error) {
      console.error('Error al cambiar estudiante por usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    estudianteActual,
    estudiantesDisponibles,
    loading,
    cambiarEstudiante,
    cambiarEstudiantePorUsuarioId
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;