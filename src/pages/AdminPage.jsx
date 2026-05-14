import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Tabs, Tab, Card, CardContent, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Chip, Grid,
  Select, MenuItem, FormControl, InputLabel, Alert, Snackbar, Avatar,
} from '@mui/material';
import {
  PersonAdd, School, MenuBook, Edit, Delete, Add, AdminPanelSettings, Refresh,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

function TabPanel({ children, value, index }) {
  return value === index && <Box sx={{ py: 3 }}>{children}</Box>;
}

function PersonasTab() {
  const [usuarios, setUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', rol: 'estudiante', activo: true });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState(null);

  const cargarUsuarios = useCallback(async () => {
    try {
      const res = await api.get('/api/usuarios');
      setUsuarios(res.data.data || []);
    } catch {
      setSnackbar({ severity: 'error', message: 'Error al cargar usuarios' });
    }
  }, []);

  useEffect(() => { cargarUsuarios(); }, [cargarUsuarios]);

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
        setSnackbar({ severity: 'success', message: 'Usuario actualizado exitosamente' });
      } else {
        await api.post('/api/usuarios', body);
        setSnackbar({ severity: 'success', message: 'Usuario creado exitosamente' });
      }
      setDialogOpen(false);
      cargarUsuarios();
    } catch (err) {
      setSnackbar({ severity: 'error', message: err.response?.data?.message || 'Error al guardar usuario' });
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
      setSnackbar({ severity: 'success', message: 'Usuario eliminado exitosamente' });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      cargarUsuarios();
    } catch (err) {
      setSnackbar({ severity: 'error', message: err.response?.data?.message || 'Error al eliminar usuario' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Gestión de Personas ({usuarios.length})</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={cargarUsuarios}>
            Recargar
          </Button>
          <Button variant="contained" startIcon={<PersonAdd />} onClick={openCreate}>
            Nueva Persona
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField fullWidth size="small" placeholder="Buscar por nombre, apellido o email..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(() => {
              const filtrados = usuarios.filter((u) => {
                const matchSearch = !searchTerm.trim() ||
                  `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase());
                const matchRol = filtroRol === 'todos' || u.rol === filtroRol;
                const matchEstado = filtroEstado === 'todos' ||
                  (filtroEstado === 'activo' ? u.activo : !u.activo);
                return matchSearch && matchRol && matchEstado;
              });
              return filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    No hay usuarios registrados
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 14 }}>
                        {u.nombre?.charAt(0)}{u.apellido?.charAt(0)}
                      </Avatar>
                      {u.nombre} {u.apellido}
                    </Box>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip label={u.rol} size="small"
                      color={u.rol === 'administrador' ? 'warning' : 'primary'} />
                  </TableCell>
                  <TableCell>
                    <Chip label={u.activo ? 'Activo' : 'Inactivo'} size="small"
                      color={u.activo ? 'success' : 'default'} />
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
              );
            })()}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editUser ? 'Editar Persona' : 'Crear Nueva Persona'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField fullWidth label="Nombre" value={form.nombre}
                error={!!errors.nombre} helperText={errors.nombre} required
                onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Apellido" value={form.apellido}
                error={!!errors.apellido} helperText={errors.apellido} required
                onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email" type="email" value={form.email}
                error={!!errors.email} helperText={errors.email} required
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Contraseña (opcional)"
                type="password" value={form.password}
                helperText="Dejar vacío si no hay login implementado"
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select value={form.rol} label="Rol"
                  onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                  <MenuItem value="estudiante">Estudiante</MenuItem>
                  <MenuItem value="administrador">Administrador</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            {editUser ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar a <strong>{userToDelete?.nombre} {userToDelete?.apellido}</strong>?
          </Typography>
          {userToDelete?.rol === 'administrador' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Este usuario es administrador. Al eliminarlo perderá acceso al panel de administración.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      {snackbar && (
        <Snackbar open autoHideDuration={6000} onClose={() => setSnackbar(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}

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
  const [snackbar, setSnackbar] = useState(null);

  const cargarCarreras = useCallback(async () => {
    try {
      const res = await api.get('/api/carreras');
      setCarreras(res.data.data || []);
    } catch {
      setSnackbar({ severity: 'error', message: 'Error al cargar carreras' });
    }
  }, []);

  useEffect(() => { cargarCarreras(); }, [cargarCarreras]);

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
      const res = await api.get(`/api/carreras/${carrera.id}/planes`);
      setPlanes(res.data.data || []);
    } catch { setPlanes([]); }
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Gestión de Carreras</Typography>
        <Button variant="contained" startIcon={<School />} onClick={openCreate}>
          Nueva Carrera
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField fullWidth size="small" placeholder="Buscar carrera por nombre, título o instituto..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Instituto</InputLabel>
          <Select value={filtroInstituto} label="Instituto" onChange={(e) => setFiltroInstituto(e.target.value)}>
            <MenuItem value="todos">Todos</MenuItem>
            {[...new Set(carreras.filter(c => c.instituto).map(c => c.instituto))].sort().map((inst) => (
              <MenuItem key={inst} value={inst}>{inst}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Duración</InputLabel>
          <Select value={filtroDuracion} label="Duración" onChange={(e) => setFiltroDuracion(e.target.value)}>
            <MenuItem value="todos">Todas</MenuItem>
            {[...new Set(carreras.filter(c => c.duracion).map(c => c.duracion))].sort((a, b) => a - b).map((d) => (
              <MenuItem key={d} value={d}>{d} años</MenuItem>
            ))}
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
            {carreras
              .filter((c) => {
                const matchSearch = !searchTerm.trim() ||
                  `${c.nombre} ${c.titulo} ${c.instituto}`.toLowerCase().includes(searchTerm.toLowerCase());
                const matchInstituto = filtroInstituto === 'todos' || c.instituto === filtroInstituto;
                const matchDuracion = filtroDuracion === 'todos' || c.duracion?.toString() === filtroDuracion.toString();
                return matchSearch && matchInstituto && matchDuracion;
              })
              .map((c) => (
              <TableRow key={c.id}>
                <TableCell sx={{ fontWeight: 'medium' }}>{c.nombre}</TableCell>
                <TableCell>{c.titulo}</TableCell>
                <TableCell>{c.instituto}</TableCell>
                <TableCell>{c.duracion} años</TableCell>
                <TableCell>{c.totalMaterias}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => openPlanDialog(c)} title="Planes de estudio">
                    <MenuBook fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => openEdit(c)} title="Editar">
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(c.id)} title="Eliminar" color="error">
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {carreras.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No hay carreras registradas</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editCarrera ? 'Editar Carrera' : 'Nueva Carrera'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Nombre" value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Título que otorga" value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            </Grid>
            <Grid item xs={8}>
              <TextField fullWidth label="Instituto" value={form.instituto}
                onChange={(e) => setForm({ ...form, instituto: e.target.value })} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="Duración (años)" type="number" value={form.duracion}
                onChange={(e) => setForm({ ...form, duracion: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            {editCarrera ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={planDialog.open} onClose={() => setPlanDialog({ ...planDialog, open: false })} maxWidth="md" fullWidth>
        <DialogTitle>Planes de Estudio - {planDialog.carreraNombre}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, mt: 1 }}>
            <TextField size="small" label="Nombre del plan" value={planForm.nombre}
              onChange={(e) => setPlanForm({ ...planForm, nombre: e.target.value })} />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Estado</InputLabel>
              <Select value={planForm.estado} label="Estado"
                onChange={(e) => setPlanForm({ ...planForm, estado: e.target.value })}>
                <MenuItem value="vigente">Vigente</MenuItem>
                <MenuItem value="transición">En transición</MenuItem>
                <MenuItem value="discontinuado">Discontinuado</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<Add />} onClick={handleCreatePlan}>
              Agregar Plan
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Plan</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Materias</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {planes.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell sx={{ fontWeight: 'medium' }}>{p.nombre}</TableCell>
                    <TableCell>
                      <Chip label={p.estado} size="small"
                        color={p.estado === 'vigente' ? 'success' : p.estado === 'transición' ? 'warning' : 'default'} />
                    </TableCell>
                    <TableCell>{p.totalMaterias}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleDeletePlan(p.id)} color="error">
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {planes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No hay planes de estudio</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlanDialog({ ...planDialog, open: false })}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {snackbar && (
        <Snackbar open autoHideDuration={6000} onClose={() => setSnackbar(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}

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

  useEffect(() => { cargarMaterias(); cargarCarreras(); }, [cargarMaterias, cargarCarreras]);

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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Gestión de Materias</Typography>
        <Button variant="contained" startIcon={<MenuBook />} onClick={openCreate}>
          Nueva Materia
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField fullWidth size="small" placeholder="Buscar materia por nombre..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Año</InputLabel>
          <Select value={filtroAnio} label="Año" onChange={(e) => setFiltroAnio(e.target.value)}>
            <MenuItem value="todos">Todos</MenuItem>
            {[1, 2, 3, 4, 5].map((a) => (
              <MenuItem key={a} value={a}>{a}° Año</MenuItem>
            ))}
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
            {materias
              .filter((m) => {
                const matchSearch = !searchTerm.trim() ||
                  `${m.nombre} ${m.tipo} ${(m.carreras || []).map(c => c.nombre).join(' ')}`.toLowerCase().includes(searchTerm.toLowerCase());
                const matchAnio = filtroAnio === 'todos' || m.anio?.toString() === filtroAnio.toString();
                const matchTipo = filtroTipo === 'todos' || m.tipo === filtroTipo;
                return matchSearch && matchAnio && matchTipo;
              })
              .map((m) => (
              <TableRow key={m.id}>
                <TableCell sx={{ fontWeight: 'medium' }}>{m.nombre}</TableCell>
                <TableCell>{m.anio}° Año</TableCell>
                <TableCell>
                  <Chip label={m.tipo} size="small"
                    color={m.tipo === 'anual' ? 'info' : 'secondary'} />
                </TableCell>
                <TableCell>{getCarrerasForMateria(m)}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => openEdit(m)} title="Editar">
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(m.id)} title="Eliminar" color="error">
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {materias.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">No hay materias registradas</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMateria ? 'Editar Materia' : 'Nueva Materia'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Nombre" value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Año" type="number" value={form.anio}
                onChange={(e) => setForm({ ...form, anio: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select value={form.tipo} label="Tipo"
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  <MenuItem value="cuatrimestral">Cuatrimestral</MenuItem>
                  <MenuItem value="anual">Anual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            {editMateria ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {snackbar && (
        <Snackbar open autoHideDuration={6000} onClose={() => setSnackbar(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState(0);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  if (!user || user.rol !== 'administrador') {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 6, textAlign: 'center' }}>
        <AdminPanelSettings sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" gutterBottom>Acceso Denegado</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Solo los usuarios administradores pueden acceder al panel de administración.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Volver al inicio
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <AdminPanelSettings color="warning" sx={{ fontSize: 32 }} />
        <Typography variant="h4">Panel de Administración</Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab icon={<PersonAdd />} label="Personas" iconPosition="start" />
            <Tab icon={<School />} label="Carreras" iconPosition="start" />
            <Tab icon={<MenuBook />} label="Materias" iconPosition="start" />
          </Tabs>
        </CardContent>
      </Card>

      <TabPanel value={tab} index={0}><PersonasTab /></TabPanel>
      <TabPanel value={tab} index={1}><CarrerasTab /></TabPanel>
      <TabPanel value={tab} index={2}><MateriasTab /></TabPanel>
    </Box>
  );
}
