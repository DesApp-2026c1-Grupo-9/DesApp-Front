import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Typography, Button, Box, FormControl, InputLabel, Select, MenuItem,
  TextField, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, 
  DialogContentText, Avatar
} from '@mui/material';
import SesionCard from '../components/SesionCard';
import SesionModal from '../components/SesionModal';
import AprobacionModal from '../components/AprobacionModal';
import api from '../api/axiosConfig';

import { fetchSesiones, addSesion, editSesion, removeSesion, joinToSesion, 
         approveParticipanteThunk, rejectParticipanteThunk, leaveSesionThunk } from '../features/sesiones/slice';
import { fetchStudents, switchStudent } from '../features/auth/slice';

function ProjectSelector({ user, students, onSwitch }) {
  return (
    <Select 
      value={user?.id || ''} 
      label="Simular Usuario" 
      onChange={(e) => onSwitch(e.target.value)}
      renderValue={(selected) => {
        const student = students.find(s => s.id === selected);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src={student?.avatarUrl} sx={{ width: 24, height: 24 }}>
              {student?.nombre?.charAt(0)}
            </Avatar>
            <Typography variant="body2" fontWeight="500">
              {student?.nombre} {student?.apellido}
            </Typography>
          </Box>
        );
      }}
    >
      {students.map(s => (
        <MenuItem key={s.id} value={s.id}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={s.avatarUrl} sx={{ width: 28, height: 28 }}>{s.nombre?.charAt(0)}</Avatar>
            <Typography>{s.nombre} {s.apellido}</Typography>
          </Box>
        </MenuItem>
      ))}
    </Select>
  );
}

const Sesiones = () => {
  const dispatch = useDispatch();
  const { user, students, loading: loadingStudents } = useSelector(state => state.auth);
  const { list: sesiones, loading, error, operationLoading } = useSelector(state => state.sesiones);

  // Filters - local state
  const [filterMateria, setFilterMateria] = useState(null);
  const [filterFecha, setFilterFecha] = useState(null);
  const [filterTipo, setFilterTipo] = useState(null);
  const [materias, setMaterias] = useState([]);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSesion, setEditingSesion] = useState(null);
  const [aprobacionModalOpen, setAprobacionModalOpen] = useState(false);
  const [selectedSesion, setSelectedSesion] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sesionToDelete, setSesionToDelete] = useState(null);

  // Load students on mount
  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  // Load materias on mount
  useEffect(() => {
    api.get('/api/materias')
      .then(res => {
        const lista = res.data?.data || res.data || [];
        setMaterias(Array.isArray(lista) ? lista : []);
      })
      .catch(err => {
        console.error('Error loading materias:', err);
        setMaterias([]);
      });
  }, []);

  // Load sesiones when user changes
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchSesiones({ usuarioId: user.id }));
    }
  }, [user, dispatch]);

  // Log when filters change
  useEffect(() => {
    console.log('FILTERS CHANGED:', { materia: filterMateria, fecha: filterFecha, tipo: filterTipo });
  }, [filterMateria, filterFecha, filterTipo]);

  // Filter logic - matches backend data structure
  const filteredSesiones = sesiones.filter(s => {
    if (s.estado !== 'activa') return false;

    // Filter by materia
    if (filterMateria && s.materiaId !== Number(filterMateria)) return false;

    // Filter by tipo
    if (filterTipo && s.tipo !== filterTipo) return false;

    // Filter by fecha
    if (filterFecha) {
      const sesionDate = s.fechaHora?.split('T')[0];
      if (sesionDate !== filterFecha) return false;
    }

    return true;
  });

  console.log('TOTAL:', sesiones.length, '| FILTERED:', filteredSesiones.length, '| USER:', user?.id);

  // Handler: Create new sesion - open modal
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
      dispatch(editSesion({ 
        sesionId: editingSesion.id, 
        sesionData, 
        usuarioId: user.id 
      }));
    } else {
      dispatch(addSesion({ 
        sesionData, 
        usuarioId: user.id 
      }));
    }
    setModalOpen(false);
    setEditingSesion(null);
  };

  // Handler: Join sesion
  const handleJoin = (sesionId) => {
    dispatch(joinToSesion({ sesionId, usuarioId: user.id }))
      .unwrap()
      .catch((err) => {
        console.error('Error joining sesion:', err);
      });
  };

  // Handler: Leave sesion
  const handleLeave = (sesionId) => {
    const sesion = sesiones.find(s => s.id === sesionId);
    const participante = sesion?.participantes?.find(p => 
      p.estudianteId === user.id || p.estudiante?.id === user.id
    );
    
    if (participante) {
      dispatch(leaveSesionThunk({ 
        sesionId, 
        participanteId: participante.id, 
        usuarioId: user.id 
      }))
        .unwrap()
        .catch((err) => {
          console.error('Error leaving sesion:', err);
        });
    }
  };

  // Handler: View participantes (open approval modal)
  const handleViewParticipantes = (sesion) => {
    setSelectedSesion(sesion);
    setAprobacionModalOpen(true);
  };

  // Handler: Approve participant
  const handleApprove = (sesionId, participanteId) => {
    dispatch(approveParticipanteThunk({ sesionId, participanteId, usuarioId: user.id }));
    // Update local selectedSesion for modal
    setSelectedSesion(prev => prev ? {
      ...prev,
      participantes: prev.participantes.map(p =>
        p.id === participanteId ? { ...p, estado: 'aprobado' } : p
      )
    } : null);
  };

  // Handler: Reject participant
  const handleReject = (sesionId, participanteId) => {
    dispatch(rejectParticipanteThunk({ sesionId, participanteId, usuarioId: user.id }));
    // Update local selectedSesion for modal
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
    if (sesionToDelete) {
      dispatch(removeSesion({ sesionId: sesionToDelete, usuarioId: user.id }));
    }
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

  if (loadingStudents || !user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Cargando usuarios...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Sesiones de Estudio
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Simular Usuario</InputLabel>
          <ProjectSelector 
            user={user}
            students={students}
            onSwitch={(val) => dispatch(switchStudent(val))}
          />
        </FormControl>
      </Box>

      {/* Actions and Filters */}
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
            {materias.map(m => (
              <MenuItem key={m.id} value={m.id}>
                {m.nombre}
              </MenuItem>
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
            {filterMateria && ` Materia ID: ${filterMateria}`}
            {filterFecha && ` Fecha: ${filterFecha}`}
            {filterTipo && ` Tipo: ${filterTipo}`}
          </Typography>
        </Box>
      )}

      {/* Loading/Error States */}
      {loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}

      {/* Sesiones List */}
      {!loading && filteredSesiones.length === 0 ? (
        <Typography color="textSecondary" sx={{ mt: 4, textAlign: 'center' }}>
          No hay sesiones disponibles con los filtros seleccionados
        </Typography>
      ) : !loading && (
        <Box>
          {filteredSesiones.map(sesion => (
            <SesionCard
              key={sesion.id}
              sesion={sesion}
              currentUser={user}
              materias={materias}
              operationLoading={operationLoading}
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
        onSave={handleSave}
        onCancel={handleCloseModal}
      />

      {/* Approval Modal */}
      <AprobacionModal
        open={aprobacionModalOpen}
        sesion={selectedSesion}
        currentUser={user}
        onApprove={handleApprove}
        onReject={handleReject}
        onClose={handleCloseAprobacionModal}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas cancelar esta sesión? Esta acción no se puede deshacer.
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