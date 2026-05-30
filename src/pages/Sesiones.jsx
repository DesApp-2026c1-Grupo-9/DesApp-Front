import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Typography, Button, Box, FormControl, InputLabel, Select, MenuItem,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  DialogContentText, Tabs, Tab, FormControlLabel, Checkbox, Grid
} from '@mui/material';
import { Add } from '@mui/icons-material';
import SesionCard from '../components/SesionCard';
import SesionModal from '../components/SesionModal';
import AprobacionModal from '../components/AprobacionModal';
import api from '../api/axiosConfig';

import { fetchSesiones, addSesion, editSesion, removeSesion, joinToSesion,
  approveParticipanteThunk, rejectParticipanteThunk, leaveSesionThunk } from '../features/sesiones/slice';
import { fetchConexiones } from '../features/auth/slice';

import { useFetchData, useFilter } from '../hooks';
import { PageContainer, LoadingSpinner, EmptyState } from '../components/ui';

const Sesiones = () => {
  const dispatch = useDispatch();
  const { user, students, conexiones } = useSelector(state => state.auth);
  const { list: sesiones, loading, error, operationLoading } = useSelector(state => state.sesiones);

  const { filters, setFilter, clearFilters, hasActiveFilters } = useFilter({
    initialFilters: {
      materia: null,
      fecha: null,
      tipo: null,
    },
  });

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
    if (user?.id) {
      dispatch(fetchSesiones({ usuarioId: user.id }));
      dispatch(fetchConexiones(user.id));
    }
  }, [user, dispatch]);

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

    if (filters.materia && s.materiaId !== Number(filters.materia)) return false;
    if (filters.tipo && s.tipo !== filters.tipo) return false;
    if (filters.fecha) {
      const sesionDate = s.fechaHora?.split('T')[0];
      if (sesionDate !== filters.fecha) return false;
    }

    return true;
  })
  .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));

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

  const showLoading = loading || loadingMaterias || (activeTab === 'misMaterias' && loadingMisMaterias);

  return (
    <PageContainer maxWidth={1200}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ mb: 0 }}>
          Sesiones de Estudio
        </Typography>
        <Button
          variant="contained"
          onClick={handleCreate}
          startIcon={<Add />}
        >
          Nueva Sesión
        </Button>
      </Box>

      {/* Filtros */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth disabled={loadingMaterias}>
              <InputLabel>Materia</InputLabel>
              <Select
                label="Materia"
                value={filters.materia || ''}
                onChange={(e) => setFilter('materia', e.target.value || null)}
              >
                <MenuItem value="">Todas</MenuItem>
                {materias?.map(m => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Fecha"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.fecha || ''}
              onChange={(e) => setFilter('fecha', e.target.value || null)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                label="Tipo"
                value={filters.tipo || ''}
                onChange={(e) => setFilter('tipo', e.target.value || null)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="virtual">Virtual</MenuItem>
                <MenuItem value="presencial">Presencial</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={showPastEvents} 
                onChange={(e) => setShowPastEvents(e.target.checked)} 
              />
            }
            label="Mostrar eventos pasados"
          />

          {hasActiveFilters && (
            <Button
              variant="text"
              onClick={clearFilters}
            >
              Limpiar filtros
            </Button>
          )}
        </Box>
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
      {hasActiveFilters && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Filtros activos:
            {filters.materia && ` Materia ID: ${filters.materia}`}
            {filters.fecha && ` Fecha: ${filters.fecha}`}
            {filters.tipo && ` Tipo: ${filters.tipo}`}
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
          onAction={clearFilters}
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