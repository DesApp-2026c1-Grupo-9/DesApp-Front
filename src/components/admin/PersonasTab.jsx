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
  Avatar,
  Snackbar,
  Alert,
  TableSortLabel,
  TablePagination,
} from '@mui/material';
import { PersonAdd, Edit, Delete } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { updateStudentActiveStatus, fetchStudents } from '../../features/auth/slice';
import api from '../../api/axiosConfig';
import { useSnackbar } from '../../hooks';

function PersonasTab() {
  const [usuarios, setUsuarios] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToToggle, setUserToToggle] = useState(null);
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', rol: 'estudiante', activo: true });
  const [errors, setErrors] = useState({});
  const [sortField, setSortField] = useState('apellido');
  const [sortDir, setSortDir] = useState('asc');
  const [highlightId, setHighlightId] = useState(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const dispatch = useDispatch();
  const currentUserId = useSelector((state) => state.auth.user?.id);

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

  const cargarUsuarios = useCallback(async (targetPage) => {
    try {
      const params = {
        page: targetPage !== undefined ? targetPage + 1 : page + 1,
        limit: rowsPerPage,
        sort: sortField,
        dir: sortDir,
        search: searchTerm,
        ...(filtroRol !== 'todos' && { rol: filtroRol }),
        ...(filtroEstado !== 'todos' && { activo: filtroEstado === 'activo' }),
      };
      const res = await api.get('/api/usuarios', { params });
      setUsuarios(res.data.data || []);
      setTotal(res.data.total ?? 0);
    } catch {
      showError('Error al cargar usuarios');
      setTotal(0);
    }
  }, [page, sortField, sortDir, searchTerm, filtroRol, filtroEstado, rowsPerPage, showError]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, filtroRol, filtroEstado]);

  useEffect(() => {
    if (!highlightId) return;
    const t = setTimeout(() => setHighlightId(null), 4000);
    return () => clearTimeout(t);
  }, [highlightId]);

  const openCreate = () => {
    setEditUser(null);
    setForm({ nombre: '', apellido: '', email: '', password: '', rol: 'estudiante', activo: true });
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ nombre: user.nombre, apellido: user.apellido, email: user.email, password: '', rol: user.rol, activo: user.activo });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!form.nombre.trim()) newErrors.nombre = 'Requerido';
    if (!form.apellido.trim()) newErrors.apellido = 'Requerido';
    if (!form.email.trim()) newErrors.email = 'Requerido';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      if (editUser) {
        await api.put(`/api/usuarios/${editUser.id}`, form);
        showSuccess('Usuario actualizado exitosamente');
        cargarUsuarios();
      } else {
        const res = await api.post('/api/usuarios', form);
        const newId = res.data.data.id;
        const sortParams = {
          limit: 100,
          sort: sortField,
          dir: sortDir,
          ...(filtroRol !== 'todos' && { rol: filtroRol }),
          ...(filtroEstado !== 'todos' && { activo: filtroEstado === 'activo' }),
        };
        const sortedRes = await api.get('/api/usuarios', { params: sortParams });
        const sortedData = sortedRes.data.data || [];
        const idx = sortedData.findIndex(u => u.id === newId);
        const targetPage = idx >= 0 ? Math.floor(idx / rowsPerPage) : 0;
        setHighlightId(newId);
        setPage(targetPage);
        showSuccess('Usuario creado exitosamente');
        cargarUsuarios(targetPage);
      }
      setDialogOpen(false);
    } catch (err) {
      showError(err.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const openDelete = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/api/usuarios/${userToDelete.id}`);
      showSuccess('Usuario eliminado exitosamente');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      dispatch(fetchStudents());
      cargarUsuarios();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  const handleToggleEstadoClick = (user) => {
    setUserToToggle(user);
  };

  const handleToggleEstadoConfirm = async () => {
    if (!userToToggle) return;
    try {
      const res = await api.put(`/api/usuarios/${userToToggle.id}`, { activo: !userToToggle.activo });
      showSuccess(`Usuario ${userToToggle.activo ? 'desactivado' : 'activado'} exitosamente`);
      setUserToToggle(null);
      cargarUsuarios();
      if (res.data.data?.id?.toString() === currentUserId?.toString()) {
        dispatch(updateStudentActiveStatus(res.data.data.activo));
        window.dispatchEvent(new CustomEvent('activo-changed', { detail: { activo: res.data.data.activo } }));
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Error al cambiar estado');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ lineHeight: '36px', my: 0 }}>Gestión de Personas ({usuarios.length})</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button variant="contained" startIcon={<PersonAdd />} onClick={openCreate}>
            Nueva Persona
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por nombre, apellido o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Rol</InputLabel>
          <Select value={filtroRol} label="Rol" onChange={(e) => setFiltroRol(e.target.value)}>
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="estudiante">Estudiante</MenuItem>
            <MenuItem value="administrador">Administrador</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Estado</InputLabel>
          <Select value={filtroEstado} label="Estado" onChange={(e) => setFiltroEstado(e.target.value)}>
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="activo">Activo</MenuItem>
            <MenuItem value="inactivo">Inactivo</MenuItem>
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
                <TableSortLabel active={sortField === 'email'} direction={sortField === 'email' ? sortDir : 'asc'} onClick={() => handleSort('email')}>Email</TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel active={sortField === 'rol'} direction={sortField === 'rol' ? sortDir : 'asc'} onClick={() => handleSort('rol')}>Rol</TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel active={sortField === 'activo'} direction={sortField === 'activo' ? sortDir : 'asc'} onClick={() => handleSort('activo')}>Estado</TableSortLabel>
              </TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            ) : (
              usuarios.map((u) => (
                <TableRow key={u.id} sx={{ transition: 'background-color 0.5s', backgroundColor: u.id === highlightId ? 'action.selected' : 'inherit' }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 14 }}>
                        {u.nombre?.charAt(0)}{u.apellido?.charAt(0)}
                      </Avatar>
                      {u.apellido}, {u.nombre}
                    </Box>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip label={u.rol} size="small" color={u.rol === 'administrador' ? 'warning' : 'primary'} />
                  </TableCell>
                  <TableCell>
                    <Chip label={u.activo ? 'Activo' : 'Inactivo'} size="small" color={u.activo ? 'success' : 'default'} onClick={() => handleToggleEstadoClick(u)} clickable />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openEdit(u)} title="Editar">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => openDelete(u)} title="Eliminar" color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {usuarios.length > 0 && (
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[rowsPerPage]}
        />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editUser ? 'Editar Persona' : 'Crear Nueva Persona'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField fullWidth label="Nombre" value={form.nombre} error={!!errors.nombre} helperText={errors.nombre} required onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Apellido" value={form.apellido} error={!!errors.apellido} helperText={errors.apellido} required onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email" type="email" value={form.email} error={!!errors.email} helperText={errors.email} required onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Contraseña (opcional)" type="password" value={form.password} helperText="Dejar vacío si no hay login implementado" onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select value={form.rol} label="Rol" onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                  <MenuItem value="estudiante">Estudiante</MenuItem>
                  <MenuItem value="administrador">Administrador</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>{editUser ? 'Guardar' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar a <strong>{userToDelete?.nombre} {userToDelete?.apellido}</strong>?</Typography>
          {userToDelete?.rol === 'administrador' && (
            <Alert severity="warning" sx={{ mt: 2 }}>Este usuario es administrador. Al eliminarlo perderá acceso al panel de administración.</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!userToToggle} onClose={() => setUserToToggle(null)}>
        <DialogTitle>{userToToggle?.activo ? 'Desactivar' : 'Activar'} Usuario</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas {userToToggle?.activo ? 'desactivar' : 'activar'} a <strong>{userToToggle?.apellido}, {userToToggle?.nombre}</strong>?</Typography>
          {userToToggle?.activo && (
            <Alert severity="warning" sx={{ mt: 2 }}>El usuario no podrá realizar operaciones en el sistema hasta que sea activado nuevamente.</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserToToggle(null)}>Cancelar</Button>
          <Button variant="contained" color={userToToggle?.activo ? 'error' : 'success'} onClick={handleToggleEstadoConfirm}>Sí, {userToToggle?.activo ? 'desactivar' : 'activar'}</Button>
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

export default PersonasTab;