import React, { useState, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import { PageContainer, LoadingSpinner } from '../components/ui';
import {
  Public,
  Lock,
  Notifications,
  Visibility,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { fetchPreferencias, updatePreferencias } from '../features/auth/slice';
import { useSnackbar } from '../hooks';

export const PrivacidadPerfil = () => {
  const dispatch = useDispatch();
  const { estudianteActual } = useAuth();
  const { preferencias, loadingPreferencias } = useSelector(state => state.auth);

  const [perfilPublico, setPerfilPublico] = useState(true);
  const [mostrarEmail, setMostrarEmail] = useState(true);
  const [mostrarSituacionAcademica, setMostrarSituacionAcademica] = useState(true);
  const [visibleEnDescubrir, setVisibleEnDescubrir] = useState(true);
  const [pubInscripciones, setPubInscripciones] = useState(true);
  const [pubRegularizaciones, setPubRegularizaciones] = useState(true);
  const [pubAprobaciones, setPubAprobaciones] = useState(true);
  const [pubSesiones, setPubSesiones] = useState(true);
  const [recibirEmails, setRecibirEmails] = useState(true);

  const { showSuccess, showError, snackbar, closeSnackbar } = useSnackbar();

  const usuarioId = estudianteActual?.usuario?.id;

  useEffect(() => {
    if (usuarioId) {
      dispatch(fetchPreferencias(usuarioId));
    }
  }, [usuarioId, dispatch]);

  useEffect(() => {
    if (preferencias) {
      setPerfilPublico(preferencias.perfilPublico ?? true);
      setMostrarEmail(preferencias.mostrarEmail ?? true);
      setMostrarSituacionAcademica(preferencias.mostrarSituacionAcademica ?? true);
      setVisibleEnDescubrir(preferencias.visibleEnDescubrir ?? true);
      setPubInscripciones(preferencias.publicarInscripciones ?? true);
      setPubRegularizaciones(preferencias.publicarRegularizaciones ?? true);
      setPubAprobaciones(preferencias.publicarAprobaciones ?? true);
      setPubSesiones(preferencias.publicarSesiones ?? true);
      setRecibirEmails(preferencias.recibirEmails ?? true);
    }
  }, [preferencias]);

  const handleChange = (field, setter) => (e) => {
    const newValue = e.target.checked;
    setter(newValue);
    if (usuarioId) {
      dispatch(updatePreferencias({
        estudianteId: usuarioId,
        preferencias: { [field]: newValue }
      }))
        .unwrap()
        .then(() => showSuccess('Preferencia guardada'))
        .catch((err) => {
          setter(!newValue);
          showError('Error al guardar: ' + (err.message || 'Error desconocido'));
        });
    }
  };

  return (
    <PageContainer maxWidth={600}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Privacidad
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            {perfilPublico ? <Public color="success" fontSize="small" /> : <Lock fontSize="small" />}
            <Typography variant="subtitle1" fontWeight="bold">
              Visibilidad del Perfil
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={perfilPublico}
                onChange={handleChange('perfilPublico', setPerfilPublico)}
                disabled={loadingPreferencias}
              />
            }
            label="Perfil Público"
          />

          <Typography variant="caption" color="textSecondary" display="block" mb={2}>
            {perfilPublico
              ? 'Tu perfil es visible para todos los estudiantes'
              : 'Tu perfil es visible solo para tus contactos'}
          </Typography>

          <Box sx={{ ml: 3, mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={mostrarEmail}
                  onChange={handleChange('mostrarEmail', setMostrarEmail)}
                  disabled={loadingPreferencias}
                  size="small"
                />
              }
              label="Mostrar email en el perfil público"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={mostrarSituacionAcademica}
                  onChange={handleChange('mostrarSituacionAcademica', setMostrarSituacionAcademica)}
                  disabled={loadingPreferencias}
                  size="small"
                />
              }
              label="Mostrar situación académica en el perfil público"
            />
            <Typography variant="caption" color="textSecondary" display="block" sx={{ ml: 3 }}>
              Estos ajustes solo aplican cuando el perfil es público
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <FormControlLabel
            control={
              <Switch
                checked={visibleEnDescubrir}
                onChange={handleChange('visibleEnDescubrir', setVisibleEnDescubrir)}
                disabled={loadingPreferencias}
              />
            }
            label="Aparecer en búsqueda de contactos"
          />

          <Typography variant="caption" color="textSecondary" display="block">
            Los demás estudiantes podrán encontrarte por nombre en la sección Descubrir de Conexiones
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>
            Publicación automática en el Feed
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={pubInscripciones}
                onChange={handleChange('publicarInscripciones', setPubInscripciones)}
                disabled={loadingPreferencias}
              />
            }
            label="Publicar inscripciones"
          />
          <FormControlLabel
            control={
              <Switch
                checked={pubRegularizaciones}
                onChange={handleChange('publicarRegularizaciones', setPubRegularizaciones)}
                disabled={loadingPreferencias}
              />
            }
            label="Publicar regularizaciones"
          />
          <FormControlLabel
            control={
              <Switch
                checked={pubAprobaciones}
                onChange={handleChange('publicarAprobaciones', setPubAprobaciones)}
                disabled={loadingPreferencias}
              />
            }
            label="Publicar aprobaciones"
          />
          <FormControlLabel
            control={
              <Switch
                checked={pubSesiones}
                onChange={handleChange('publicarSesiones', setPubSesiones)}
                disabled={loadingPreferencias}
              />
            }
            label="Publicar sesiones de estudio"
          />

          <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
            Controlá qué eventos se publican automáticamente en tu feed de novedades
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Email fontSize="small" />
            <Typography variant="subtitle1" fontWeight="bold">
              Notificaciones
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={recibirEmails}
                onChange={handleChange('recibirEmails', setRecibirEmails)}
                disabled={loadingPreferencias}
              />
            }
            label="Recibir notificaciones por email"
          />

          <Typography variant="caption" color="textSecondary" display="block">
            Recibirás un email por cada notificación generada en la plataforma
          </Typography>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};
