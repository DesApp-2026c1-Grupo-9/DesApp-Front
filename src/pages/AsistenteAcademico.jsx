import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Alert, Button,
  LinearProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Accordion, AccordionSummary,
  AccordionDetails, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, List, ListItem, ListItemText, ListItemIcon,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore, CheckCircle, Schedule, School, TrendingUp,
  AutoAwesome, UploadFile, ArrowBack, Lock, LockOpen,
  EmojiEvents,
} from '@mui/icons-material';
import EstudianteService from '../services/EstudianteService';
import { useAuth } from '../context/AuthContext';
import { PageContainer, LoadingSpinner, EmptyState } from '../components/ui';

const ESTADO_COLOR = {
  aprobada: 'success',
  regularizada: 'warning',
  cursando: 'info',
  no_cursada: 'default',
};

export default function AsistenteAcademico() {
  const navigate = useNavigate();
  const { estudianteActual } = useAuth();
  const [analisis, setAnalisis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Import Excel
  const [dialogImport, setDialogImport] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResultado, setImportResultado] = useState(null);
  const [importError, setImportError] = useState(null);

  const cargarAnalisis = useCallback(async () => {
    if (!estudianteActual?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await EstudianteService.obtenerAsistenteAcademico(estudianteActual.id);
      setAnalisis(response.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [estudianteActual?.id]);

  useEffect(() => {
    cargarAnalisis();
  }, [cargarAnalisis]);

  // --- Excel import ---
  const handleArchivoExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportLoading(true);
    setImportError(null);
    setImportResultado(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      // Esperar columnas: "nombre" y "estado" (case-insensitive)
      const materias = rows
        .map((row) => {
          const nombre = row['nombre'] || row['Nombre'] || row['NOMBRE'] || '';
          const estado = row['estado'] || row['Estado'] || row['ESTADO'] || '';
          return { nombre: String(nombre).trim(), estado: String(estado).trim().toLowerCase() };
        })
        .filter((r) => r.nombre);

      if (materias.length === 0) {
        setImportError('El archivo no tiene filas válidas. Asegurate de que tenga columnas "nombre" y "estado".');
        setImportLoading(false);
        return;
      }

      const result = await EstudianteService.importarMateriasDesdeExcel(
        estudianteActual.id,
        materias
      );
      setImportResultado(result);
      await cargarAnalisis();
    } catch (err) {
      setImportError(err.message);
    } finally {
      setImportLoading(false);
      e.target.value = '';
    }
  };

  if (loading) return <PageContainer centered padding={3}><LoadingSpinner message="Analizando situación académica..." /></PageContainer>;
  if (error) return <PageContainer padding={3}><EmptyState title="Error" message={error} icon="error" actionLabel="Reintentar" onAction={cargarAnalisis} /></PageContainer>;
  if (!analisis) return <PageContainer padding={3}><EmptyState title="Sin datos" message="No se encontró información académica" icon="inbox" /></PageContainer>;

  const { estudiante, resumen, puedeCursar, finalesPendientes, analisisPorAnio, proyeccion } = analisis;

  return (
    <PageContainer padding={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3} gap={2}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/mis-materias')}>
          Mis Materias
        </Button>
        <Box flexGrow={1}>
          <Typography variant="h4" display="flex" alignItems="center" gap={1}>
            <AutoAwesome color="primary" />
            Asistente Académico
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {estudiante?.nombre} {estudiante?.apellido} — {analisis?.carrera?.nombre}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<UploadFile />}
          onClick={() => setDialogImport(true)}
        >
          Importar desde Excel
        </Button>
      </Box>

      {/* Progreso general */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="h6" display="flex" alignItems="center" gap={1}>
              <TrendingUp color="primary" /> Avance en la carrera
            </Typography>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {resumen.porcentajeAvance}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={resumen.porcentajeAvance}
            sx={{ height: 12, borderRadius: 6, mb: 2 }}
          />
          <Grid container spacing={2}>
            {[
              { label: 'Aprobadas', value: resumen.aprobadas, color: 'success.main' },
              { label: 'Regularizadas', value: resumen.regularizadas, color: 'warning.main' },
              { label: 'Cursando', value: resumen.cursando, color: 'info.main' },
              { label: 'Faltantes', value: resumen.noCursadas, color: 'text.secondary' },
              { label: 'Total', value: resumen.total, color: 'text.primary' },
            ].map((stat) => (
              <Grid item xs={6} sm={4} md key={stat.label}>
                <Box textAlign="center">
                  <Typography variant="h5" color={stat.color} fontWeight="bold">{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Columna izquierda */}
        <Grid item xs={12} md={6}>
          {/* Puede cursar */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" display="flex" alignItems="center" gap={1} mb={2}>
                <LockOpen color="success" /> Podés inscribirte ({puedeCursar.length})
              </Typography>
              {puedeCursar.length === 0 ? (
                <Alert severity="info">Todas las materias disponibles ya están cursadas o aprobadas.</Alert>
              ) : (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {puedeCursar.map((m) => (
                    <Chip key={m.id} label={`${m.nombre} (${m.anio}°)`} color="success" variant="outlined" size="small" icon={<LockOpen />} />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Finales pendientes */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" display="flex" alignItems="center" gap={1} mb={2}>
                <Schedule color="warning" /> Finales pendientes ({finalesPendientes.length})
              </Typography>
              {finalesPendientes.length === 0 ? (
                <Alert severity="success">No tenés finales pendientes.</Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Materia</TableCell>
                        <TableCell>Año</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {finalesPendientes.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>{m.nombre}</TableCell>
                          <TableCell>{m.anio}°</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Columna derecha */}
        <Grid item xs={12} md={6}>
          {/* Proyección "¿Qué pasa si...?" */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" display="flex" alignItems="center" gap={1} mb={1}>
                <AutoAwesome color="secondary" /> Proyección
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {proyeccion.descripcion}
              </Typography>
              {proyeccion.seDesbloquearian.length === 0 ? (
                <Alert severity="info">
                  {resumen.cursando === 0
                    ? 'No estás cursando ninguna materia actualmente.'
                    : 'No se desbloquearían materias nuevas con lo que estás cursando.'}
                </Alert>
              ) : (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {proyeccion.seDesbloquearian.map((m) => (
                    <Chip key={m.id} label={`${m.nombre} (${m.anio}°)`} color="secondary" variant="outlined" size="small" icon={<Lock />} />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Análisis por año */}
          <Card>
            <CardContent>
              <Typography variant="h6" display="flex" alignItems="center" gap={1} mb={2}>
                <EmojiEvents color="primary" /> Análisis por año
              </Typography>
              {Object.entries(analisisPorAnio)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([anio, datos]) => (
                  <Accordion key={anio} disableGutters>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box display="flex" alignItems="center" gap={2} width="100%">
                        <Typography fontWeight="bold">{anio}° año</Typography>
                        {datos.completo ? (
                          <Chip label="Completo" color="success" size="small" icon={<CheckCircle />} />
                        ) : (
                          <Chip label={`${datos.faltantes} faltantes`} color="default" size="small" />
                        )}
                        <Box flexGrow={1} />
                        <LinearProgress
                          variant="determinate"
                          value={datos.total > 0 ? Math.round((datos.aprobadas / datos.total) * 100) : 0}
                          sx={{ width: 80, height: 6, borderRadius: 3 }}
                          color="success"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={1}>
                        {[
                          { label: 'Aprobadas', value: datos.aprobadas, color: 'success' },
                          { label: 'Regularizadas', value: datos.regularizadas, color: 'warning' },
                          { label: 'Cursando', value: datos.cursando, color: 'info' },
                          { label: 'Faltantes', value: datos.faltantes, color: 'default' },
                        ].map((s) => (
                          <Grid item xs={6} key={s.label}>
                            <Chip label={`${s.value} ${s.label}`} color={s.color} size="small" sx={{ width: '100%' }} />
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de importación */}
      <Dialog open={dialogImport} onClose={() => { setDialogImport(false); setImportResultado(null); setImportError(null); }} maxWidth="sm" fullWidth>
        <DialogTitle display="flex" alignItems="center" gap={1}>
          <UploadFile /> Importar materias desde Excel
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            El archivo Excel debe tener dos columnas: <strong>nombre</strong> (nombre exacto de la materia) y <strong>estado</strong> (aprobada, regularizada o cursando).
          </Typography>
          <Button variant="outlined" component="label" startIcon={importLoading ? <CircularProgress size={16} /> : <UploadFile />} disabled={importLoading} fullWidth>
            {importLoading ? 'Importando...' : 'Seleccionar archivo .xlsx'}
            <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={handleArchivoExcel} />
          </Button>
          {importError && <Alert severity="error" sx={{ mt: 2 }}>{importError}</Alert>}
          {importResultado && (
            <Box mt={2}>
              <Alert severity="success" sx={{ mb: 1 }}>{importResultado.message}</Alert>
              {importResultado.data?.ignoradas?.length > 0 && (
                <Alert severity="warning" sx={{ mb: 1 }}>
                  {importResultado.data.ignoradas.length} filas ignoradas (estado inválido o nombre vacío)
                </Alert>
              )}
              {importResultado.data?.errores?.length > 0 && (
                <Alert severity="error">
                  {importResultado.data.errores.length} materias no encontradas en el sistema:
                  <List dense>
                    {importResultado.data.errores.map((e, i) => (
                      <ListItem key={i} disablePadding>
                        <ListItemIcon><School fontSize="small" /></ListItemIcon>
                        <ListItemText primary={`"${e.fila.nombre}" — ${e.razon}`} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogImport(false); setImportResultado(null); setImportError(null); }}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
