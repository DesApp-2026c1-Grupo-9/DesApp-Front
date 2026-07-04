import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
} from '@mui/material';
import {
  AdminPanelSettings,
  People,
  Description,
  Flag,
  Block,
  WarningAmber,
  PersonAdd,
  Timeline,
  FiberManualRecord,
  MenuBook,
} from '@mui/icons-material';
import { PageContainer, LoadingSpinner, EmptyState } from '../components/ui';
import useFetchData from '../hooks/useFetchData';
import api from '../api/axiosConfig';

const STAT_CARDS = [
  { key: 'totalUsuarios', label: 'Usuarios', icon: People, color: 'primary', bg: 'primary.light' },
  { key: 'totalMateriales', label: 'Materiales', icon: Description, color: 'success', bg: 'success.light' },
  { key: 'totalSesiones', label: 'Sesiones', icon: MenuBook, color: 'info', bg: 'info.light' },
  { key: 'denunciasPendientes', label: 'Denuncias Pendientes', icon: Flag, color: 'warning', bg: 'warning.light' },
  { key: 'materialesSuspendidos', label: 'Materiales Suspendidos', icon: Block, color: 'error', bg: 'error.light' },
];

export default function AdminDashboardPage() {
  const user = useSelector((state) => state.auth.user);
  const loadingStudents = useSelector((state) => state.auth.loadingStudents);
  const navigate = useNavigate();

  const { data, loading, error, refetch } = useFetchData({
    fetchFn: () => api.get('/api/admin/dashboard').then(res => res.data?.data),
    deps: [],
  });

  if (loadingStudents) {
    return (
      <PageContainer centered padding={3}>
        <LoadingSpinner message="Cargando información del usuario..." />
      </PageContainer>
    );
  }

  if (!user || user.rol !== 'administrador') {
    return (
      <PageContainer maxWidth={600} centered>
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <AdminPanelSettings sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" gutterBottom>Acceso Denegado</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Solo los usuarios administradores pueden acceder al panel de administración.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Volver al inicio
          </Button>
        </Box>
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer centered padding={3}>
        <LoadingSpinner message="Cargando dashboard..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer maxWidth={600}>
        <EmptyState
          icon="error"
          title="Error al cargar el dashboard"
          message={error}
          actionLabel="Reintentar"
          onAction={refetch}
        />
      </PageContainer>
    );
  }

  const stats = data?.stats;

  return (
    <PageContainer maxWidth={1400} padding={0}>
      <Box sx={{ pb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Avatar sx={{ bgcolor: 'warning.main', width: { xs: 32, sm: 36 }, height: { xs: 32, sm: 36 } }}>
            <AdminPanelSettings sx={{ fontSize: { xs: 18, sm: 20 }, color: '#fff' }} />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>Dashboard</Typography>
        </Box>

        <Grid container spacing={3}>
            {STAT_CARDS.map(({ key, label, icon: Icon, color, bg }) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Card variant="outlined" elevation={0} sx={{ borderTop: 4, borderTopColor: `${color}.main`, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48 }}>
                      <Icon sx={{ fontSize: 24, color: '#fff' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats?.[key] ?? 0}</Typography>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Card variant="outlined" elevation={0} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}>
                <PersonAdd color="primary" />
                <Typography variant="body2" color="text.secondary">
                  <strong>{stats?.usuariosHoy ?? 0}</strong> registro(s) hoy, <strong>{stats?.usuariosSemana ?? 0}</strong> esta semana
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} lg={6} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Flag fontSize="small" color="warning" /> Últimas Denuncias Pendientes
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ flex: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                      <TableCell>#</TableCell>
                      <TableCell>Material</TableCell>
                      <TableCell>Denunciante</TableCell>
                      <TableCell>Motivo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.ultimasDenuncias?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>Sin denuncias pendientes</TableCell>
                      </TableRow>
                    ) : (
                      data?.ultimasDenuncias?.map((d) => (
                        <TableRow key={d.id} sx={{ '&:last-child td': { border: 0 } }}>
                          <TableCell sx={{ color: 'text.secondary' }}>#{d.id}</TableCell>
                          <TableCell>{d.material?.titulo}</TableCell>
                          <TableCell>{d.denunciante?.nombre} {d.denunciante?.apellido}</TableCell>
                          <TableCell><Chip label={d.motivo?.nombre} size="small" variant="outlined" /></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} lg={6} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Block fontSize="small" color="error" /> Materiales Suspendidos
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ flex: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                      <TableCell>#</TableCell>
                      <TableCell>Material</TableCell>
                      <TableCell>Materia</TableCell>
                      <TableCell>Creador</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.materialesSuspendidos?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>Sin materiales suspendidos</TableCell>
                      </TableRow>
                    ) : (
                      data?.materialesSuspendidos?.map((m) => (
                        <TableRow key={m.id} sx={{ '&:last-child td': { border: 0 } }}>
                          <TableCell sx={{ color: 'text.secondary' }}>#{m.id}</TableCell>
                          <TableCell>{m.titulo}</TableCell>
                          <TableCell>{m.materia?.nombre || '-'}</TableCell>
                          <TableCell>{m.creador?.nombre} {m.creador?.apellido}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timeline fontSize="small" color="info" /> Actividad Reciente
              </Typography>
              <Card variant="outlined" elevation={0} sx={{ boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}>
                {data?.actividadReciente?.length === 0 ? (
                  <CardContent><Typography color="text.secondary">Sin actividad reciente</Typography></CardContent>
                ) : (
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ position: 'absolute', left: 28, top: 12, bottom: 12, width: 2, bgcolor: 'grey.200' }} />
                    <List dense disablePadding>
                      {data?.actividadReciente?.map((a, i) => {
                        const isMaterial = a.tipo === 'material_creado';
                        return (
                          <ListItem key={i} sx={{ borderBottom: i < data.actividadReciente.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                            <ListItemIcon sx={{ minWidth: 56, position: 'relative', zIndex: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: isMaterial ? 'success.light' : 'warning.light' }}>
                                {isMaterial ? <Description sx={{ fontSize: 18, color: 'success.main' }} /> : <WarningAmber sx={{ fontSize: 18, color: 'warning.main' }} />}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={a.descripcion}
                              secondary={
                                <Box component="span" sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mt: 0.25 }}>
                                  <FiberManualRecord sx={{ fontSize: 6, color: 'text.disabled' }} />
                                  {a.usuario}
                                  <FiberManualRecord sx={{ fontSize: 6, color: 'text.disabled' }} />
                                  {new Date(a.fecha).toLocaleString()}
                                </Box>
                              }
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>
                )}
              </Card>
            </Grid>
          </Grid>
      </Box>
    </PageContainer>
  );
}
