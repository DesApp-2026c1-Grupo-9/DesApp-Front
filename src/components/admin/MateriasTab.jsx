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
} from '@mui/material';
import { MenuBook, Edit, Delete } from '@mui/icons-material';
import api from '../../api/axiosConfig';
import { useSnackbar } from '../../hooks';

function MateriasTab() {
  const [materias, setMaterias] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [open, setOpen] = useState(false);
  const [editMateria, setEditMateria] = useState(null);
  const [form, setForm] = useState({ nombre: '', tipo: 'cuatrimestral' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, materia: null });

  const { showSuccess, showError, snackbar, closeSnackbar } = useSnackbar();

  const cargarMaterias = useCallback(async () => {
    try {
      const res = await api.get('/api/materias');
      setMaterias(res.data.data || []);
    } catch {
      showError('Error al cargar materias');
    }
  }, [showError]);

  const cargarCarreras = useCallback(async () => {
    try {
      const res = await api.get('/api/carreras');
      setCarreras(res.data.data || []);
    } catch { }
  }, []);

  useEffect(() => {
    cargarMaterias();
    cargarCarreras();
  }, [cargarMaterias, cargarCarreras]);

  const openEdit = (materia) => {
    setEditMateria(materia);
    setForm({ nombre: materia.nombre, tipo: materia.tipo || 'cuatrimestral' });
    setOpen(true);
  };

  const openCreate = () => {
    setEditMateria(null);
    setForm({ nombre: '', tipo: 'cuatrimestral' });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editMateria) {
        await api.put(`/api/materias/${editMateria.id}`, form);
        showSuccess('Materia actualizada');
      } else {
        await api.post('/api/materias', form);
        showSuccess('Materia creada');
      }
      setOpen(false);
      cargarMaterias();
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

  const filteredMaterias = materias.filter((m) => {
    const matchSearch = !searchTerm.trim() ||
      `${m.nombre} ${m.tipo} ${(m.carreras || []).map(c => c.nombre).join(' ')}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filtroTipo === 'todos' || m.tipo === filtroTipo;
    return matchSearch && matchTipo;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Gestión de Materias</Typography>
        <Button variant="contained" startIcon={<MenuBook />} onClick={openCreate}>
          Nueva Materia
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField fullWidth size="small" placeholder="Buscar materia por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
              <TableCell>Nombre</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Carreras</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMaterias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>No hay materias registradas</TableCell>
              </TableRow>
            ) : (
              filteredMaterias.map((m) => (
                <TableRow key={m.id}>
                  <TableCell sx={{ fontWeight: 'medium' }}>{m.nombre}</TableCell>
                  <TableCell><Chip label={m.tipo} size="small" color={m.tipo === 'anual' ? 'info' : 'secondary'} /></TableCell>
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>{editMateria ? 'Guardar' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
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