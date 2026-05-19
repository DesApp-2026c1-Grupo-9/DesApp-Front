import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
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
  Grid,
  Snackbar,
  Alert,
  Autocomplete,
} from '@mui/material';
import { School, Edit, Delete, Add, MenuBook, RemoveCircleOutline } from '@mui/icons-material';
import api from '../../api/axiosConfig';

function CarrerasTab() {
  const [carreras, setCarreras] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroInstituto, setFiltroInstituto] = useState('todos');
  const [filtroDuracion, setFiltroDuracion] = useState('todos');
  const [open, setOpen] = useState(false);
  const [editCarrera, setEditCarrera] = useState(null);
  const [form, setForm] = useState({ nombre: '', titulo: '', instituto: '', duracion: '' });
  const [planDialog, setPlanDialog] = useState({ open: false, carreraId: null, carreraNombre: '' });
  const [planForm, setPlanForm] = useState({ nombre: '', estado: 'vigente' });
  const [planes, setPlanes] = useState([]);
  const [allMaterias, setAllMaterias] = useState([]);
  const [materiasEditDialog, setMateriasEditDialog] = useState({ open: false, plan: null });
  const [materiaToAdd, setMateriaToAdd] = useState(null);
  const [snackbar, setSnackbar] = useState(null);

  const cargarCarreras = useCallback(async () => {
    try {
      const res = await api.get('/api/carreras');
      setCarreras(res.data.data || []);
    } catch {
      setSnackbar({ severity: 'error', message: 'Error al cargar carreras' });
    }
  }, []);

  useEffect(() => {
    cargarCarreras();
  }, [cargarCarreras]);

  const openEdit = (carrera) => {
    setEditCarrera(carrera);
    setForm({ nombre: carrera.nombre, titulo: carrera.titulo, instituto: carrera.instituto || '', duracion: carrera.duracion?.toString() || '' });
    setOpen(true);
  };

  const openCreate = () => {
    setEditCarrera(null);
    setForm({ nombre: '', titulo: '', instituto: '', duracion: '' });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editCarrera) {
        await api.put(`/api/carreras/${editCarrera.id}`, form);
        setSnackbar({ severity: 'success', message: 'Carrera actualizada' });
      } else {
        await api.post('/api/carreras', form);
        setSnackbar({ severity: 'success', message: 'Carrera creada' });
      }
      setOpen(false);
      cargarCarreras();
    } catch (err) {
      setSnackbar({ severity: 'error', message: err.response?.data?.message || 'Error al guardar' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/carreras/${id}`);
      setSnackbar({ severity: 'success', message: 'Carrera eliminada' });
      cargarCarreras();
    } catch (err) {
      setSnackbar({ severity: 'error', message: err.response?.data?.message || 'Error al eliminar' });
    }
  };

  const openPlanDialog = async (carrera) => {
    setPlanDialog({ open: true, carreraId: carrera.id, carreraNombre: carrera.nombre });
    setPlanForm({ nombre: '', estado: 'vigente' });
    try {
      const [planesRes, materiasRes] = await Promise.all([
        api.get(`/api/carreras/${carrera.id}/planes`),
        api.get('/api/materias'),
      ]);
      setPlanes(planesRes.data.data || []);
      setAllMaterias(materiasRes.data.data || []);
    } catch {
      setPlanes([]);
      setAllMaterias([]);
    }
  };

  const handleCreatePlan = async () => {
    try {
      await api.post(`/api/carreras/${planDialog.carreraId}/planes`, planForm);
      setSnackbar({ severity: 'success', message: 'Plan creado' });
      setPlanForm({ nombre: '', estado: 'vigente' });
      const res = await api.get(`/api/carreras/${planDialog.carreraId}/planes`);
      setPlanes(res.data.data || []);
    } catch (err) {
      setSnackbar({ severity: 'error', message: err.response?.data?.message || 'Error al crear plan' });
    }
  };

  const openMateriasEdit = (plan) => {
    setMateriasEditDialog({ open: true, plan });
    setMateriaToAdd(null);
  };

  const actualizarPlanEnDialog = (nuevosPlanes, planId) => {
    const planActualizado = nuevosPlanes.find((p) => p.id === planId);
    if (planActualizado) {
      setMateriasEditDialog((prev) => ({ ...prev, plan: planActualizado }));
    }
  };

  const handleAddMateriaToPlan = async (planId) => {
    if (!materiaToAdd) return;
    try {
      await api.post(`/api/carreras/${planDialog.carreraId}/planes/${planId}/materias`, { materiaId: materiaToAdd.id });
      setSnackbar({ severity: 'success', message: 'Materia asignada al plan' });
      setMateriaToAdd(null);
      const res = await api.get(`/api/carreras/${planDialog.carreraId}/planes`);
      const nuevosPlanes = res.data.data || [];
      setPlanes(nuevosPlanes);
      actualizarPlanEnDialog(nuevosPlanes, planId);
    } catch (err) {
      setSnackbar({ severity: 'error', message: err.response?.data?.message || 'Error al asignar materia' });
    }
  };

  const handleRemoveMateriaFromPlan = async (planId, materiaId) => {
    try {
      await api.delete(`/api/carreras/${planDialog.carreraId}/planes/${planId}/materias/${materiaId}`);
      setSnackbar({ severity: 'success', message: 'Materia removida del plan' });
      const res = await api.get(`/api/carreras/${planDialog.carreraId}/planes`);
      const nuevosPlanes = res.data.data || [];
      setPlanes(nuevosPlanes);
      actualizarPlanEnDialog(nuevosPlanes, planId);
    } catch (err) {
      setSnackbar({ severity: 'error', message: err.response?.data?.message || 'Error al remover materia' });
    }
  };

  const handleDeletePlan = async (planId) => {
    try {
      await api.delete(`/api/carreras/${planDialog.carreraId}/planes/${planId}`);
      setSnackbar({ severity: 'success', message: 'Plan eliminado' });
      const res = await api.get(`/api/carreras/${planDialog.carreraId}/planes`);
      setPlanes(res.data.data || []);
    } catch (err) {
      setSnackbar({ severity: 'error', message: err.response?.data?.message || 'Error al eliminar plan' });
    }
  };

  const filteredCarreras = carreras.filter((c) => {
    const matchSearch = !searchTerm.trim() ||
      `${c.nombre} ${c.titulo} ${c.instituto}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchInstituto = filtroInstituto === 'todos' || c.instituto === filtroInstituto;
    const matchDuracion = filtroDuracion === 'todos' || c.duracion?.toString() === filtroDuracion.toString();
    return matchSearch && matchInstituto && matchDuracion;
  });

  const institutos = [...new Set(carreras.filter(c => c.instituto).map(c => c.instituto))].sort();
  const duraciones = [...new Set(carreras.filter(c => c.duracion).map(c => c.duracion))].sort((a, b) => a - b);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Gestión de Carreras</Typography>
        <Button variant="contained" startIcon={<School />} onClick={openCreate}>
          Nueva Carrera
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField fullWidth size="small" placeholder="Buscar carrera por nombre, título o instituto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Instituto</InputLabel>
          <Select value={filtroInstituto} label="Instituto" onChange={(e) => setFiltroInstituto(e.target.value)}>
            <MenuItem value="todos">Todos</MenuItem>
            {institutos.map((inst) => (<MenuItem key={inst} value={inst}>{inst}</MenuItem>))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Duración</InputLabel>
          <Select value={filtroDuracion} label="Duración" onChange={(e) => setFiltroDuracion(e.target.value)}>
            <MenuItem value="todos">Todas</MenuItem>
            {duraciones.map((d) => (<MenuItem key={d} value={d}>{d} años</MenuItem>))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Instituto</TableCell>
              <TableCell>Duración</TableCell>
              <TableCell>Materias</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCarreras.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>No hay carreras registradas</TableCell>
              </TableRow>
            ) : (
              filteredCarreras.map((c) => (
                <TableRow key={c.id}>
                  <TableCell sx={{ fontWeight: 'medium' }}>{c.nombre}</TableCell>
                  <TableCell>{c.titulo}</TableCell>
                  <TableCell>{c.instituto}</TableCell>
                  <TableCell>{c.duracion} años</TableCell>
                  <TableCell>{c.totalMaterias}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openPlanDialog(c)} title="Planes de estudio"><MenuBook fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => openEdit(c)} title="Editar"><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(c.id)} title="Eliminar" color="error"><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editCarrera ? 'Editar Carrera' : 'Nueva Carrera'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Instituto" value={form.instituto} onChange={(e) => setForm({ ...form, instituto: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Duración (años)" type="number" value={form.duracion} onChange={(e) => setForm({ ...form, duracion: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>{editCarrera ? 'Guardar' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={planDialog.open} onClose={() => setPlanDialog({ ...planDialog, open: false })} maxWidth="md" fullWidth>
        <DialogTitle>Planes de Estudio - {planDialog.carreraNombre}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField fullWidth size="small" label="Nombre del plan" value={planForm.nombre} onChange={(e) => setPlanForm({ ...planForm, nombre: e.target.value })} />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select value={planForm.estado} label="Estado" onChange={(e) => setPlanForm({ ...planForm, estado: e.target.value })}>
                <MenuItem value="vigente">Vigente</MenuItem>
                <MenuItem value="transición">En transición</MenuItem>
                <MenuItem value="discontinuado">Discontinuado</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<Add />} onClick={handleCreatePlan}>Agregar Plan</Button>
          </Box>

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
                  <TableRow key={p.id}>
                    <TableCell sx={{ fontWeight: 'medium' }}>{p.nombre}</TableCell>
                    <TableCell><Chip label={p.estado} size="small" color={p.estado === 'vigente' ? 'success' : p.estado === 'transición' ? 'warning' : 'default'} /></TableCell>
                    <TableCell align="center">{p.totalMaterias}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => openMateriasEdit(p)} title="Gestionar materias"><MenuBook fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDeletePlan(p.id)} color="error" title="Eliminar plan"><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {planes.length === 0 && (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}>No hay planes de estudio</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

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
                  <Autocomplete
                    fullWidth
                    size="small"
                    options={allMaterias.filter((m) => !materiasEditDialog.plan?.materias?.some((pm) => pm.id === m.id)).sort((a, b) => a.anio - b.anio || a.nombre.localeCompare(b.nombre))}
                    getOptionLabel={(m) => `${m.nombre} (${m.anio}° año, ${m.tipo})`}
                    value={materiaToAdd}
                    onChange={(_, newValue) => setMateriaToAdd(newValue)}
                    isOptionEqualToValue={(opt, val) => opt.id === val?.id}
                    noOptionsText={allMaterias.filter((m) => !materiasEditDialog.plan?.materias?.some((pm) => pm.id === m.id)).length === 0 ? 'Todas las materias ya están asignadas' : 'Sin resultados'}
                    renderInput={(params) => <TextField {...params} label="Buscar materia" placeholder="Escribí el nombre..." />}
                  />
                  <Button variant="contained" startIcon={<Add />} onClick={() => handleAddMateriaToPlan(materiasEditDialog.plan?.id)} disabled={!materiaToAdd} sx={{ minWidth: 130 }}>Asignar</Button>
                </Box>
              </Paper>

              <Typography variant="subtitle2" gutterBottom>Materias del plan</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead><TableRow><TableCell>Materia</TableCell><TableCell width={80}>Año</TableCell><TableCell width={130}>Tipo</TableCell><TableCell width={80} align="center">Acciones</TableCell></TableRow></TableHead>
                  <TableBody>
                    {!materiasEditDialog.plan?.materias?.length ? (
                      <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}><Typography color="text.secondary">Este plan no tiene materias asignadas</Typography></TableCell></TableRow>
                    ) : (
                      [...(materiasEditDialog.plan?.materias || [])].sort((a, b) => a.anio - b.anio || a.nombre.localeCompare(b.nombre)).map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>{m.nombre}</TableCell>
                          <TableCell>{m.anio}° año</TableCell>
                          <TableCell><Chip label={m.tipo} size="small" color={m.tipo === 'anual' ? 'info' : 'secondary'} sx={{ textTransform: 'capitalize' }} /></TableCell>
                          <TableCell align="center"><IconButton size="small" color="error" onClick={() => handleRemoveMateriaFromPlan(materiasEditDialog.plan?.id, m.id)} title="Remover del plan"><RemoveCircleOutline fontSize="small" /></IconButton></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
            <DialogActions><Button onClick={() => setMateriasEditDialog({ ...materiasEditDialog, open: false })}>Cerrar</Button></DialogActions>
          </Dialog>
        </DialogContent>
        <DialogActions><Button onClick={() => setPlanDialog({ ...planDialog, open: false })}>Cerrar</Button></DialogActions>
      </Dialog>

      {snackbar && (
        <Snackbar open autoHideDuration={6000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)} variant="filled">{snackbar.message}</Alert>
        </Snackbar>
      )}
    </Box>
  );
}

export default CarrerasTab;