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

function MateriasTab() {
  const [materias, setMaterias] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroAnio, setFiltroAnio] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [open, setOpen] = useState(false);
  const [editMateria, setEditMateria] = useState(null);
  const [form, setForm] = useState({ nombre: '', anio: '', tipo: 'cuatrimestral' });
  const [snackbar, setSnackbar] = useState(null);

  const cargarMaterias = useCallback(async () => {
    try {
      const res = await api.get('/api/materias');
      setMaterias(res.data.data || []);
    } catch {
      setSnackbar({ severity: 'error', message: 'Error al cargar materias' });
    }
  }, []);

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
    setForm({ nombre: materia.nombre, anio: materia.anio?.toString() || '', tipo: materia.tipo || 'cuatrimestral' });
    setOpen(true);
  };

  const openCreate = () => {
    setEditMateria(null);
    setForm({ nombre: '', anio: '', tipo: 'cuatrimestral' });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editMateria) {
        await api.put(`/api/materias/${editMateria.id}`, form);
        setSnackbar({ severity: 'success', message: 'Materia actualizada' });
      } else {
        await api.post('/api/materias', form);
        setSnackbar({ severity: 'success', message: 'Materia creada' });
      }
      setOpen(false);
      cargarMaterias();
    } catch (err) {
      setSnackbar({ severity: 'error', message: err.response?.data?.message || 'Error al guardar' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/materias/${id}`);
      setSnackbar({ severity: 'success', message: 'Materia eliminada' });
      cargarMaterias();
    } catch (err) {
      setSnackbar({ severity: 'error', message: err.response?.data?.message || 'Error al eliminar' });
    }
  };

  const getCarrerasForMateria = (materia) => {
    return materia.carreras?.map((c) => c.nombre).join(', ') || 'Sin carrera';
  };

  const filteredMaterias = materias.filter((m) => {
    const matchSearch = !searchTerm.trim() ||
      `${m.nombre} ${m.tipo} ${(m.carreras || []).map(c => c.nombre).join(' ')}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAnio = filtroAnio === 'todos' || m.anio?.toString() === filtroAnio.toString();
    const matchTipo = filtroTipo === 'todos' || m.tipo === filtroTipo;
    return matchSearch && matchAnio && matchTipo;
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
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Año</InputLabel>
          <Select value={filtroAnio} label="Año" onChange={(e) => setFiltroAnio(e.target.value)}>
            <MenuItem value="todos">Todos</MenuItem>
            {[1, 2, 3, 4, 5].map((a) => (<MenuItem key={a} value={a}>{a}° Año</MenuItem>))}
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
              <TableCell>Nombre</TableCell>
              <TableCell>Año</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Carreras</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMaterias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>No hay materias registradas</TableCell>
              </TableRow>
            ) : (
              filteredMaterias.map((m) => (
                <TableRow key={m.id}>
                  <TableCell sx={{ fontWeight: 'medium' }}>{m.nombre}</TableCell>
                  <TableCell>{m.anio}° Año</TableCell>
                  <TableCell><Chip label={m.tipo} size="small" color={m.tipo === 'anual' ? 'info' : 'secondary'} /></TableCell>
                  <TableCell>{getCarrerasForMateria(m)}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openEdit(m)} title="Editar"><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(m.id)} title="Eliminar" color="error"><Delete fontSize="small" /></IconButton>
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
            <Grid item xs={8}>
              <TextField fullWidth label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="Año" type="number" value={form.anio} onChange={(e) => setForm({ ...form, anio: e.target.value })} />
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

      {snackbar && (
        <Snackbar open autoHideDuration={6000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)} variant="filled">{snackbar.message}</Alert>
        </Snackbar>
      )}
    </Box>
  );
}

export default MateriasTab;