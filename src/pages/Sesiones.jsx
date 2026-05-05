import React, { useState, useEffect } from 'react';
import {
  Typography, Button, Box, FormControl, InputLabel, Select, MenuItem,
  TextField, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText
} from '@mui/material';
import SesionCard from '../components/SesionCard';
import SesionModal from '../components/SesionModal';
import AprobacionModal from '../components/AprobacionModal';

// Mock data - current user
const currentUser = { id: 1, nombre: 'Diego', apellido: 'Fernández' };

// Mock data - materias
const mockMaterias = [
  { id: 1, nombre: 'Matemática' },
  { id: 2, nombre: 'Programación' },
  { id: 3, nombre: 'Bases de Datos' },
  { id: 4, nombre: 'Inglés Técnico' }
];

// Mock data - sesiones
const initialSesiones = [
  {
    id: 1,
    materiaId: 1,
    materia: { id: 1, nombre: 'Matemática' },
    tema: 'Repaso para parcial',
    tipo: 'virtual',
    link: 'https://meet.google.com/abc-def-ghi',
    ubicacion: null,
    fechaHora: '2026-05-10T14:00:00',
    duracion: 120,
    cupos: 10,
    descripcion: 'Repasaremos los temas 1-5',
    necesidadAprobacion: true,
    estado: 'activa',
    creadorId: 1,
    participantes: [
      { id: 1, estudianteId: 2, estudiante: { id: 2, nombre: 'Juan', apellido: 'Pérez' }, estado: 'aprobado' },
      { id: 2, estudianteId: 3, estudiante: { id: 3, nombre: 'María', apellido: 'López' }, estado: 'pendiente' },
      { id: 3, estudianteId: 4, estudiante: { id: 4, nombre: 'Ana', apellido: 'Gómez' }, estado: 'pendiente' }
    ]
  },
  {
    id: 2,
    materiaId: 2,
    materia: { id: 2, nombre: 'Programación' },
    tema: 'Resolución TP3',
    tipo: 'presencial',
    link: null,
    ubicacion: 'Aula 305',
    fechaHora: '2026-05-12T16:00:00',
    duracion: 180,
    cupos: null,
    descripcion: 'Trabajo práctico 3 en grupo',
    necesidadAprobacion: false,
    estado: 'activa',
    creadorId: 2,
    participantes: [
      { id: 4, estudianteId: 1, estudiante: { id: 1, nombre: 'Diego', apellido: 'Fernández' }, estado: 'aprobado' }
    ]
  },
  {
    id: 3,
    materiaId: 3,
    materia: { id: 3, nombre: 'Bases de Datos' },
    tema: 'Consulta de dudas Unidad 5',
    tipo: 'virtual',
    link: 'https://discord.gg/xyz123',
    ubicacion: null,
    fechaHora: '2026-05-15T10:00:00',
    duracion: 90,
    cupos: 20,
    descripcion: 'Traer consultas sobre normalización',
    necesidadAprobacion: false,
    estado: 'activa',
    creadorId: 3,
    participantes: [
      { id: 5, estudianteId: 1, estudiante: { id: 1, nombre: 'Diego', apellido: 'Fernández' }, estado: 'aprobado' },
      { id: 6, estudianteId: 2, estudiante: { id: 2, nombre: 'Juan', apellido: 'Pérez' }, estado: 'aprobado' }
    ]
  },
  {
    id: 4,
    materiaId: 4,
    materia: { id: 4, nombre: 'Inglés Técnico' },
    tema: 'Práctica oral',
    tipo: 'presencial',
    link: null,
    ubicacion: 'Biblioteca central',
    fechaHora: '2026-05-20T09:00:00',
    duracion: 120,
    cupos: 15,
    descripcion: 'Práctica de speaking para el examen',
    necesidadAprobacion: true,
    estado: 'activa',
    creadorId: 1,
    participantes: [
      { id: 7, estudianteId: 3, estudiante: { id: 3, nombre: 'María', apellido: 'López' }, estado: 'pendiente' }
    ]
  }
];

