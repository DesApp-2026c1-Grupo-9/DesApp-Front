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
  Checkbox,
  Chip,
} from '@mui/material';
import { School, Edit, Delete, MenuBook, Visibility } from '@mui/icons-material';
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
  const [materiaDialog, setMateriaDialog] = useState({ open: false, carrera: null });
  const [allMaterias, setAllMaterias] = useState([]);
  const [carreraMaterias, setCarreraMaterias] = useState([]);
  const [selectedMaterias, setSelectedMaterias] = useState([]);
  const [materiaSearchTerm, setMateriaSearchTerm] = useState('');
  const [materiaPage, setMateriaPage] = useState(0);
  const materiasRowsPerPage = 10;
  const [detalleDialog, setDetalleDialog] = useState({ open: false, carrera: null, materias: [], planes: [] });
  const [confirmMateriaDialog, setConfirmMateriaDialog] = useState({ open: false, agregar: [], quitar: [] });

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

  const cargarCarreras = useCallback(async (targetPage) => {
    try {
      const params = {
        page: targetPage !== undefined ? targetPage + 1 : page + 1,
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

  const cargarAllMaterias = useCallback(async () => {
    try {
      const res = await api.get('/api/materias', { params: { limit: 1000 } });
      setAllMaterias(res.data.data || []);
    } catch { }
  }, []);

  useEffect(() => {
    cargarAllMaterias();
  }, [cargarAllMaterias]);

  useEffect(() => {
    if (!materiaDialog.open || !materiaDialog.carrera) return;
    setSelectedMaterias([]);
    const fetchData = async () => {
      try {
        const [materiasRes, asignadasRes] = await Promise.all([
          api.get('/api/materias', { params: { limit: 1000 } }),
          api.get(`/api/carreras/${materiaDialog.carrera.id}/materias`),
        ]);
        setAllMaterias(materiasRes.data.data || []);
        setCarreraMaterias(asignadasRes.data.data || []);
        setSelectedMaterias(asignadasRes.data.data || []);
      } catch {
        setAllMaterias([]);
        setCarreraMaterias([]);
      }
    };
    fetchData();
  }, [materiaDialog]);

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
        const newId = res.data.data.id;
        const sortParams = {
          limit: 100,
          sort: sortField,
          dir: sortDir,
          ...(filtroInstituto !== 'todos' && { instituto: filtroInstituto }),
          ...(filtroDuracion !== 'todos' && { duracion: filtroDuracion }),
        };
        const sortedRes = await api.get('/api/carreras', { params: sortParams });
        const sortedData = sortedRes.data.data || [];
        const idx = sortedData.findIndex(c => c.id === newId);
        const targetPage = idx >= 0 ? Math.floor(idx / rowsPerPage) : 0;
        setHighlightId(newId);
        setPage(targetPage);
        showSuccess('Carrera creada');
        cargarCarreras(targetPage);
      }
      setOpen(false);
    } catch (err) {
      showError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const openMateriaDialog = (carrera) => {
    setMateriaDialog({ open: true, carrera });
  };

  const openDetalleDialog = async (carrera) => {
    try {
      const [materiasRes, planesRes] = await Promise.all([
        api.get(`/api/carreras/${carrera.id}/materias`),
        api.get(`/api/carreras/${carrera.id}/planes`),
      ]);
      setDetalleDialog({
        open: true,
        carrera,
        materias: materiasRes.data.data || [],
        planes: planesRes.data.data || [],
      });
    } catch {
      showError('Error al cargar detalle');
    }
  };

  const handleGuardarMaterias = async () => {
    if (!materiaDialog.carrera) return;
    const materiaIds = selectedMaterias.map((m) => m.id);
    const currentIds = new Set(carreraMaterias.map((m) => m.id));
    const newIds = new Set(materiaIds);
    const agregar = selectedMaterias.filter((m) => !currentIds.has(m.id));
    const quitar = carreraMaterias.filter((m) => !newIds.has(m.id));
    if (agregar.length === 0 && quitar.length === 0) {
      setMateriaDialog({ ...materiaDialog, open: false });
      return;
    }
    setConfirmMateriaDialog({ open: true, agregar, quitar });
  };

  const handleConfirmGuardarMaterias = async () => {
    if (!materiaDialog.carrera) return;
    try {
      const materiaIds = selectedMaterias.map((m) => m.id);
      await api.post(`/api/carreras/${materiaDialog.carrera.id}/materias`, { materiaIds });
      showSuccess('Materias actualizadas');
      setMateriaDialog({ ...materiaDialog, open: false });
      setConfirmMateriaDialog({ open: false, agregar: [], quitar: [] });
      cargarCarreras();
    } catch (err) {
      showError(err.response?.data?.message || 'Error al guardar materias');
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

  useEffect(() => {
    setMateriaPage(0);
  }, [materiaSearchTerm]);

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
              <TableCell align="center">Materias</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {carreras.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>No hay carreras registradas</TableCell>
              </TableRow>
            ) : (
              carreras.map((c) => (
                <TableRow key={c.id} sx={{ transition: 'background-color 0.5s', backgroundColor: c.id === highlightId ? 'action.selected' : 'inherit' }}>
                  <TableCell sx={{ fontWeight: 'medium' }}>{c.nombre}</TableCell>
                  <TableCell>{c.titulo}</TableCell>
                  <TableCell>{c.instituto}</TableCell>
                  <TableCell>{c.duracion} años</TableCell>
                  <TableCell>{c.totalPlanes}</TableCell>
                  <TableCell align="center">{c.totalMaterias}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openDetalleDialog(c)} title="Ver detalle"><Visibility fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => openEdit(c)} title="Editar"><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => openMateriaDialog(c)} title="Asignar materias"><MenuBook fontSize="small" /></IconButton>
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

      <Dialog open={detalleDialog.open} onClose={() => setDetalleDialog({ ...detalleDialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>{detalleDialog.carrera?.nombre}</DialogTitle>
        <DialogContent>
          {detalleDialog.carrera && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary"><strong>Título:</strong> {detalleDialog.carrera.titulo}</Typography>
              <Typography variant="body2" color="text.secondary"><strong>Instituto:</strong> {detalleDialog.carrera.instituto}</Typography>
              <Typography variant="body2" color="text.secondary"><strong>Duración:</strong> {detalleDialog.carrera.duracion} años</Typography>
            </Box>
          )}
          <Typography variant="subtitle2" gutterBottom>Materias asignadas ({detalleDialog.materias.length})</Typography>
          <Paper variant="outlined" sx={{ maxHeight: 180, overflow: 'auto', mb: 2 }}>
            {detalleDialog.materias.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>Sin materias asignadas</Typography>
            ) : (
              [...detalleDialog.materias].sort((a, b) => a.nombre.localeCompare(b.nombre)).map((m) => (
                <Box key={m.id} sx={{ px: 2, py: 0.5, borderBottom: 1, borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                  <Typography variant="body2">{m.nombre}</Typography>
                </Box>
              ))
            )}
          </Paper>
          <Typography variant="subtitle2" gutterBottom>Planes de estudio ({detalleDialog.planes.length})</Typography>
          <Paper variant="outlined" sx={{ maxHeight: 180, overflow: 'auto' }}>
            {detalleDialog.planes.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>Sin planes de estudio</Typography>
            ) : (
              detalleDialog.planes.map((p) => (
                <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 0.5, borderBottom: 1, borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                  <Typography variant="body2">{p.nombre}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={p.estado} size="small" color={p.estado === 'vigente' ? 'success' : p.estado === 'transición' ? 'warning' : 'default'} />
                    <Chip label={`${p.totalMaterias} materias`} size="small" variant="outlined" />
                  </Box>
                </Box>
              ))
            )}
          </Paper>
        </DialogContent>
        <DialogActions><Button onClick={() => setDetalleDialog({ ...detalleDialog, open: false })}>Cerrar</Button></DialogActions>
      </Dialog>

      <Dialog open={confirmMateriaDialog.open} onClose={() => setConfirmMateriaDialog({ ...confirmMateriaDialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmar cambios</DialogTitle>
        <DialogContent>
          {confirmMateriaDialog.agregar.length > 0 && (
            <>
              <Typography variant="subtitle2" color="success.main" gutterBottom>Agregar ({confirmMateriaDialog.agregar.length})</Typography>
              <Paper variant="outlined" sx={{ mb: 2, maxHeight: 150, overflow: 'auto' }}>
                {confirmMateriaDialog.agregar.map((m) => (
                  <Box key={m.id} sx={{ px: 2, py: 0.5, borderBottom: 1, borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                    <Typography variant="body2">{m.nombre}</Typography>
                  </Box>
                ))}
              </Paper>
            </>
          )}
          {confirmMateriaDialog.quitar.length > 0 && (
            <>
              <Typography variant="subtitle2" color="error.main" gutterBottom>Quitar ({confirmMateriaDialog.quitar.length})</Typography>
              <Paper variant="outlined" sx={{ mb: 2, maxHeight: 150, overflow: 'auto' }}>
                {confirmMateriaDialog.quitar.map((m) => (
                  <Box key={m.id} sx={{ px: 2, py: 0.5, borderBottom: 1, borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                    <Typography variant="body2">{m.nombre}</Typography>
                  </Box>
                ))}
              </Paper>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmMateriaDialog({ ...confirmMateriaDialog, open: false })}>Cancelar</Button>
          <Button variant="contained" onClick={handleConfirmGuardarMaterias}>Confirmar</Button>
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

      <Dialog open={materiaDialog.open} onClose={() => setMateriaDialog({ ...materiaDialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Materias de {materiaDialog.carrera?.nombre}</DialogTitle>
        <DialogContent>
          {(() => {
            const sorted = [...allMaterias].sort((a, b) => a.nombre.localeCompare(b.nombre));
            const q = materiaSearchTerm.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            const filtered = q
              ? sorted.filter((m) => m.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(q))
              : sorted;
            const selectedIds = new Set(selectedMaterias.map((m) => m.id));
            const totalFiltered = filtered.length;
            const pageCount = Math.max(1, Math.ceil(totalFiltered / materiasRowsPerPage));
            const safePage = Math.min(materiaPage, pageCount - 1);
            const pageMaterias = filtered.slice(safePage * materiasRowsPerPage, (safePage + 1) * materiasRowsPerPage);
            const allSelected = totalFiltered > 0 && filtered.every((m) => selectedIds.has(m.id));
            return (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Filtrar materias..."
                    value={materiaSearchTerm}
                    onChange={(e) => setMateriaSearchTerm(e.target.value)}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    {selectedMaterias.length}/{totalFiltered}
                  </Typography>
                </Box>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={allSelected}
                            indeterminate={!allSelected && filtered.some((m) => selectedIds.has(m.id))}
                            onClick={() => setSelectedMaterias(allSelected ? [] : [...filtered])}
                          />
                        </TableCell>
                        <TableCell>Materia</TableCell>
                        <TableCell width={100}>Tipo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pageMaterias.length === 0 ? (
                        <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4 }}>No hay materias</TableCell></TableRow>
                      ) : (
                        pageMaterias.map((m) => (
                          <TableRow
                            key={m.id}
                            hover
                            selected={selectedIds.has(m.id)}
                            onClick={() => setSelectedMaterias((prev) =>
                              prev.some((p) => p.id === m.id) ? prev.filter((p) => p.id !== m.id) : [...prev, m]
                            )}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox checked={selectedIds.has(m.id)} />
                            </TableCell>
                            <TableCell>{m.nombre}</TableCell>
                            <TableCell><Chip label={m.tipo === 'anual' ? 'Anual' : 'Cuatrimestral'} size="small" color={m.tipo === 'anual' ? 'info' : 'secondary'} /></TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {totalFiltered > materiasRowsPerPage && (
                  <TablePagination
                    component="div"
                    count={totalFiltered}
                    page={safePage}
                    onPageChange={(_, p) => setMateriaPage(p)}
                    rowsPerPage={materiasRowsPerPage}
                    rowsPerPageOptions={[materiasRowsPerPage]}
                  />
                )}
              </>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMateriaDialog({ ...materiaDialog, open: false })}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardarMaterias}>Guardar</Button>
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
