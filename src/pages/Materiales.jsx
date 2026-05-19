import { useState, useEffect } from 'react';
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

import MaterialCard from '../components/MaterialCard';
import MaterialUploadDialog from '../components/MaterialUploadDialog';
import { PageContainer, LoadingSpinner, EmptyState } from '../components/ui';

const Materiales = () => {
  const dispatch = useDispatch();
  const { list: materiales = [], materias = [], loading, error, filter, operationLoading } =
    useSelector((state) => state.materiales);
  const { user } = useSelector((state) => state.auth);

  const currentUserId = user?.id || 1;
  const currentUserName = user?.nombre || user?.name || 'Usuario';

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.FECHA_DESC);
  const [materiaFilter, setMateriaFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  useEffect(() => {
    dispatch(fetchMateriales({ ...filter, search, sortBy, usuarioId: currentUserId }));
    dispatch(fetchMaterias());
  }, []);

  useEffect(() => {
    dispatch(
      fetchMateriales({ ...filter, search: search || '', sortBy, usuarioId: currentUserId })
    );
  }, [search, sortBy, filter]);

  const handleFilterChange = (newFilter) => {
    dispatch(setFilter(newFilter));
  };

  const handleMateriaChange = (e) => {
    const value = e.target.value;
    setMateriaFilter(value);
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

  const handleClearFilters = () => {
    setSearch('');
    setSortBy(SORT_OPTIONS.FECHA_DESC);
    setMateriaFilter('');
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
            value={materiaFilter}
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
        defaultMateriaId={materiaFilter || null}
        material={editingMaterial}
      />
    </PageContainer>
  );
};

export default Materiales;