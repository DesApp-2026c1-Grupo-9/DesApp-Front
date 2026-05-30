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
  TableSortLabel,
  TablePagination,
} from '@mui/material';
import { MenuBook, Edit, Delete } from '@mui/icons-material';
import api from '../../api/axiosConfig';
import { useSnackbar } from '../../hooks';

function MateriasTab() {
  const [materias, setMaterias] = useState([]);
  const [total, setTotal] = useState(0);
  const [allCarreras, setAllCarreras] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCarrera, setFiltroCarrera] = useState('todos');
  const [open, setOpen] = useState(false);
  const [editMateria, setEditMateria] = useState(null);
  const [form, setForm] = useState({ nombre: '', tipo: 'cuatrimestral', cargaHoraria: '' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, materia: null });
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

  const cargarMaterias = useCallback(async (targetPage) => {
    try {
      const params = {
        page: targetPage !== undefined ? targetPage + 1 : page + 1,
        limit: rowsPerPage,
        sort: sortField,
        dir: sortDir,
        search: searchTerm,
        ...(filtroTipo !== 'todos' && { tipo: filtroTipo }),
        ...(filtroCarrera !== 'todos' && { carreraId: filtroCarrera }),
      };
      const res = await api.get('/api/materias', { params });
      setMaterias(res.data.data || []);
      setTotal(res.data.total ?? 0);
    } catch {
      showError('Error al cargar materias');
      setTotal(0);
    }
  }, [page, sortField, sortDir, searchTerm, filtroTipo, filtroCarrera, rowsPerPage, showError]);

  const cargarCarreras = useCallback(async () => {
    try {
      const res = await api.get('/api/carreras');
      setAllCarreras(res.data.data || []);
    } catch { }
  }, []);

  useEffect(() => {
    cargarMaterias();
  }, [cargarMaterias]);

  useEffect(() => {
    cargarCarreras();
  }, [cargarCarreras]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, filtroTipo, filtroCarrera]);

  const openEdit = (materia) => {
    setEditMateria(materia);
    setForm({ nombre: materia.nombre, tipo: materia.tipo || 'cuatrimestral', cargaHoraria: materia.cargaHoraria?.toString() || '' });
    setOpen(true);
  };

  const openCreate = () => {
    setEditMateria(null);
    setForm({ nombre: '', tipo: 'cuatrimestral', cargaHoraria: '' });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editMateria) {
        await api.put(`/api/materias/${editMateria.id}`, form);
        showSuccess('Materia actualizada');
        cargarMaterias();
      } else {
        const res = await api.post('/api/materias', form);
        const newId = res.data.data.id;
        const sortParams = {
          limit: 100,
          sort: sortField,
          dir: sortDir,
          ...(filtroTipo !== 'todos' && { tipo: filtroTipo }),
        };
        const sortedRes = await api.get('/api/materias', { params: sortParams });
        const sortedData = sortedRes.data.data || [];
        const idx = sortedData.findIndex(m => m.id === newId);
        const targetPage = idx >= 0 ? Math.floor(idx / rowsPerPage) : 0;
        setHighlightId(newId);
        setPage(targetPage);
        showSuccess('Materia creada');
        cargarMaterias(targetPage);
      }
      setOpen(false);
    } catch (err) {
      showError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const openDeleteDialog = (materia) => {
    setDeleteDialog({ open: true, materia });
  };

  const handleDelete = async () => {
    const materia = deleteDialog.materia;
    if (!materia) return;
    try {
      await api.delete(`/api/materias/${materia.id}`);
      showSuccess('Materia eliminada');
      setDeleteDialog({ open: false, materia: null });
      cargarMaterias();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const getCarrerasForMateria = (materia) => {
    return materia.carreras?.map((c) => c.nombre).join(', ') || 'Sin carrera';
  };

  useEffect(() => {
    if (!highlightId) return;
    const t = setTimeout(() => setHighlightId(null), 4000);
    return () => clearTimeout(t);
  }, [highlightId]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Gesti&oacute;n de Materias</Typography>
        <Button variant="contained" startIcon={<MenuBook />} onClick={openCreate}>
          Nueva Materia
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField fullWidth size="small" placeholder="Buscar materia por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Carrera</InputLabel>
          <Select value={filtroCarrera} label="Carrera" onChange={(e) => setFiltroCarrera(e.target.value)}>
            <MenuItem value="todos">Todas</MenuItem>
            {allCarreras.map((c) => (<MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Tipo</InputLabel>
          <Select value={filtroTipo} label="Tipo" onChange={(e) => setFiltroTipo(e.target.value)}>
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="cuatrimestral">Cuatrimestral</MenuItem>
            <MenuItem value="anual">Anual</MenuItem>
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
                <TableSortLabel active={sortField === 'tipo'} direction={sortField === 'tipo' ? sortDir : 'asc'} onClick={() => handleSort('tipo')}>Tipo</TableSortLabel>
              </TableCell>
              <TableCell align="center">Carga Horaria</TableCell>
              <TableCell>
                <TableSortLabel active={sortField === 'carreras'} direction={sortField === 'carreras' ? sortDir : 'asc'} onClick={() => handleSort('carreras')}>Carreras</TableSortLabel>
              </TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {materias.length === 0 ? (
              <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>No hay materias registradas</TableCell>
              </TableRow>
            ) : (
              materias.map((m) => (
                <TableRow key={m.id} sx={{ transition: 'background-color 0.5s', backgroundColor: m.id === highlightId ? 'action.selected' : 'inherit' }}>
                  <TableCell sx={{ fontWeight: 'medium' }}>{m.nombre}</TableCell>
                  <TableCell><Chip label={m.tipo} size="small" color={m.tipo === 'anual' ? 'info' : 'secondary'} /></TableCell>
                  <TableCell align="center">{m.cargaHoraria ?? '-'}</TableCell>
                  <TableCell>{getCarrerasForMateria(m)}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openEdit(m)} title="Editar"><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => openDeleteDialog(m)} title="Eliminar" color="error"><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {materias.length > 0 && (
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
        <DialogTitle>{editMateria ? 'Editar Materia' : 'Nueva Materia'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select value={form.tipo} label="Tipo" onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  <MenuItem value="cuatrimestral">Cuatrimestral</MenuItem>
                  <MenuItem value="anual">Anual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Carga Horaria" type="number" required value={form.cargaHoraria} onChange={(e) => setForm({ ...form, cargaHoraria: e.target.value })} inputProps={{ min: 1 }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>{editMateria ? 'Guardar' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}>
        <DialogTitle>Confirmar Eliminaci&oacute;n</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar la materia <strong>{deleteDialog.materia?.nombre}</strong>?</Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>Esta acción no se puede deshacer. Si la materia está asignada a algún plan, no podrá eliminarse.</Alert>
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

export default MateriasTab;