const Sesiones = () => {
  const [sesiones, setSesiones] = useState(initialSesiones);
  // Use individual state variables for filters
  const [filterMateria, setFilterMateria] = useState(null);
  const [filterFecha, setFilterFecha] = useState(null);
  const [filterTipo, setFilterTipo] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSesion, setEditingSesion] = useState(null);
  const [aprobacionModalOpen, setAprobacionModalOpen] = useState(false);
  const [selectedSesion, setSelectedSesion] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sesionToDelete, setSesionToDelete] = useState(null);

  // Log when filters change
  useEffect(() => {
    console.log('FILTERS CHANGED:', { materia: filterMateria, fecha: filterFecha, tipo: filterTipo });
  }, [filterMateria, filterFecha, filterTipo]);

  // Filter logic - SIMPLE
  const filteredSesiones = sesiones.filter(s => {
    if (s.estado !== 'activa') return false;

    // Filter by materia
    if (filterMateria && s.materiaId !== Number(filterMateria)) return false;

    // Filter by tipo
    if (filterTipo && s.tipo !== filterTipo) return false;

    // Filter by fecha - SIMPLE STRING COMPARISON
    if (filterFecha) {
      // s.fechaHora is "2026-05-10T14:00:00"
      // Extract just "2026-05-10"
      const sesionDate = s.fechaHora.split('T')[0]; // "2026-05-10"
      const matches = sesionDate === filterFecha;
      console.log('Date filter:', s.tema, '| sesionDate:', sesionDate, '| filterFecha:', filterFecha, '| matches:', matches);
      if (!matches) return false;
    }

    return true;
  });

  console.log('TOTAL:', sesiones.length, '| FILTERED:', filteredSesiones.length);

  // Handler: Create new sesion
  const handleCreate = () => {
    setEditingSesion(null);
    setModalOpen(true);
  };

  // Handler: Edit sesion
  const handleEdit = (sesion) => {
    setEditingSesion(sesion);
    setModalOpen(true);
  };

  // Handler: Save sesion (create or update)
  const handleSave = (sesionData) => {
    if (editingSesion) {
      // Update existing
      setSesiones(prev => prev.map(s =>
        s.id === editingSesion.id
          ? { ...s, ...sesionData, materia: mockMaterias.find(m => m.id === sesionData.materiaId) }
          : s
      ));
    } else {
      // Create new
      const newSesion = {
        id: Date.now(),
        ...sesionData,
        materia: mockMaterias.find(m => m.id === sesionData.materiaId),
        estado: 'activa',
        creadorId: currentUser.id,
        participantes: []
      };
      setSesiones(prev => [...prev, newSesion]);
    }
    setModalOpen(false);
    setEditingSesion(null);
  };

  // Handler: Join sesion
  const handleJoin = (sesionId) => {
    setSesiones(prev => prev.map(s => {
      if (s.id !== sesionId) return s;
      const yaInscrito = s.participantes.some(p => p.estudianteId === currentUser.id);
      if (yaInscrito) return s;

      const nuevoParticipante = {
        id: Date.now(),
        estudianteId: currentUser.id,
        estudiante: { id: currentUser.id, nombre: currentUser.nombre, apellido: currentUser.apellido },
        estado: s.necesidadAprobacion ? 'pendiente' : 'aprobado'
      };

      return { ...s, participantes: [...s.participantes, nuevoParticipante] };
    }));
  };

  // Handler: Leave sesion
  const handleLeave = (sesionId) => {
    setSesiones(prev => prev.map(s => {
      if (s.id !== sesionId) return s;
      return {
        ...s,
        participantes: s.participantes.filter(p => p.estudianteId !== currentUser.id)
      };
    }));
  };

  // Handler: View participantes (open approval modal)
  const handleViewParticipantes = (sesion) => {
    setSelectedSesion(sesion);
    setAprobacionModalOpen(true);
  };

  // Handler: Approve participant
  const handleApprove = (sesionId, participanteId) => {
    setSesiones(prev => prev.map(s => {
      if (s.id !== sesionId) return s;
      return {
        ...s,
        participantes: s.participantes.map(p =>
          p.id === participanteId ? { ...p, estado: 'aprobado' } : p
        )
      };
    }));
    // Update selectedSesion for modal
    setSelectedSesion(prev => prev ? {
      ...prev,
      participantes: prev.participantes.map(p =>
        p.id === participanteId ? { ...p, estado: 'aprobado' } : p
      )
    } : null);
  };

  // Handler: Reject participant
  const handleReject = (sesionId, participanteId) => {
    setSesiones(prev => prev.map(s => {
      if (s.id !== sesionId) return s;
      return {
        ...s,
        participantes: s.participantes.map(p =>
          p.id === participanteId ? { ...p, estado: 'rechazado' } : p
        )
      };
    }));
    // Update selectedSesion for modal
    setSelectedSesion(prev => prev ? {
      ...prev,
      participantes: prev.participantes.map(p =>
        p.id === participanteId ? { ...p, estado: 'rechazado' } : p
      )
    } : null);
  };

  // Handler: Delete sesion - open confirmation dialog
  const handleDeleteClick = (sesionId) => {
    setSesionToDelete(sesionId);
    setDeleteDialogOpen(true);
  };

  // Handler: Confirm delete
  const handleConfirmDelete = () => {
    setSesiones(prev => prev.filter(s => s.id !== sesionToDelete));
    setDeleteDialogOpen(false);
    setSesionToDelete(null);
  };

  // Handler: Cancel delete
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSesionToDelete(null);
  };

  // Handler: Close modals
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingSesion(null);
  };

  const handleCloseAprobacionModal = () => {
    setAprobacionModalOpen(false);
    setSelectedSesion(null);
  };

  // Handler: Clear filters
  const handleClearFilters = () => {
    setFilterMateria(null);
    setFilterFecha(null);
    setFilterTipo(null);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Sesiones de Estudio
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          onClick={handleCreate}
          sx={{ height: 56 }}
        >
          Nueva Sesión
        </Button>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Materia</InputLabel>
          <Select
            label="Materia"
            value={filterMateria || ''}
            onChange={(e) => setFilterMateria(e.target.value || null)}
          >
            <MenuItem value="">Todas</MenuItem>
            {mockMaterias.map(m => (
              <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Fecha"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={filterFecha || ''}
          onChange={(e) => setFilterFecha(e.target.value || null)}
          sx={{ minWidth: 180 }}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Tipo</InputLabel>
          <Select
            label="Tipo"
            value={filterTipo || ''}
            onChange={(e) => setFilterTipo(e.target.value || null)}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="virtual">Virtual</MenuItem>
            <MenuItem value="presencial">Presencial</MenuItem>
          </Select>
        </FormControl>

        {(filterMateria || filterFecha || filterTipo) && (
          <Button
            variant="text"
            onClick={handleClearFilters}
          >
            Limpiar filtros
          </Button>
        )}
      </Box>

      {/* Active Filters Display */}
      {(filterMateria || filterFecha || filterTipo) && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Filtros activos:
            {filterMateria && ` Materia: ${mockMaterias.find(m => m.id === Number(filterMateria))?.nombre || filterMateria}`}
            {filterFecha && ` Fecha: ${filterFecha}`}
            {filterTipo && ` Tipo: ${filterTipo}`}
          </Typography>
        </Box>
      )}

      {/* Sesiones List */}
      {filteredSesiones.length === 0 ? (
        <Typography color="textSecondary" sx={{ mt: 4, textAlign: 'center' }}>
          No hay sesiones disponibles con los filtros seleccionados
        </Typography>
      ) : (
        <Box>
          {filteredSesiones.map(sesion => (
            <SesionCard
              key={sesion.id}
              sesion={sesion}
              currentUser={currentUser}
              onEdit={handleEdit}
              onJoin={handleJoin}
              onLeave={handleLeave}
              onViewParticipantes={handleViewParticipantes}
              onDelete={handleDeleteClick}
            />
          ))}
        </Box>
      )}

      {/* Create/Edit Modal */}
      <SesionModal
        open={modalOpen}
        sesion={editingSesion}
        materias={mockMaterias}
        onSave={handleSave}
        onCancel={handleCloseModal}
      />

      {/* Approval Modal */}
      <AprobacionModal
        open={aprobacionModalOpen}
        sesion={selectedSesion}
        onApprove={handleApprove}
        onReject={handleReject}
        onClose={handleCloseAprobacionModal}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar esta sesión? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sesiones;
