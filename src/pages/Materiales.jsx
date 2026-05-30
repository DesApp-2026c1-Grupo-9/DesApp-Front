import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Typography,
  Box,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
} from '@mui/material';
import { Search, Add } from '@mui/icons-material';
import {
  fetchMateriales,
  fetchMaterias,
  addMaterial,
  editMaterial,
  removeMaterial,
  rateMaterialThunk,
  setFilter,
} from '../features/materiales/slice';
import { SORT_OPTIONS } from '../utils';
import { useFilter } from '../hooks';

import MaterialCard from '../components/MaterialCard';
import MaterialUploadDialog from '../components/MaterialUploadDialog';
import DenunciaDialog from '../components/DenunciaDialog';
import { PageContainer, LoadingSpinner, EmptyState } from '../components/ui';

const Materiales = () => {
  const dispatch = useDispatch();
  const { list: materiales = [], materias = [], loading, error, filter, operationLoading } =
    useSelector((state) => state.materiales);
  const { user } = useSelector((state) => state.auth);

  const currentUserId = user?.id || 1;
  const currentUserName = user?.nombre || user?.name || 'Usuario';

  const { filters, setFilter: setFilterValue, clearFilters, hasActiveFilters } = useFilter({
    initialFilters: {
      search: '',
      materiaId: '',
    },
    debounceMs: 300,
  });

  const [sortBy, setSortBy] = useState(SORT_OPTIONS.FECHA_DESC);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [denunciaMaterial, setDenunciaMaterial] = useState(null);
  const [denunciaDialogOpen, setDenunciaDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMaterias());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchMateriales({ ...filter, search: filters.search || '', sortBy, usuarioId: currentUserId })
    );
  }, [filters.search, sortBy, filter, dispatch, currentUserId]);

  useEffect(() => {
    dispatch(fetchMateriales({ ...filter, materiaId: filters.materiaId || null, sortBy, usuarioId: currentUserId }));
  }, [filters.materiaId, dispatch]);

  const handleFilterChange = (newFilter) => {
    dispatch(setFilter(newFilter));
  };

  const handleMateriaChange = (e) => {
    const value = e.target.value;
    setFilterValue('materiaId', value);
    handleFilterChange({ materiaId: value || null });
  };

  const handleRate = (id, value) => {
    if (currentUserId) {
      dispatch(rateMaterialThunk({ id, value, usuarioId: currentUserId }));
    }
  };

  const handleDialogSave = (data) => {
    if (editingMaterial) {
      dispatch(
        editMaterial({
          id: data.id,
          data: { titulo: data.titulo, descripcion: data.descripcion, tags: data.tags },
          usuarioId: currentUserId,
        })
      );
    } else {
      dispatch(
        addMaterial({
          ...data,
          creadorId: currentUserId,
          creador: { id: currentUserId, nombre: currentUserName },
        })
      );
    }
    setDialogOpen(false);
    setEditingMaterial(null);
  };

  const handleDeleteMaterial = (id) => {
    dispatch(removeMaterial({ id, usuarioId: currentUserId }));
  };

  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setDialogOpen(true);
  };

  const handleDenunciar = (material) => {
    setDenunciaMaterial(material);
    setDenunciaDialogOpen(true);
  };

  const handleDenunciaClose = (created) => {
    setDenunciaDialogOpen(false);
    setDenunciaMaterial(null);
    if (created) {
      dispatch(fetchMateriales({ ...filter, search: filters.search || '', sortBy, usuarioId: currentUserId }));
    }
  };

  const handleClearFilters = () => {
    clearFilters();
    setSortBy(SORT_OPTIONS.FECHA_DESC);
    handleFilterChange({ materiaId: null });
  };

  return (
    <PageContainer maxWidth={1200}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4">Materiales de Estudio</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditingMaterial(null);
            setDialogOpen(true);
          }}
        >
          Agregar Material
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar por título, tags o materia..."
          value={filters.search}
          onChange={(e) => setFilterValue('search', e.target.value)}
          sx={{ flex: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Materia</InputLabel>
          <Select
            value={filters.materiaId}
            label="Materia"
            onChange={handleMateriaChange}
          >
            <MenuItem value="">Todas</MenuItem>
            {(materias || []).map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.nombre} ({m.codigo})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Ordenar</InputLabel>
          <Select value={sortBy} label="Ordenar" onChange={(e) => setSortBy(e.target.value)}>
            <MenuItem value={SORT_OPTIONS.FECHA_DESC}>Más recientes</MenuItem>
            <MenuItem value={SORT_OPTIONS.FECHA_ASC}>Más antiguos</MenuItem>
            <MenuItem value={SORT_OPTIONS.RATING_DESC}>Mejor valorados</MenuItem>
            <MenuItem value={SORT_OPTIONS.RATING_ASC}>Peor valorados</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <LoadingSpinner message="Cargando materiales..." />
      ) : error ? (
        <EmptyState
          title="Error al cargar materiales"
          message={error}
          icon="error"
          actionLabel="Reintentar"
          onAction={() => dispatch(fetchMateriales({ ...filter, search, sortBy, usuarioId: currentUserId }))}
        />
      ) : !materiales || materiales.length === 0 ? (
        <EmptyState
          title="No se encontraron materiales"
          message="No hay materiales disponibles con los filtros seleccionados."
          icon="search"
          actionLabel="Limpiar filtros"
          onAction={handleClearFilters}
        />
      ) : (
        materiales.map((material) => (
          <MaterialCard
            key={material.id}
            material={material}
            currentUserId={currentUserId}
            onRate={handleRate}
            onEdit={handleEditMaterial}
            onDelete={handleDeleteMaterial}
            onDenunciar={handleDenunciar}
          />
        ))
      )}

      <MaterialUploadDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingMaterial(null);
        }}
        onSave={handleDialogSave}
        materias={materias || []}
        defaultMateriaId={filters.materiaId || null}
        material={editingMaterial}
      />

      {denunciaMaterial && (
        <DenunciaDialog
          open={denunciaDialogOpen}
          onClose={handleDenunciaClose}
          material={denunciaMaterial}
          usuarioId={currentUserId}
        />
      )}
    </PageContainer>
  );
};

export default Materiales;