import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Typography, Button, Box, FormControl, InputLabel, Select, MenuItem,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  DialogContentText, Tabs, Tab, FormControlLabel, Checkbox
} from '@mui/material';
import SesionCard from '../components/SesionCard';
import SesionModal from '../components/SesionModal';
import AprobacionModal from '../components/AprobacionModal';
import api from '../api/axiosConfig';

import { fetchSesiones, addSesion, editSesion, removeSesion, joinToSesion,
  approveParticipanteThunk, rejectParticipanteThunk, leaveSesionThunk } from '../features/sesiones/slice';
import { fetchStudents, fetchConexiones } from '../features/auth/slice';

import { useFetchData } from '../hooks';
import { PageContainer, LoadingSpinner, EmptyState } from '../components/ui';

const Sesiones = () => {
  const dispatch = useDispatch();
  const { user, students, conexiones, loading: loadingStudents } = useSelector(state => state.auth);
  const { list: sesiones, loading, error, operationLoading } = useSelector(state => state.sesiones);

  const [filterMateria, setFilterMateria] = useState(null);
  const [filterFecha, setFilterFecha] = useState(null);
  const [filterTipo, setFilterTipo] = useState(null);

  const [activeTab, setActiveTab] = useState('todas');
  const [showPastEvents, setShowPastEvents] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSesion, setEditingSesion] = useState(null);
  const [aprobacionModalOpen, setAprobacionModalOpen] = useState(false);
  const [selectedSesion, setSelectedSesion] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sesionToDelete, setSesionToDelete] = useState(null);

  const { data: materias, loading: loadingMaterias, refetch: refetchMaterias } = useFetchData({
    fetchFn: () => api.get('/api/materias').then(res => {
      const lista = res.data?.data || res.data || [];
      return Array.isArray(lista) ? lista : [];
    }),
    deps: [],
    timeout: 15000,
  });

  const { data: misMateriasIds, loading: loadingMisMaterias, refetch: refetchMisMaterias } = useFetchData({
    fetchFn: () => api.get(`/api/estudiantes/${user?.id}/materias-ids`)
      .then(res => res.data?.data || []),
    deps: [activeTab, user?.id],
    immediate: activeTab === 'misMaterias' && !!user?.id,
    timeout: 10000,
  });

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchSesiones({ usuarioId: user.id }));
      dispatch(fetchConexiones(user.id));
    }
  }, [user, dispatch]);

  const handleClearFilters = useCallback(() => {
    setFilterMateria(null);
    setFilterFecha(null);
    setFilterTipo(null);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const misMateriasIdsArray = Array.isArray(misMateriasIds) ? misMateriasIds : [];

  const filteredSesiones = sesiones.filter(s => {
    if (!showPastEvents) {
      const sesionDate = s.fechaHora?.split('T')[0];
      if (sesionDate < today) return false;
    }

    if (s.estado !== 'activa') return false;

    if (activeTab === 'misMaterias') {
      if (!misMateriasIdsArray.includes(s.materiaId)) return false;
    }
    if (activeTab === 'misSesiones') {
      if (s.creadorId !== user.id) return false;
    }

    if (activeTab !== 'misMaterias' && filterMateria && s.materiaId !== Number(filterMateria)) return false;
    if (filterTipo && s.tipo !== filterTipo) return false;
    if (filterFecha) {
      const sesionDate = s.fechaHora?.split('T')[0];
      if (sesionDate !== filterFecha) return false;
    }

    return true;
  });

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

  if (loadingStudents || !user) {
    return (
      <PageContainer centered padding={3}>
        <LoadingSpinner message="Cargando usuarios..." />
      </PageContainer>
    );
  }

  const showLoading = loading || loadingMaterias || (activeTab === 'misMaterias' && loadingMisMaterias);

  return (
    <PageContainer maxWidth={1200}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Sesiones de Estudio
        </Typography>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          onClick={handleCreate}
          sx={{ height: 56 }}
        >
          Nueva Sesión
        </Button>

        {activeTab === 'todas' && (
          <FormControl sx={{ minWidth: 200 }} disabled={loadingMaterias}>
            <InputLabel>Materia</InputLabel>
            <Select
              label="Materia"
              value={filterMateria || ''}
              onChange={(e) => setFilterMateria(e.target.value || null)}
            >
              <MenuItem value="">Todas</MenuItem>
              {materias?.map(m => (
                <MenuItem key={m.id} value={m.id}>
                  {m.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

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

      {/* Past events checkbox - separate line */}
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox 
              checked={showPastEvents} 
              onChange={(e) => setShowPastEvents(e.target.checked)} 
            />
          }
          label="Mostrar eventos pasados"
        />
      </Box>

      {/* Tab bar */}
      <Tabs 
        value={activeTab} 
        onChange={(e, v) => setActiveTab(v)}
        sx={{ mb: 2 }}
      >
        <Tab value="todas" label="TODAS LAS SESIONES" />
        <Tab value="misMaterias" label="MIS MATERIAS" />
        <Tab value="misSesiones" label="MIS SESIONES" />
      </Tabs>

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

      {showLoading && (
        <LoadingSpinner message="Cargando sesiones..." />
      )}

      {error && (
        <EmptyState
          title="Error al cargar sesiones"
          message={error}
          icon="error"
          actionLabel="Reintentar"
          onAction={() => dispatch(fetchSesiones({ usuarioId: user.id }))}
        />
      )}

      {!showLoading && activeTab === 'misMaterias' && misMateriasIdsArray.length === 0 ? (
        <EmptyState
          title="Sin carreras inscriptas"
          message="No estás anotado en ninguna carrera para ver sesiones de tus materias."
          icon="inbox"
        />
      ) : !showLoading && filteredSesiones.length === 0 ? (
        <EmptyState
          title="No hay sesiones disponibles"
          message="No hay sesiones que coincidan con los filtros seleccionados."
          icon="search"
          actionLabel="Limpiar filtros"
          onAction={handleClearFilters}
        />
      ) : !showLoading && (
        <Box>
          {filteredSesiones.map(sesion => {
            const creator = students.find(st => st.id === sesion.creadorId);
            const creatorPublico = creator?.perfilPublico ?? true;
            const esContacto = conexiones.includes(sesion.creadorId);
            const isCreator = sesion.creadorId === user?.id;
            let visibilidad = 'publico';
            if (!creatorPublico) {
              visibilidad = isCreator ? 'privado' : 'contacto';
            }

            return (
              <SesionCard
                key={sesion.id}
                sesion={sesion}
                currentUser={user}
                materias={materias}
                operationLoading={operationLoading}
                visibilidad={visibilidad}
                onEdit={handleEdit}
                onJoin={handleJoin}
                onLeave={handleLeave}
                onViewParticipantes={handleViewParticipantes}
                onDelete={handleDeleteClick}
              />
            );
          })}
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
    </PageContainer>
  );
};

export default Sesiones;