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
  TableSortLabel,
  TablePagination,
} from '@mui/material';
import { School, Edit, Delete } from '@mui/icons-material';
import api from '../../api/axiosConfig';
import { useSnackbar } from '../../hooks';

function CarrerasTab() {
  const [carreras, setCarreras] = useState([]);
  const [allCarreras, setAllCarreras] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroInstituto, setFiltroInstituto] = useState('todos');
  const [filtroDuracion, setFiltroDuracion] = useState('todos');
  const [open, setOpen] = useState(false);
  const [editCarrera, setEditCarrera] = useState(null);
  const [form, setForm] = useState({ nombre: '', titulo: '', instituto: '', duracion: '' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, carrera: null });
  const [sortField, setSortField] = useState('nombre');
  const [sortDir, setSortDir] = useState('asc');
  const [highlightId, setHighlightId] = useState(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const { showSuccess, showError, snackbar, closeSnackbar } = useSnackbar();

  const handleSort = (field) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDir('asc');
    } else {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    }
    setPage(0);
  };

  const cargarCarreras = useCallback(async () => {
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        sort: sortField,
        dir: sortDir,
        search: searchTerm,
        ...(filtroInstituto !== 'todos' && { instituto: filtroInstituto }),
        ...(filtroDuracion !== 'todos' && { duracion: filtroDuracion }),
      };
      const res = await api.get('/api/carreras', { params });
      setCarreras(res.data.data || []);
      setTotal(res.data.total ?? 0);
    } catch {
      showError('Error al cargar carreras');
      setTotal(0);
    }
  }, [page, sortField, sortDir, searchTerm, filtroInstituto, filtroDuracion, rowsPerPage, showError]);

  const cargarAllCarreras = useCallback(async () => {
    try {
      const res = await api.get('/api/carreras', { params: { limit: 1000 } });
      setAllCarreras(res.data.data || []);
    } catch { }
  }, []);

  useEffect(() => {
    cargarCarreras();
  }, [cargarCarreras]);

  useEffect(() => {
    cargarAllCarreras();
  }, [cargarAllCarreras]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, filtroInstituto, filtroDuracion]);

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
        showSuccess('Carrera actualizada');
        cargarCarreras();
      } else {
        const res = await api.post('/api/carreras', form);
        setHighlightId(res.data.data.id);
        setPage(0);
        showSuccess('Carrera creada');
      }
      setOpen(false);
    } catch (err) {
      showError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const openDeleteDialog = (carrera) => {
    setDeleteDialog({ open: true, carrera });
  };

  const handleDelete = async () => {
    const carrera = deleteDialog.carrera;
    if (!carrera) return;
    try {
      await api.delete(`/api/carreras/${carrera.id}`);
      showSuccess('Carrera eliminada');
      setDeleteDialog({ open: false, carrera: null });
      cargarCarreras();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al eliminar');
    }
  };

  useEffect(() => {
    if (!highlightId) return;
    const t = setTimeout(() => setHighlightId(null), 4000);
    return () => clearTimeout(t);
  }, [highlightId]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, filtroInstituto, filtroDuracion]);

  const institutos = [...new Set(allCarreras.filter(c => c.instituto).map(c => c.instituto))].sort();
  const duraciones = [...new Set(allCarreras.filter(c => c.duracion).map(c => c.duracion))].sort((a, b) => a - b);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
              <TableCell>
                <TableSortLabel active={sortField === 'nombre'} direction={sortField === 'nombre' ? sortDir : 'asc'} onClick={() => handleSort('nombre')}>Nombre</TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel active={sortField === 'titulo'} direction={sortField === 'titulo' ? sortDir : 'asc'} onClick={() => handleSort('titulo')}>Título</TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel active={sortField === 'instituto'} direction={sortField === 'instituto' ? sortDir : 'asc'} onClick={() => handleSort('instituto')}>Instituto</TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel active={sortField === 'duracion'} direction={sortField === 'duracion' ? sortDir : 'asc'} onClick={() => handleSort('duracion')}>Duración</TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel active={sortField === 'totalPlanes'} direction={sortField === 'totalPlanes' ? sortDir : 'asc'} onClick={() => handleSort('totalPlanes')}>Planes</TableSortLabel>
              </TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {carreras.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>No hay carreras registradas</TableCell>
              </TableRow>
            ) : (
              carreras.map((c) => (
                <TableRow key={c.id} sx={{ transition: 'background-color 0.5s', backgroundColor: c.id === highlightId ? 'action.selected' : 'inherit' }}>
                  <TableCell sx={{ fontWeight: 'medium' }}>{c.nombre}</TableCell>
                  <TableCell>{c.titulo}</TableCell>
                  <TableCell>{c.instituto}</TableCell>
                  <TableCell>{c.duracion} años</TableCell>
                  <TableCell>{c.totalPlanes}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openEdit(c)} title="Editar"><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => openDeleteDialog(c)} title="Eliminar" color="error"><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {carreras.length > 0 && (
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[rowsPerPage]}
        />
      )}

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

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar la carrera <strong>{deleteDialog.carrera?.nombre}</strong>?</Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>Esta acción no se puede deshacer. Si la carrera tiene planes de estudio asociados, no podrá eliminarse.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      {snackbar && (
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={closeSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity={snackbar.severity} onClose={closeSnackbar} variant="filled">{snackbar.message}</Alert>
        </Snackbar>
      )}
    </Box>
  );
}

export default CarrerasTab;
