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
  TablePagination,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Collapse,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  CheckCircle,
  Cancel,
  Edit,
  Delete,
  Add,
  Gavel,
  Flag,
  Settings,
  FilterList,
  Search,
} from '@mui/icons-material';
import api from '../../api/axiosConfig';
import { useSnackbar } from '../../hooks';
import { TabPanel, LoadingSpinner, EmptyState } from '../ui';

const ESTADO_COLORS = {
  pendiente: 'warning',
  confirmada: 'error',
  rechazada: 'default',
  revocada: 'info',
};

const ESTADO_LABELS = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  rechazada: 'Rechazada',
  revocada: 'Revocada',
};

function ListaDenuncias({ showSuccess, showError }) {
  const [denuncias, setDenuncias] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [filtroEstado, setFiltroEstado] = useState('pendiente');
  const [filtroMaterial, setFiltroMaterial] = useState('');
  const [filtroMotivo, setFiltroMotivo] = useState('todos');
  const [motivos, setMotivos] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedDenuncia, setSelectedDenuncia] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loadingDenuncias, setLoadingDenuncias] = useState(false);
  const rowsPerPage = 15;

  useEffect(() => {
    api.get('/api/admin/motivos-denuncia').then((res) => {
      setMotivos(res.data.data || []);
    }).catch((err) => {
      showError(err.response?.data?.message || 'Error al cargar motivos');
    });
  }, []);

  const cargarDenuncias = useCallback(async () => {
    setLoadingDenuncias(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        sort: 'createdAt',
        dir: 'DESC',
      };
      if (filtroEstado !== 'todas') params.estado = filtroEstado;
      if (filtroMaterial.trim()) params.materialSearch = filtroMaterial.trim();
      if (filtroMotivo !== 'todos') params.motivoId = filtroMotivo;

      const res = await api.get('/api/admin/denuncias', { params });
      setDenuncias(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {
      showError('Error al cargar denuncias');
    } finally {
      setLoadingDenuncias(false);
    }
  }, [page, filtroEstado, filtroMaterial, filtroMotivo, showError]);

  useEffect(() => {
    cargarDenuncias();
  }, [cargarDenuncias]);

  useEffect(() => {
    setPage(0);
  }, [filtroEstado, filtroMaterial, filtroMotivo]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(total / rowsPerPage) - 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [total, rowsPerPage]);

  const limpiarFiltros = () => {
    setFiltroEstado('pendiente');
    setFiltroMaterial('');
    setFiltroMotivo('todos');
  };

  const openDetail = async (denuncia) => {
    try {
      const res = await api.get(`/api/admin/denuncias/${denuncia.id}`);
      setSelectedDenuncia(res.data.data);
      setDetailOpen(true);
    } catch {
      showError('Error al obtener detalle de la denuncia');
    }
  };

  const handleConfirmar = async () => {
    if (!selectedDenuncia) return;
    try {
      const res = await api.put(`/api/admin/denuncias/${selectedDenuncia.id}/confirmar`);
      showSuccess(res.data.message);
      setDetailOpen(false);
      setSelectedDenuncia(null);
      cargarDenuncias();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al confirmar denuncia');
    }
  };

  const handleRechazar = async () => {
    if (!selectedDenuncia) return;
    try {
      await api.put(`/api/admin/denuncias/${selectedDenuncia.id}/rechazar`);
      showSuccess('Denuncia rechazada');
      setDetailOpen(false);
      setSelectedDenuncia(null);
      cargarDenuncias();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al rechazar denuncia');
    }
  };

  const handleRestaurar = async () => {
    if (!selectedDenuncia?.material?.id) return;
    try {
      const res = await api.put(`/api/admin/materiales/${selectedDenuncia.material.id}/restaurar`);
      showSuccess(res.data.message);
      setDetailOpen(false);
      setSelectedDenuncia(null);
      cargarDenuncias();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al restaurar material');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Denuncias ({total})</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mb: filterOpen ? { xs: 1, sm: 0 } : 2 }}>
        <TextField
          size="small"
          placeholder="Buscar por material..."
          value={filtroMaterial}
          onChange={(e) => setFiltroMaterial(e.target.value)}
          sx={{ flexGrow: 1 }}
          slotProps={{
            input: {
              startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
            },
          }}
        />
        <Button
          variant={filterOpen ? 'contained' : 'outlined'}
          startIcon={<FilterList />}
          onClick={() => setFilterOpen(!filterOpen)}
          sx={{ whiteSpace: 'nowrap', alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          Filtrar
        </Button>
      </Box>

      <Collapse in={filterOpen}>
        <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select value={filtroEstado} label="Estado" onChange={(e) => setFiltroEstado(e.target.value)}>
                  <MenuItem value="todas">Todas</MenuItem>
                  <MenuItem value="pendiente">Pendientes</MenuItem>
                  <MenuItem value="confirmada">Confirmadas</MenuItem>
                  <MenuItem value="rechazada">Rechazadas</MenuItem>
                  <MenuItem value="revocada">Revocadas</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={5}>
              <FormControl fullWidth size="small">
                <InputLabel>Motivo</InputLabel>
                <Select value={filtroMotivo} label="Motivo" onChange={(e) => setFiltroMotivo(e.target.value)}>
                  <MenuItem value="todos">Todos</MenuItem>
                  {motivos.map((m) => (
                    <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button variant="text" onClick={limpiarFiltros} fullWidth>
                Limpiar filtros
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Collapse>

      {loadingDenuncias ? (
        <LoadingSpinner message="Cargando denuncias..." />
      ) : denuncias.length === 0 ? (
        <EmptyState icon="inbox" title="No hay denuncias" message={`No hay denuncias${filtroEstado !== 'todas' ? ` con estado "${ESTADO_LABELS[filtroEstado]?.toLowerCase()}"` : ''} que coincidan con los filtros.`} />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Material</TableCell>
                <TableCell>Denunciante</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {denuncias.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>#{d.id}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.material?.titulo || `Material #${d.materialId}`}
                  </TableCell>
                  <TableCell>{d.denunciante?.nombre} {d.denunciante?.apellido}</TableCell>
                  <TableCell>{d.motivo?.nombre}</TableCell>
                  <TableCell>
                    <Chip
                      label={ESTADO_LABELS[d.estado]}
                      size="small"
                      color={ESTADO_COLORS[d.estado]}
                    />
                  </TableCell>
                  <TableCell>{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver detalle">
                      <IconButton size="small" onClick={() => openDetail(d)}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {total > 0 && (
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[rowsPerPage]}
        />
      )}

      <Dialog open={detailOpen} onClose={() => { setDetailOpen(false); setSelectedDenuncia(null); }} maxWidth="md" fullWidth>
        {selectedDenuncia && (
          <>
            <DialogTitle>
              Detalle de Denuncia #{selectedDenuncia.id}
              <Chip
                label={ESTADO_LABELS[selectedDenuncia.estado]}
                size="small"
                color={ESTADO_COLORS[selectedDenuncia.estado]}
                sx={{ ml: 1 }}
              />
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Material Denunciado</Typography>
                  <Typography variant="body1"><strong>{selectedDenuncia.material?.titulo}</strong></Typography>
                  {selectedDenuncia.material?.descripcion && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {selectedDenuncia.material.descripcion}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    <Chip label={`Tipo: ${selectedDenuncia.material?.tipo}`} size="small" variant="outlined" />
                    <Chip label={`Materia: ${selectedDenuncia.material?.materia?.nombre || '-'}`} size="small" variant="outlined" />
                    {selectedDenuncia.material?.suspendido && (
                      <Chip label="Suspendido" size="small" color="error" />
                    )}
                  </Box>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Publicado por: {selectedDenuncia.material?.creador?.nombre} {selectedDenuncia.material?.creador?.apellido} ({selectedDenuncia.material?.creador?.email})
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Denunciante</Typography>
                  <Typography variant="body1">
                    {selectedDenuncia.denunciante?.nombre} {selectedDenuncia.denunciante?.apellido}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedDenuncia.denunciante?.email}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Motivo</Typography>
                  <Typography variant="body1"><strong>{selectedDenuncia.motivo?.nombre}</strong></Typography>
                </Grid>

                {selectedDenuncia.detalle && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Detalle de la denuncia</Typography>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', mt: 0.5 }}>
                      <Typography variant="body2">{selectedDenuncia.detalle}</Typography>
                    </Paper>
                  </Grid>
                )}

                {selectedDenuncia.estado !== 'pendiente' && (
                  <Grid item xs={12}>
                    <Divider />
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Moderado por: {selectedDenuncia.moderador?.nombre} {selectedDenuncia.moderador?.apellido}
                      </Typography>
                      {selectedDenuncia.fechaModeracion && (
                        <Typography variant="caption" color="text.secondary">
                          {new Date(selectedDenuncia.fechaModeracion).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Button onClick={() => { setDetailOpen(false); setSelectedDenuncia(null); }}>
                Cerrar
              </Button>
              {selectedDenuncia.estado === 'pendiente' && (
                <>
                  <Button variant="contained" color="error" startIcon={<CheckCircle />} onClick={handleConfirmar}>
                    Confirmar Denuncia
                  </Button>
                  <Button variant="outlined" startIcon={<Cancel />} onClick={handleRechazar}>
                    Rechazar Denuncia
                  </Button>
                </>
              )}
              {selectedDenuncia.material?.suspendido && (
                <Button
                  variant="outlined"
                  color="success"
                  onClick={handleRestaurar}
                >
                  Restaurar Material
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

function MotivosDenuncia({ showSuccess, showError }) {
  const [motivos, setMotivos] = useState([]);
  const [loadingMotivos, setLoadingMotivos] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMotivo, setEditMotivo] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [errors, setErrors] = useState({});

  const cargarMotivos = useCallback(async () => {
    setLoadingMotivos(true);
    try {
      const res = await api.get('/api/admin/motivos-denuncia');
      setMotivos(res.data.data || []);
    } catch {
      showError('Error al cargar motivos');
    } finally {
      setLoadingMotivos(false);
    }
  }, [showError]);

  useEffect(() => {
    cargarMotivos();
  }, [cargarMotivos]);

  const openCreate = () => {
    setEditMotivo(null);
    setForm({ nombre: '', descripcion: '' });
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (motivo) => {
    setEditMotivo(motivo);
    setForm({ nombre: motivo.nombre, descripcion: motivo.descripcion || '' });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!form.nombre.trim()) newErrors.nombre = 'Requerido';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      if (editMotivo) {
        await api.put(`/api/admin/motivos-denuncia/${editMotivo.id}`, form);
        showSuccess('Motivo actualizado exitosamente');
      } else {
        await api.post('/api/admin/motivos-denuncia', form);
        showSuccess('Motivo creado exitosamente');
      }
      setDialogOpen(false);
      cargarMotivos();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al guardar motivo');
    }
  };

  const handleDelete = async (motivo) => {
    if (!confirm(`¿Estás seguro de eliminar el motivo "${motivo.nombre}"?`)) return;
    try {
      await api.delete(`/api/admin/motivos-denuncia/${motivo.id}`);
      showSuccess('Motivo eliminado/desactivado exitosamente');
      cargarMotivos();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al eliminar motivo');
    }
  };

  const handleToggleActivo = async (motivo) => {
    try {
      await api.put(`/api/admin/motivos-denuncia/${motivo.id}`, { activo: !motivo.activo });
      showSuccess(`Motivo ${motivo.activo ? 'desactivado' : 'activado'} exitosamente`);
      cargarMotivos();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al cambiar estado');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Motivos de Denuncia ({motivos.length})</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
          Nuevo Motivo
        </Button>
      </Box>

      {loadingMotivos ? (
        <LoadingSpinner message="Cargando motivos..." />
      ) : motivos.length === 0 ? (
        <EmptyState icon="inbox" title="No hay motivos de denuncia" message="No hay motivos de denuncia configurados." />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {motivos.map((m) => (
                <TableRow key={m.id} sx={{ opacity: m.activo ? 1 : 0.5 }}>
                  <TableCell>{m.nombre}</TableCell>
                  <TableCell>{m.descripcion || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={m.activo ? 'Activo' : 'Inactivo'}
                      size="small"
                      color={m.activo ? 'success' : 'default'}
                      onClick={() => handleToggleActivo(m)}
                      clickable
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openEdit(m)} title="Editar">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(m)} title="Eliminar" color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMotivo ? 'Editar Motivo' : 'Nuevo Motivo'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del motivo"
                value={form.nombre}
                error={!!errors.nombre}
                helperText={errors.nombre}
                required
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={form.descripcion}
                multiline
                rows={3}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            {editMotivo ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function ConfiguracionModeracion({ showSuccess, showError }) {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarConfig();
  }, []);

  const cargarConfig = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/configuracion-moderacion');
      const data = (res.data.data || []).sort((a, b) => a.id - b.id);
      setConfigs(data);
    } catch {
      showError('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id, valor) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, valor: parseInt(valor) || 0 } : c))
    );
  };

  const handleSave = async (config) => {
    if (config.valor < 1) {
      showError('El valor debe ser un número entero positivo');
      return;
    }
    try {
      await api.put('/api/admin/configuracion-moderacion', { id: config.id, valor: config.valor });
      showSuccess(`"${config.clave}" actualizado a ${config.valor}`);
    } catch (err) {
      showError(err.response?.data?.message || 'Error al guardar configuración');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando configuración..." />;
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Configuración de Moderación</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configurar los umbrales que determinan cuándo un material se suspende automáticamente.
      </Typography>

      <Grid container spacing={2}>
        {configs.map((config) => (
          <Grid item xs={12} md={6} key={config.id}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {config.clave === 'N_DENUNCIAS_PENDIENTES'
                    ? 'Denuncias Pendientes (N)'
                    : 'Denuncias Verificadas (M)'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {config.descripcion}
                </Typography>
                <TextField
                  type="number"
                  size="small"
                  label="Valor"
                  value={config.valor}
                  onChange={(e) => handleChange(config.id, e.target.value)}
                  inputProps={{ min: 1 }}
                  sx={{ width: 120 }}
                />
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleSave(config)}
                >
                  Guardar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default function ModeracionTab() {
  const [subTab, setSubTab] = useState(0);
  const { showSuccess, showError, snackbar, closeSnackbar } = useSnackbar();

  return (
    <Box>
      <Tabs
        value={subTab}
        onChange={(_, v) => setSubTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 3,
          minHeight: 10,
          '& .MuiTab-root': {
            pt: 1, pb: 1, minHeight: 10,
            '& .MuiTab-iconWrapper': { mb: 0 },
          },
        }}
      >
        <Tab icon={<Flag />} label="Denuncias" iconPosition="start" />
        <Tab icon={<Gavel />} label="Motivos" iconPosition="start" />
        <Tab icon={<Settings />} label="Configuración" iconPosition="start" />
      </Tabs>

      <TabPanel value={subTab} index={0}>
        <ListaDenuncias showSuccess={showSuccess} showError={showError} />
      </TabPanel>
      <TabPanel value={subTab} index={1}>
        <MotivosDenuncia showSuccess={showSuccess} showError={showError} />
      </TabPanel>
      <TabPanel value={subTab} index={2}>
        <ConfiguracionModeracion showSuccess={showSuccess} showError={showError} />
      </TabPanel>

      {snackbar && (
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={closeSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} onClose={closeSnackbar} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}
