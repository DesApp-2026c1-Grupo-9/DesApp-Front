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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar Diego Fernández como estudiante por defecto
    const cargarEstudianteActual = async () => {
      try {
        setLoading(true);
        // Usar la función que busca Diego Fernández automáticamente
        const estudianteData = await EstudianteService.obtenerEstudianteDefecto();
        console.log('Datos del estudiante por defecto:', estudianteData);
        const estudiante = estudianteData.data || estudianteData;
        setEstudianteActual(estudiante);
        console.log('Estudiante cargado:', estudiante.usuario.nombre, estudiante.usuario.apellido);
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

  const value = {
    estudianteActual,
    loading,
    cambiarEstudiante
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;