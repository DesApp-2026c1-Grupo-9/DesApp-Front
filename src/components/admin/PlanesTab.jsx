import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Grid,
  Snackbar,
  Alert,
  TablePagination,
  Checkbox,
} from '@mui/material';
import { Add, Delete, Edit, MenuBook, RemoveCircleOutline, EditNote, CheckCircle } from '@mui/icons-material';
import api from '../../api/axiosConfig';
import { useSnackbar } from '../../hooks';

function PlanesTab() {
  const [carreras, setCarreras] = useState([]);
  const [carreraId, setCarreraId] = useState('');
  const [planes, setPlanes] = useState([]);
  const [allMaterias, setAllMaterias] = useState([]);
  const [planForm, setPlanForm] = useState({ nombre: '', estado: 'vigente' });
  const [planEditDialog, setPlanEditDialog] = useState({ open: false, plan: null });
  const [planEditForm, setPlanEditForm] = useState({ nombre: '', estado: 'vigente' });
  const [materiasEditDialog, setMateriasEditDialog] = useState({ open: false, plan: null });
  const [materiaToAdd, setMateriaToAdd] = useState(null);
  const [selectedAnio, setSelectedAnio] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, plan: null });
  const [removeMateriaDialog, setRemoveMateriaDialog] = useState({ open: false, planId: null, materia: null });
  const [materiasPlan, setMateriasPlan] = useState([]);
  const [totalMateriasPlan, setTotalMateriasPlan] = useState(0);
  const [materiasPlanPage, setMateriasPlanPage] = useState(0);
  const [highlightPlanId, setHighlightPlanId] = useState(null);
  const [highlightMateriaId, setHighlightMateriaId] = useState(null);
  const [refreshMateriasKey, setRefreshMateriasKey] = useState(0);
  const materiasRowsPerPage = 10;
  const [editAnioDialog, setEditAnioDialog] = useState({ open: false, planId: null, materia: null, anio: 1 });
  const [estadoDialog, setEstadoDialog] = useState({ open: false, plan: null, estado: '' });

  useEffect(() => {
    if (!materiasEditDialog.open) return;
    setMateriasPlanPage(0);
  }, [materiasEditDialog.open, materiasEditDialog.plan?.id]);

  useEffect(() => {
    if (!materiasEditDialog.open || !materiasEditDialog.plan?.id) return;
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/carreras/${carreraId}/planes/${materiasEditDialog.plan.id}/materias`, {
          params: { page: materiasPlanPage + 1, limit: materiasRowsPerPage, sort: 'anio', dir: 'asc' },
        });
        setMateriasPlan(res.data.data || []);
        setTotalMateriasPlan(res.data.total ?? 0);
        const maxPage = Math.max(0, Math.ceil((res.data.total ?? 0) / materiasRowsPerPage) - 1);
        if (materiasPlanPage > maxPage) {
          setMateriasPlanPage(maxPage);
        }
      } catch {
        setMateriasPlan([]);
        setTotalMateriasPlan(0);
      }
    };
    fetchData();
  }, [materiasEditDialog.open, materiasEditDialog.plan?.id, materiasPlanPage, carreraId, materiasRowsPerPage, refreshMateriasKey]);

  useEffect(() => {
    if (!highlightPlanId) return;
    const t = setTimeout(() => setHighlightPlanId(null), 4000);
    return () => clearTimeout(t);
  }, [highlightPlanId]);

  useEffect(() => {
    if (!highlightMateriaId) return;
    const t = setTimeout(() => setHighlightMateriaId(null), 4000);
    return () => clearTimeout(t);
  }, [highlightMateriaId]);

  const { showSuccess, showError, snackbar, closeSnackbar } = useSnackbar();

  const cargarCarreras = useCallback(async () => {
    try {
      const res = await api.get('/api/carreras');
      setCarreras(res.data.data || []);
    } catch {
      showError('Error al cargar carreras');
    }
  }, [showError]);

  useEffect(() => {
    cargarCarreras();
  }, [cargarCarreras]);

  useEffect(() => {
    if (!carreraId) {
      setPlanes([]);
      return;
    }
    const fetchPlanes = async () => {
      try {
        const [planesRes, materiasRes] = await Promise.all([
          api.get(`/api/carreras/${carreraId}/planes`),
          api.get(`/api/carreras/${carreraId}/materias`),
        ]);
        setPlanes(planesRes.data.data || []);
        setAllMaterias(materiasRes.data.data || []);
      } catch {
        setPlanes([]);
        setAllMaterias([]);
      }
    };
    fetchPlanes();
  }, [carreraId]);

  const handleCreatePlan = async () => {
    try {
      const res = await api.post(`/api/carreras/${carreraId}/planes`, planForm);
      showSuccess('Plan creado');
      setPlanForm({ nombre: '', estado: 'vigente' });
      setHighlightPlanId(res.data.data.id);
      const planesRes = await api.get(`/api/carreras/${carreraId}/planes`);
      setPlanes(planesRes.data.data || []);
      cargarCarreras();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al crear plan');
    }
  };

  const openMateriasEdit = (plan) => {
    setMateriasEditDialog({ open: true, plan });
    setMateriaToAdd(null);
    setSelectedAnio(1);
  };

  const actualizarPlanEnDialog = (nuevosPlanes, planId) => {
    const planActualizado = nuevosPlanes.find((p) => p.id === planId);
    if (planActualizado) {
      setMateriasEditDialog((prev) => ({ ...prev, plan: planActualizado }));
    }
  };

  const handleAddMateriaToPlan = async (planId) => {
    if (!materiaToAdd) return;
    const addedMateriaId = materiaToAdd.id;
    try {
      await api.post(`/api/carreras/${carreraId}/planes/${planId}/materias`, { materiaId: addedMateriaId, anio: selectedAnio });
      showSuccess('Materia asignada al plan');
      setMateriaToAdd(null);
      const res = await api.get(`/api/carreras/${carreraId}/planes`);
      const nuevosPlanes = res.data.data || [];
      setPlanes(nuevosPlanes);
      actualizarPlanEnDialog(nuevosPlanes, planId);
      setHighlightMateriaId(addedMateriaId);
      setMateriasPlanPage(0);
      setRefreshMateriasKey((k) => k + 1);
      cargarCarreras();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al asignar materia');
    }
  };

  const openEditAnioDialog = (planId, materia) => {
    setEditAnioDialog({ open: true, planId, materia, anio: materia.anio || 1 });
  };

  const handleEditAnio = async () => {
    const { planId, materia } = editAnioDialog;
    if (!planId || !materia) return;
    try {
      await api.delete(`/api/carreras/${carreraId}/planes/${planId}/materias/${materia.id}`);
      await api.post(`/api/carreras/${carreraId}/planes/${planId}/materias`, { materiaId: materia.id, anio: editAnioDialog.anio });
      showSuccess('Año actualizado');
      setEditAnioDialog({ open: false, planId: null, materia: null, anio: 1 });
      const res = await api.get(`/api/carreras/${carreraId}/planes`);
      const nuevosPlanes = res.data.data || [];
      setPlanes(nuevosPlanes);
      actualizarPlanEnDialog(nuevosPlanes, planId);
      setMateriasPlanPage(0);
      setRefreshMateriasKey((k) => k + 1);
      cargarCarreras();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al actualizar año');
    }
  };

  const openRemoveMateriaDialog = (planId, materia) => {
    setRemoveMateriaDialog({ open: true, planId, materia });
  };

  const handleRemoveMateriaFromPlan = async () => {
    const { planId, materia } = removeMateriaDialog;
    if (!planId || !materia) return;
    try {
      await api.delete(`/api/carreras/${carreraId}/planes/${planId}/materias/${materia.id}`);
      showSuccess('Materia removida del plan');
      setRemoveMateriaDialog({ open: false, planId: null, materia: null });
      const res = await api.get(`/api/carreras/${carreraId}/planes`);
      const nuevosPlanes = res.data.data || [];
      setPlanes(nuevosPlanes);
      actualizarPlanEnDialog(nuevosPlanes, planId);
      setMateriasPlanPage(0);
      setRefreshMateriasKey((k) => k + 1);
      cargarCarreras();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al remover materia');
    }
  };

  const openDeleteDialog = (plan) => {
    setDeleteDialog({ open: true, plan });
  };

  const handleDeletePlan = async () => {
    const plan = deleteDialog.plan;
    if (!plan) return;
    try {
      await api.delete(`/api/carreras/${carreraId}/planes/${plan.id}`);
      showSuccess('Plan eliminado');
      setDeleteDialog({ open: false, plan: null });
      const res = await api.get(`/api/carreras/${carreraId}/planes`);
      setPlanes(res.data.data || []);
      cargarCarreras();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al eliminar plan');
    }
  };

  const openPlanEdit = (plan) => {
    setPlanEditDialog({ open: true, plan });
    setPlanEditForm({ nombre: plan.nombre, estado: plan.estado });
  };

  const handleToggleEstadoClick = (plan) => {
    setEstadoDialog({ open: true, plan, estado: plan.estado });
  };

  const handleToggleEstadoConfirm = async () => {
    const { plan, estado } = estadoDialog;
    if (!plan) return;
    try {
      await api.put(`/api/carreras/${carreraId}/planes/${plan.id}`, { nombre: plan.nombre, estado });
      showSuccess('Estado del plan actualizado');
      setEstadoDialog({ open: false, plan: null, estado: '' });
      const res = await api.get(`/api/carreras/${carreraId}/planes`);
      setPlanes(res.data.data || []);
      cargarCarreras();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const handleEditPlan = async () => {
    const plan = planEditDialog.plan;
    if (!plan) return;
    try {
      await api.put(`/api/carreras/${carreraId}/planes/${plan.id}`, planEditForm);
      showSuccess('Plan actualizado');
      setPlanEditDialog({ open: false, plan: null });
      const res = await api.get(`/api/carreras/${carreraId}/planes`);
      setPlanes(res.data.data || []);
      cargarCarreras();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al actualizar plan');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Gestión de Planes de Estudio</Typography>
      </Box>

      <Autocomplete
        fullWidth
        options={carreras}
        getOptionLabel={(c) => c.nombre}
        value={carreras.find((c) => c.id === carreraId) || null}
        onChange={(_, newValue) => setCarreraId(newValue ? newValue.id : '')}
        isOptionEqualToValue={(opt, val) => opt.id === val.id}
        renderInput={(params) => (
          <TextField {...params} label="Buscar carrera" placeholder="Escribí el nombre de la carrera..." />
        )}
        sx={{ mb: 3 }}
      />

      <>
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Nombre del plan" value={planForm.nombre} onChange={(e) => setPlanForm({ ...planForm, nombre: e.target.value })} disabled={!carreraId} />
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth size="small" disabled={!carreraId}>
                <InputLabel>Estado</InputLabel>
                <Select value={planForm.estado} label="Estado" onChange={(e) => setPlanForm({ ...planForm, estado: e.target.value })}>
                  <MenuItem value="vigente">Vigente</MenuItem>
                  <MenuItem value="transición">En transición</MenuItem>
                  <MenuItem value="discontinuado">Discontinuado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <Button variant="contained" startIcon={<Add />} onClick={handleCreatePlan} fullWidth disabled={!carreraId}>
                Agregar Plan
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Plan</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Materias</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {planes.map((p) => (
                <TableRow key={p.id} sx={{ transition: 'background-color 0.5s', backgroundColor: p.id === highlightPlanId ? 'action.selected' : 'inherit' }}>
                  <TableCell sx={{ fontWeight: 'medium' }}>{p.nombre}</TableCell>
                  <TableCell><Chip label={p.estado} size="small" color={p.estado === 'vigente' ? 'success' : p.estado === 'transición' ? 'warning' : 'default'} onClick={() => handleToggleEstadoClick(p)} clickable /></TableCell>
                  <TableCell align="center">{p.totalMaterias}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openPlanEdit(p)} title="Editar plan"><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => openMateriasEdit(p)} title="Gestionar materias"><MenuBook fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => openDeleteDialog(p)} color="error" title="Eliminar plan"><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!carreraId ? (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}>Seleccioná una carrera arriba para ver sus planes</TableCell></TableRow>
              ) : planes.length === 0 && (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}>No hay planes de estudio para esta carrera</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <Typography>¿Estás seguro de que deseas eliminar el plan <strong>{deleteDialog.plan?.nombre}</strong>?</Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>Esta acción no se puede deshacer. También se eliminarán las materias asociadas al plan.</Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}>Cancelar</Button>
            <Button variant="contained" color="error" onClick={handleDeletePlan}>Eliminar</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={estadoDialog.open} onClose={() => setEstadoDialog({ ...estadoDialog, open: false })}>
          <DialogTitle>Cambiar Estado del Plan</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>Seleccioná el nuevo estado para <strong>{estadoDialog.plan?.nombre}</strong>:</Typography>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select value={estadoDialog.estado} label="Estado" onChange={(e) => setEstadoDialog({ ...estadoDialog, estado: e.target.value })}>
                <MenuItem value="vigente">Vigente</MenuItem>
                <MenuItem value="transición">En transición</MenuItem>
                <MenuItem value="discontinuado">Discontinuado</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEstadoDialog({ ...estadoDialog, open: false })}>Cancelar</Button>
            <Button variant="contained" onClick={handleToggleEstadoConfirm}>Guardar</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={planEditDialog.open} onClose={() => setPlanEditDialog({ ...planEditDialog, open: false })} maxWidth="sm" fullWidth>
          <DialogTitle>Editar Plan de Estudio</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Nombre del plan" value={planEditForm.nombre} onChange={(e) => setPlanEditForm({ ...planEditForm, nombre: e.target.value })} sx={{ mt: 2 }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPlanEditDialog({ ...planEditDialog, open: false })}>Cancelar</Button>
            <Button variant="contained" onClick={handleEditPlan}>Guardar</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={materiasEditDialog.open} onClose={() => setMateriasEditDialog({ ...materiasEditDialog, open: false })} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Materias — {materiasEditDialog.plan?.nombre}</span>
              <Chip label={`${materiasEditDialog.plan?.totalMaterias || 0} materias`} color="primary" size="small" />
            </Box>
          </DialogTitle>
          <DialogContent>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>Asignar nueva materia al plan</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Año</InputLabel>
                  <Select value={selectedAnio} label="Año" onChange={(e) => setSelectedAnio(e.target.value)}>
                    {[1, 2, 3, 4, 5].map((a) => (<MenuItem key={a} value={a}>{a}° Año</MenuItem>))}
                  </Select>
                </FormControl>
                <Autocomplete
                  fullWidth
                  size="small"
                  options={allMaterias.filter((m) => !materiasEditDialog.plan?.materias?.some((pm) => pm.id === m.id)).sort((a, b) => a.nombre.localeCompare(b.nombre))}
                  getOptionLabel={(m) => `${m.nombre} (${m.tipo})`}
                  value={materiaToAdd}
                  onChange={(_, newValue) => setMateriaToAdd(newValue)}
                  isOptionEqualToValue={(opt, val) => opt.id === val?.id}
                  noOptionsText={allMaterias.filter((m) => !materiasEditDialog.plan?.materias?.some((pm) => pm.id === m.id)).length === 0 ? 'Todas las materias ya están asignadas' : 'Sin resultados'}
                  renderInput={(params) => <TextField {...params} label="Buscar materia" placeholder="Escribí el nombre..." />}
                />
                <Button variant="contained" startIcon={<CheckCircle />} onClick={() => handleAddMateriaToPlan(materiasEditDialog.plan?.id)} disabled={!materiaToAdd} sx={{ minWidth: 130 }}>Asignar</Button>
              </Box>
            </Paper>

            <Typography variant="subtitle2" gutterBottom>Materias del plan</Typography>
              <>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead><TableRow><TableCell>Materia</TableCell><TableCell width={80}>Año</TableCell><TableCell width={110}>Tipo</TableCell><TableCell width={110} align="center">Acciones</TableCell></TableRow></TableHead>
                    <TableBody>
                      {!totalMateriasPlan ? (
                        <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}><Typography color="text.secondary">Este plan no tiene materias asignadas</Typography></TableCell></TableRow>
                      ) : (
                        materiasPlan.map((m) => (
                          <TableRow key={m.id} sx={{ transition: 'background-color 0.5s', backgroundColor: m.id === highlightMateriaId ? 'action.selected' : 'inherit' }}>
                            <TableCell>{m.nombre}</TableCell>
                            <TableCell>{m.anio}° año</TableCell>
                            <TableCell><Chip label={m.tipo} size="small" color={m.tipo === 'anual' ? 'info' : 'secondary'} sx={{ textTransform: 'capitalize' }} /></TableCell>
                            <TableCell align="center">
                              <IconButton size="small" onClick={() => openEditAnioDialog(materiasEditDialog.plan?.id, m)} title="Cambiar año"><EditNote fontSize="small" /></IconButton>
                              <IconButton size="small" color="error" onClick={() => openRemoveMateriaDialog(materiasEditDialog.plan?.id, m)} title="Remover del plan"><Delete fontSize="small" /></IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {totalMateriasPlan > 0 && (
                  <TablePagination
                    component="div"
                    count={totalMateriasPlan}
                    page={materiasPlanPage}
                    onPageChange={(_, p) => setMateriasPlanPage(p)}
                    rowsPerPage={materiasRowsPerPage}
                    rowsPerPageOptions={[materiasRowsPerPage]}
                  />
                )}
              </>
          </DialogContent>
          <DialogActions><Button onClick={() => setMateriasEditDialog({ ...materiasEditDialog, open: false })}>Cerrar</Button></DialogActions>
        </Dialog>

        <Dialog open={removeMateriaDialog.open} onClose={() => setRemoveMateriaDialog({ ...removeMateriaDialog, open: false })}>
          <DialogTitle>Remover materia del plan</DialogTitle>
          <DialogContent>
            <Typography>¿Estás seguro de que deseas remover <strong>{removeMateriaDialog.materia?.nombre}</strong> del plan?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRemoveMateriaDialog({ ...removeMateriaDialog, open: false })}>Cancelar</Button>
            <Button variant="contained" color="error" onClick={handleRemoveMateriaFromPlan}>Remover</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={editAnioDialog.open} onClose={() => setEditAnioDialog({ ...editAnioDialog, open: false })}>
          <DialogTitle>Cambiar año — {editAnioDialog.materia?.nombre}</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 1, minWidth: 120 }}>
              <InputLabel>Año</InputLabel>
              <Select value={editAnioDialog.anio} label="Año" onChange={(e) => setEditAnioDialog({ ...editAnioDialog, anio: e.target.value })}>
                {[1, 2, 3, 4, 5].map((a) => (<MenuItem key={a} value={a}>{a}° Año</MenuItem>))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditAnioDialog({ ...editAnioDialog, open: false })}>Cancelar</Button>
            <Button variant="contained" onClick={handleEditAnio}>Guardar</Button>
          </DialogActions>
        </Dialog>
      </>

      {snackbar && (
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={closeSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity={snackbar.severity} onClose={closeSnackbar} variant="filled">{snackbar.message}</Alert>
        </Snackbar>
      )}
    </Box>
  );
}

export default PlanesTab;
