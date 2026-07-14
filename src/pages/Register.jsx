import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Button,
  Link,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, MenuBook } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../features/auth/slice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (form.password !== form.confirmPassword) {
      setFormError('Las contraseñas no coinciden');
      return;
    }

    if (form.password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const result = await dispatch(registerUser({
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email,
      password: form.password,
    }));

    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/');
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <Card sx={{ maxWidth: 420, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" justifyContent="center" gap={1.5} mb={2}>
            <MenuBook color="primary" sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.2}>
                Sistema Académico
              </Typography>
              <Typography variant="caption" color="text.secondary">
                UNAHUR
              </Typography>
            </Box>
          </Box>

          <Typography variant="h5" gutterBottom align="left">
            Crear Cuenta
          </Typography>

          {(formError || error) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError || (typeof error === 'string' ? error : error?.message || 'Error al registrarse')}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              margin="normal"
              required
              autoFocus
              onInvalid={(e) => e.target.setCustomValidity('Ingresá tu nombre')}
              onInput={(e) => e.target.setCustomValidity('')}
            />
            <TextField
              fullWidth
              label="Apellido"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              margin="normal"
              required
              onInvalid={(e) => e.target.setCustomValidity('Ingresá tu apellido')}
              onInput={(e) => e.target.setCustomValidity('')}
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
              onInvalid={(e) => e.target.setCustomValidity('Ingresá tu email')}
              onInput={(e) => e.target.setCustomValidity('')}
            />
            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              margin="normal"
              required
              onInvalid={(e) => e.target.setCustomValidity('Ingresá tu contraseña')}
              onInput={(e) => e.target.setCustomValidity('')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" tabIndex={-1}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirmar Contraseña"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              onInvalid={(e) => e.target.setCustomValidity('Confirmá tu contraseña')}
              onInput={(e) => e.target.setCustomValidity('')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" tabIndex={-1}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </Box>

          <Box textAlign="center" mt={2}>
            <Link component={RouterLink} to="/login" variant="body2">
              ¿Ya tenés cuenta? Iniciá sesión
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
