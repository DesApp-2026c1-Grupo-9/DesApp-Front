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
} from '@mui/material';
import { PersonAdd, Edit, Delete } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { updateStudentActiveStatus } from '../../features/auth/slice';
import api from '../../api/axiosConfig';
import { useSnackbar } from '../../hooks';

function PersonasTab() {
  const [usuarios, setUsuarios] = useState([]);
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
  const dispatch = useDispatch();
  const currentUserId = useSelector((state) => state.auth.user?.id);

  const { showSuccess, showError, snackbar, closeSnackbar } = useSnackbar();

  const handleSort = (field) => {
    setSortDir((prev) => (sortField === field && prev === 'asc' ? 'desc' : 'asc'));
    setSortField(field);
  };

  const cargarUsuarios = useCallback(async () => {
    try {
      const res = await api.get('/api/usuarios');
      setUsuarios(res.data.data || []);
    } catch {
      showError('Error al cargar usuarios');
    }
  }, [showError]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const validarForm = () => {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = 'Requerido';
    if (!form.apellido.trim()) errs.apellido = 'Requerido';
    if (!form.email.trim()) errs.email = 'Requerido';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email inválido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openCreate = () => {
    setEditUser(null);
    setForm({ nombre: '', apellido: '', email: '', password: '', rol: 'estudiante', activo: true });
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      email: user.email || '',
      password: '',
      rol: user.rol || 'estudiante',
      activo: user.activo !== false,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const esEdicion = !!editUser;
    if (!validarForm()) return;

    const body = { ...form };
    if (esEdicion && !body.password) delete body.password;

    try {
      if (esEdicion) {
        await api.put(`/api/usuarios/${editUser.id}`, body);
        showSuccess('Usuario actualizado exitosamente');
        cargarUsuarios();
      } else {
        const res = await api.post('/api/usuarios', body);
        const nuevo = { ...res.data.data, activo: true, perfilPublico: true, visibleEnDescubrir: true };
        setUsuarios((prev) => [nuevo, ...prev]);
        showSuccess('Usuario creado exitosamente');
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

  const handleToggleEstadoClick = (user) => {
    setUserToToggle(user);
  };

  const handleToggleEstadoConfirm = async () => {
    if (!userToToggle) return;
    const user = userToToggle;
    try {
      const nuevoEstado = !user.activo;
      await api.put(`/api/usuarios/${user.id}`, { activo: nuevoEstado });
      setUsuarios((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, activo: nuevoEstado } : u))
      );
      dispatch(updateStudentActiveStatus({ studentId: user.id, activo: nuevoEstado }));
      window.dispatchEvent(new CustomEvent('usuario-estado-cambiado', { detail: { usuarioId: user.id, activo: nuevoEstado } }));
      if (currentUserId === user.id && !nuevoEstado) {
        showError('⚠️ Este usuario está siendo simulado. Al desactivarlo, perderá acceso al cambiar de página.');
      }
      setUserToToggle(null);
    } catch {
      showError('Error al cambiar estado del usuario');
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/api/usuarios/${userToDelete.id}`);
      showSuccess('Usuario eliminado exitosamente');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      cargarUsuarios();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  const filteredUsuarios = usuarios
    .filter((u) => {
      const matchSearch = !searchTerm.trim() ||
        `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRol = filtroRol === 'todos' || u.rol === filtroRol;
      const matchEstado = filtroEstado === 'todos' ||
        (filtroEstado === 'activo' ? u.activo : !u.activo);
      return matchSearch && matchRol && matchEstado;
    })
    .sort((a, b) => {
      let valA, valB;
      if (sortField === 'nombre') {
        valA = `${a.apellido}, ${a.nombre}`.toLowerCase();
        valB = `${b.apellido}, ${b.nombre}`.toLowerCase();
      } else {
        valA = (a[sortField] || '').toString().toLowerCase();
        valB = (b[sortField] || '').toString().toLowerCase();
      }
      const cmp = valA.localeCompare(valB, 'es');
      return sortDir === 'asc' ? cmp : -cmp;
    });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Gestión de Personas ({usuarios.length})</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
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
            {filteredUsuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            ) : (
              filteredUsuarios.map((u) => (
                <TableRow key={u.id}>
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