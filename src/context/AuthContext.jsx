import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EstudianteService from '../services/EstudianteService';
import { fetchMe, logout as logoutAction } from '../features/auth/slice';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user: authUser, isAuthenticated, token } = useSelector((state) => state.auth);
  const [estudianteActual, setEstudianteActual] = useState(null);
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizarEstudiantes = (payload) => {
    const raw = Array.isArray(payload) ? payload : payload?.data || [];
    return raw;
  };

  const cargarEstudiantesDisponibles = async () => {
    const estudiantesData = await EstudianteService.obtenerTodosEstudiantes();
    const estudiantes = normalizarEstudiantes(estudiantesData);
    setEstudiantesDisponibles(estudiantes);
    return estudiantes;
  };

  useEffect(() => {
    const inicializar = async () => {
      try {
        setLoading(true);

        if (!isAuthenticated) {
          setEstudianteActual(null);
          return;
        }

        try {
          await dispatch(fetchMe()).unwrap();
        } catch {
          // Token inválido, continuar con datos almacenados
        }

        const estudiantes = await cargarEstudiantesDisponibles();
        const usuarioId = authUser?.id || JSON.parse(localStorage.getItem('user') || '{}')?.id;

        if (usuarioId) {
          const estudiante = estudiantes.find(
            (e) => Number(e?.usuario?.id) === Number(usuarioId)
          );
          if (estudiante) {
            setEstudianteActual(estudiante);
          }
        }
      } catch (error) {
        console.error('Error al inicializar auth context:', error);
      } finally {
        setLoading(false);
      }
    };

    inicializar();
  }, [isAuthenticated]);

  useEffect(() => {
    const handler = (e) => {
      const { usuarioId, activo } = e.detail;
      setEstudianteActual((prev) =>
        prev?.usuario?.id === usuarioId ? { ...prev, usuario: { ...prev.usuario, activo } } : prev
      );
      setEstudiantesDisponibles((prev) =>
        prev.map((est) =>
          est.usuario?.id === usuarioId ? { ...est, usuario: { ...est.usuario, activo } } : est
        )
      );
    };
    window.addEventListener('usuario-estado-cambiado', handler);
    return () => window.removeEventListener('usuario-estado-cambiado', handler);
  }, []);

  const cambiarEstudiante = async (nuevoId) => {
    try {
      setLoading(true);
      const estudianteData = await EstudianteService.obtenerEstudiante(nuevoId);
      const estudiante = estudianteData.data || estudianteData;
      if (estudiante.usuario?.activo === false) {
        console.warn('El estudiante seleccionado está inactivo');
      }
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

  const cerrarSesion = useCallback(() => {
    dispatch(logoutAction());
    setEstudianteActual(null);
  }, [dispatch]);

  const value = {
    estudianteActual,
    estudiantesDisponibles,
    loading,
    cambiarEstudiante,
    cambiarEstudiantePorUsuarioId,
    cerrarSesion,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
