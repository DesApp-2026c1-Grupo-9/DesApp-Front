import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { PageContainer } from '../components/ui';
import { updateUserData } from '../features/auth/slice';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../hooks';
import { calcularEdad } from '../utils';

function ProfileSection() {
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
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError, snackbar, closeSnackbar } = useSnackbar();

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
      showSuccess('No hay cambios para guardar');
      return;
    }

    setSaving(true);
    try {
      await dispatch(updateUserData({ data })).unwrap();
      showSuccess('Datos actualizados correctamente');
    } catch (err) {
      showError(err?.message || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={2}>Datos personales</Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 250 }}>
                <TextField fullWidth label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 250 }}>
                <TextField fullWidth label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} required />
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 250 }}>
                <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 250 }}>
                <TextField fullWidth select label="Género" name="genero" value={form.genero} onChange={handleChange}>
                  {generos.map((g) => (
                    <MenuItem key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 250 }}>
                <TextField fullWidth label="Fecha de Nacimiento" name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                {form.fechaNacimiento && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Edad: {calcularEdad(form.fechaNacimiento)} años
                  </Typography>
                )}
              </Box>
            </Box>
            <Box mt={2}>
              <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving} size="large">
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={closeSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default function ConfiguracionPage() {
  return (
    <PageContainer maxWidth={1200}>
      <Box>
        <ProfileSection />
      </Box>
    </PageContainer>
  );
}
