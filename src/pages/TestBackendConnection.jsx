import React, { useState } from 'react';
import DashboardAcademicoCompleto from '../components/DashboardAcademicoCompleto.jsx';

const TestBackendConnection = () => {
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);

  // IDs de estudiantes de prueba (basados en los seeders)
  const estudiantesPrueba = [
    { id: 1, nombre: 'Juana Azurduy', descripcion: 'Estudiante con situación académica completa' },
    { id: 2, nombre: 'José Artigas', descripcion: 'Estudiante con finales registrados' },
    { id: 3, nombre: 'Simón Bolívar', descripcion: 'Estudiante con actividades de créditos' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">
            🔗 Test de Conexión Backend - APIs Académicas
          </h1>
          <p className="text-gray-600 mt-1">
            Probando todas las APIs creadas en el backend con Sequelize ORM
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        
        {/* Estado de Conexión */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">📡 Estado de la Conexión</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800">Backend URL</h3>
              <p className="text-blue-600">http://localhost:3001</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800">APIs Disponibles</h3>
              <p className="text-green-600">7 endpoints académicos</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <p className="text-yellow-800">
              <strong>Importante:</strong> Asegúrate de que el servidor backend esté corriendo:
              <code className="ml-2 px-2 py-1 bg-yellow-200 rounded">npm run dev</code>
            </p>
          </div>
        </div>

        {/* Selector de Estudiante */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">👥 Seleccionar Estudiante de Prueba</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {estudiantesPrueba.map((estudiante) => (
              <div 
                key={estudiante.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  estudianteSeleccionado === estudiante.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
                onClick={() => setEstudianteSeleccionado(estudiante.id)}
              >
                <h3 className="font-semibold">{estudiante.nombre}</h3>
                <p className="text-sm text-gray-600 mt-1">{estudiante.descripcion}</p>
                <p className="text-xs text-gray-500 mt-2">ID: {estudiante.id}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Endpoints que se van a probar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">🎯 APIs que se Probarán</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-400 rounded-full"></span>
              <code className="text-sm">GET /api/academico/estudiante/:id/dashboard</code>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-400 rounded-full"></span>
              <code className="text-sm">GET /api/academico/estudiante/:id/situacion</code>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-400 rounded-full"></span>
              <code className="text-sm">GET /api/academico/estudiante/:id/finales</code>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-400 rounded-full"></span>
              <code className="text-sm">GET /api/academico/estudiante/:id/creditos</code>
            </div>
          </div>
        </div>

        {/* Dashboard del Estudiante */}
        {estudianteSeleccionado ? (
          <DashboardAcademicoCompleto estudianteId={estudianteSeleccionado} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">👆</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Selecciona un estudiante para probar
            </h3>
            <p className="text-gray-600">
              Elige uno de los estudiantes de arriba para ver toda su información académica
              cargada desde el backend con las APIs de Sequelize ORM.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestBackendConnection;
