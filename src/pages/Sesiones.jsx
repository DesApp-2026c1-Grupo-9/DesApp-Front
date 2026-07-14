import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Typography, Button, Box, FormControl, InputLabel, Select, MenuItem,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  DialogContentText, Tabs, Tab, FormControlLabel, Grid,
  Chip, Stack, useTheme, useMediaQuery,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, students, conexiones } = useSelector(state => state.auth);
  const { list: sesiones, loading, error, operationLoading } = useSelector(state => state.sesiones);

  const { filters, setFilter, setMultipleFilters, clearFilters, hasActiveFilters } = useFilter({
    initialFilters: {
      materia: null,
      fechaInicio: null,
      fechaFin: null,
      tipo: null,
    },
  });

  const [activeTab, setActiveTab] = useState('todas');
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setFilter('fechaInicio', new Date());
    }
  }, [setFilter]);

  const handleClearFilters = useCallback(() => {
    setMultipleFilters({ materia: null, fechaFin: null, tipo: null });
    setFilter('fechaInicio', new Date());
    setActiveQuick(null);
  }, [setMultipleFilters, setFilter]);
  const [activeQuick, setActiveQuick] = useState(null);
  const [materiaMenuWidth, setMateriaMenuWidth] = useState(0);

  const isQuickActive = (key) => activeQuick === key;
  const showClearButton = filters.materia !== null || filters.fechaFin !== null || filters.tipo !== null;
  const materiaFormRef = useCallback(node => {
    if (node && !materiaMenuWidth) setMateriaMenuWidth(node.offsetWidth);
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSesion, setEditingSesion] = useState(null);
  const [aprobacionModalOpen, setAprobacionModalOpen] = useState(false);
  const [selectedSesion, setSelectedSesion] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sesionToDelete, setSesionToDelete] = useState(null);

  const estudianteId = user?.estudianteId || user?.Estudiante?.id || user?.id;

  const { data: materias, loading: loadingMaterias, refetch: refetchMaterias } = useFetchData({
    fetchFn: () => api.get('/api/materias', {
      params: {
        limit: 0,
        ...(estudianteId ? { estudianteId } : {}),
      },
    }).then(res => {
      const lista = res.data?.data || res.data || [];
      return Array.isArray(lista) ? lista : [];
    }),
    deps: [estudianteId],
    timeout: 15000,
  });

  const { data: misMateriasIds, loading: loadingMisMaterias, refetch: refetchMisMaterias } = useFetchData({
    fetchFn: () => api.get(`/api/estudiantes/${user.usuarioId || user.id}/materias-ids`)
      .then(res => res.data?.data || []),
    deps: [user?.id],
    immediate: !!user?.id,
    timeout: 10000,
  });

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchSesiones({ estudianteId }));
    }
    if (estudianteId) {
      dispatch(fetchConexiones(estudianteId));
    }
  }, [user, estudianteId, dispatch]);

  const misMateriasIdsArray = Array.isArray(misMateriasIds) ? misMateriasIds : [];
  const materiasPermitidasIds = Array.isArray(materias)
    ? materias.map((materia) => materia.id)
    : [];

  const filteredSesiones = sesiones.filter(s => {
    if (materiasPermitidasIds.length > 0 && !materiasPermitidasIds.includes(s.materiaId)) {
      return false;
    }

    if (activeTab === 'misMaterias') {
      if (!misMateriasIdsArray.includes(s.materiaId)) return false;
    }
    if (activeTab === 'misSesiones') {
      if (s.creadorId !== estudianteId) return false;
    }
    if (activeTab === 'misInscripciones') {
      if (!s.participantes?.some(p => p.estudianteId === estudianteId)) return false;
    }

    if (filters.materia && s.materiaId !== Number(filters.materia)) return false;
    if (filters.tipo && s.tipo !== filters.tipo) return false;
    if (filters.fechaInicio) {
      const sesionDate = s.fechaHora?.split('T')[0];
      if (sesionDate < format(filters.fechaInicio, 'yyyy-MM-dd')) return false;
    }
    if (filters.fechaFin) {
      const sesionDate = s.fechaHora?.split('T')[0];
      if (sesionDate > format(filters.fechaFin, 'yyyy-MM-dd')) return false;
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
        estudianteId 
      }));
    } else {
      dispatch(addSesion({ 
        sesionData, 
        estudianteId 
      }));
    }
    setModalOpen(false);
    setEditingSesion(null);
  };

  // Handler: Join sesion
  const handleJoin = (sesionId) => {
    dispatch(joinToSesion({ sesionId, estudianteId }))
      .unwrap()
      .catch((err) => {
        console.error('Error joining sesion:', err);
      });
  };

  // Handler: Leave sesion
  const handleLeave = (sesionId) => {
    const sesion = sesiones.find(s => s.id === sesionId);
    const participante = sesion?.participantes?.find(p => 
      p.estudianteId === estudianteId
    );
    
    if (participante) {
      dispatch(leaveSesionThunk({ 
        sesionId, 
        participanteId: participante.id, 
        estudianteId 
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
    dispatch(approveParticipanteThunk({ sesionId, participanteId, estudianteId }));
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
    dispatch(rejectParticipanteThunk({ sesionId, participanteId, estudianteId }));
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
      dispatch(removeSesion({ sesionId: sesionToDelete, estudianteId }));
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

  const showLoading = loading || loadingMaterias || (activeTab === 'misMaterias' && (loadingMisMaterias || misMateriasIds === null));

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
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth disabled={loadingMaterias} ref={materiaFormRef}>
              <InputLabel>Materia</InputLabel>
              <Select
                label="Materia"
                value={filters.materia || ''}
                onChange={(e) => setFilter('materia', e.target.value || null)}
                MenuProps={{
                  PaperProps: { style: { maxHeight: 280, maxWidth: '90vw', width: materiaMenuWidth || undefined } }
                }}
              >
                <MenuItem value="">Todas</MenuItem>
                {materias?.map(m => (
                  <MenuItem key={m.id} value={m.id} sx={{ whiteSpace: 'normal' }}>
                    {m.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha desde"
                value={filters.fechaInicio}
                onChange={(value) => setFilter('fechaInicio', value)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha hasta"
                value={filters.fechaFin}
                onChange={(value) => setFilter('fechaFin', value)}
                slotProps={{ textField: { fullWidth: true } }}
                minDate={filters.fechaInicio || undefined}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={3}>
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

        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
          <Chip
            label="Hoy"
            size="small"
            variant={isQuickActive('hoy') ? 'filled' : 'outlined'}
            color={isQuickActive('hoy') ? 'primary' : 'default'}
            onClick={() => {
              const today = new Date();
              setMultipleFilters({ fechaInicio: today, fechaFin: today });
              setActiveQuick('hoy');
            }}
          />
          <Chip
            label="Esta semana"
            size="small"
            variant={isQuickActive('semana') ? 'filled' : 'outlined'}
            color={isQuickActive('semana') ? 'primary' : 'default'}
            onClick={() => {
              const today = new Date();
              setMultipleFilters({ fechaInicio: startOfWeek(today, { weekStartsOn: 1 }), fechaFin: endOfWeek(today, { weekStartsOn: 1 }) });
              setActiveQuick('semana');
            }}
          />
          <Chip
            label="Este mes"
            size="small"
            variant={isQuickActive('mes') ? 'filled' : 'outlined'}
            color={isQuickActive('mes') ? 'primary' : 'default'}
            onClick={() => {
              const today = new Date();
              setMultipleFilters({ fechaInicio: startOfMonth(today), fechaFin: endOfMonth(today) });
              setActiveQuick('mes');
            }}
          />
          <Chip
            label="Próx. 7 días"
            size="small"
            variant={isQuickActive('7d') ? 'filled' : 'outlined'}
            color={isQuickActive('7d') ? 'primary' : 'default'}
            onClick={() => {
              const today = new Date();
              setMultipleFilters({ fechaInicio: today, fechaFin: addDays(today, 7) });
              setActiveQuick('7d');
            }}
          />
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {showClearButton && (
            <Button
              variant="text"
              onClick={handleClearFilters}
            >
              Limpiar filtros
            </Button>
          )}
        </Box>
      </Box>

      {/* Tab bar */}
      {isMobile ? (
        <FormControl size="small" sx={{ mb: 2, mt: 1 }} fullWidth>
          <InputLabel>Sesiones</InputLabel>
          <Select
            value={activeTab}
            label="Sesiones"
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <MenuItem value="todas">Todas las sesiones</MenuItem>
            <MenuItem value="misMaterias">Mis materias</MenuItem>
            <MenuItem value="misInscripciones">Mis inscripciones</MenuItem>
            <MenuItem value="misSesiones">Mis sesiones</MenuItem>
          </Select>
        </FormControl>
      ) : (
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          <Tab value="todas" label="TODAS LAS SESIONES" />
          <Tab value="misMaterias" label="MIS MATERIAS" />
          <Tab value="misInscripciones" label="MIS INSCRIPCIONES" />
          <Tab value="misSesiones" label="MIS SESIONES" />
        </Tabs>
      )}

      {/* Active Filters Display */}
      {showClearButton && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Filtros activos:
            {filters.materia && ` Materia: ${materias?.find(m => m.id === Number(filters.materia))?.nombre || filters.materia}`}
            {filters.fechaInicio && ` Desde: ${format(filters.fechaInicio, 'dd/MM/yyyy')}`}
            {filters.fechaFin && ` Hasta: ${format(filters.fechaFin, 'dd/MM/yyyy')}`}
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
          onAction={() => dispatch(fetchSesiones({ estudianteId }))}
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
        <Grid container spacing={2}>
          {filteredSesiones.map(sesion => {
            const creator = students.find(st => st.id === sesion.creadorId);
            const creatorPublico = creator?.perfilPublico ?? true;
            const esContacto = conexiones.includes(sesion.creadorId);
            const isCreator = sesion.creadorId === estudianteId;
            let visibilidad = 'publico';
            if (!creatorPublico) {
              visibilidad = isCreator ? 'privado' : 'contacto';
            }

            return (
              <Grid item xs={12} md={6} key={sesion.id}>
                <SesionCard
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
              </Grid>
            );
          })}
        </Grid>
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

      {/* Cancel Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirmar Cancelación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas cancelar esta sesión? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Volver</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Cancelar sesión
          </Button>
        </DialogActions>
</Dialog>
    </PageContainer>
  );
};

export default Sesiones;