import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Snackbar,
  MenuItem,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserData } from '../features/auth/slice';
import { PageContainer, LoadingSpinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { calcularEdad } from '../utils';

export const EditarPerfil = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { estudianteActual } = useAuth();

  const usuario = user || estudianteActual?.usuario || {};

  const [form, setForm] = useState({
    nombre: usuario.nombre || '',
    apellido: usuario.apellido || '',
    email: usuario.email || '',
    fechaNacimiento: usuario.fechaNacimiento || '',
    genero: usuario.genero || 'sin especificar',
  });

  const generos = ['femenino', 'masculino', 'no binario', 'sin especificar'];
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    setForm({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      email: usuario.email || '',
      fechaNacimiento: usuario.fechaNacimiento || '',
      genero: usuario.genero || 'sin especificar',
    });
  }, [user, estudianteActual]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usuario.id) return;

    const data = {};
    if (form.nombre !== usuario.nombre) data.nombre = form.nombre;
    if (form.apellido !== usuario.apellido) data.apellido = form.apellido;
    if (form.email !== usuario.email) data.email = form.email;
    if (form.fechaNacimiento !== (usuario.fechaNacimiento || '')) data.fechaNacimiento = form.fechaNacimiento || null;
    if (form.genero !== (usuario.genero || 'sin especificar')) data.genero = form.genero;

    if (Object.keys(data).length === 0) {
      setSnackbar({ open: true, message: 'No hay cambios para guardar', severity: 'info' });
      return;
    }

    setLoading(true);
    try {
      await dispatch(updateUserData({ data })).unwrap();
      setSnackbar({ open: true, message: 'Datos actualizados correctamente', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err?.message || 'Error al actualizar', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer maxWidth={600}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Editar Datos Personales
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Apellido"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Fecha de Nacimiento"
              name="fechaNacimiento"
              type="date"
              value={form.fechaNacimiento}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            {form.fechaNacimiento && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Edad: {calcularEdad(form.fechaNacimiento)} años
              </Typography>
            )}
            <TextField
              fullWidth
              select
              label="Género"
              name="genero"
              value={form.genero}
              onChange={handleChange}
              margin="normal"
            >
              {generos.map((g) => (
                <MenuItem key={g} value={g}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </MenuItem>
              ))}
            </TextField>
            <Box mt={2} display="flex" gap={2}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={loading}
                size="large"
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/mi-perfil')}
                size="large"
              >
                Cancelar
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};
