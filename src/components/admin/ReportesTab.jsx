import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  Tabs, Tab, CircularProgress, Avatar, Divider,
} from '@mui/material';
import {
  People, School, MenuBook, Group, Flag, BarChart,
  TrendingUp, ThumbUp, Link as LinkIcon, Assessment,
  HowToVote,
} from '@mui/icons-material';
import api from '../../api/axiosConfig';
import { TabPanel } from '../ui';

function MiniBar({ value, max, color = 'primary' }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ flexGrow: 1, bgcolor: 'grey.100', borderRadius: 1, height: 20, overflow: 'hidden' }}>
        <Box sx={{ width: `${pct}%`, bgcolor: `${color}.main`, height: '100%', borderRadius: 1, transition: 'width 0.3s' }} />
      </Box>
      <Typography variant="caption" sx={{ minWidth: 30, textAlign: 'right', fontWeight: 600 }}>{value}</Typography>
    </Box>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = 'primary' }) {
  return (
    <Card variant="outlined" sx={{ borderTop: 4, borderTopColor: `${color}.main`, height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '100%', boxSizing: 'border-box' }}>
        <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48, flexShrink: 0 }}>
          <Icon sx={{ color: '#fff' }} />
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}

function ResumenUsuarios({ data }) {
  if (!data) return null;
  return (
    <Grid container spacing={2}>
      <Grid item xs={6} sm={3}><StatCard icon={People} label="Total Usuarios" value={data.total} color="primary" /></Grid>
      <Grid item xs={6} sm={3}><StatCard icon={People} label="Usuarios activos" value={data.activos} sub={`${data.total > 0 ? ((data.activos / data.total) * 100).toFixed(0) : 0}%`} color="success" /></Grid>
      <Grid item xs={6} sm={3}><StatCard icon={School} label="Estudiantes" value={data.estudiantes} color="info" /></Grid>
      <Grid item xs={6} sm={3}><StatCard icon={Assessment} label="Administradores" value={data.administradores} color="warning" /></Grid>
    </Grid>
  );
}

function DistribucionTable({ title, data, labelKey, valueKey, labelName, valueName, color = 'primary' }) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map((d) => d[valueKey]));
  return (
    <Card variant="outlined" sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>{title}</Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                <TableCell>{labelName}</TableCell>
                <TableCell>{valueName}</TableCell>
                <TableCell sx={{ width: '40%' }}>Distribución</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row[labelKey]}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row[valueKey]}</TableCell>
                  <TableCell><MiniBar value={row[valueKey]} max={maxVal} color={color} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

function TopMateriasTable({ title, data }) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map((d) => d.cantidad));
  return (
    <Card variant="outlined" sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>{title}</Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                <TableCell>#</TableCell>
                <TableCell>Materia</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell sx={{ width: '35%' }}>Distribución</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.materia}</TableCell>
                  <TableCell>{row.codigo || '-'}</TableCell>
                  <TableCell>{row.cantidad}</TableCell>
                  <TableCell><MiniBar value={row.cantidad} max={maxVal} color="info" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

function SesionesChart({ data }) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map((d) => d.cantidad));
  return (
    <Card variant="outlined" sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Sesiones por Período</Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                <TableCell>Período</TableCell>
                <TableCell>Sesiones</TableCell>
                <TableCell sx={{ width: '40%' }}>Distribución</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{new Date(row.periodo).toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.cantidad}</TableCell>
                  <TableCell><MiniBar value={row.cantidad} max={maxVal} color="warning" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

function MaterialesValoradosTable({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <Card variant="outlined" sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Materiales Mejor Valorados</Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                <TableCell>#</TableCell>
                <TableCell>Material</TableCell>
                <TableCell>Materia</TableCell>
                <TableCell align="center">👍</TableCell>
                <TableCell align="center">👎</TableCell>
                <TableCell align="center">Ratio</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.titulo}</TableCell>
                  <TableCell>{row.materia}</TableCell>
                  <TableCell align="center"><Chip label={row.likes} size="small" color="success" variant="outlined" /></TableCell>
                  <TableCell align="center"><Chip label={row.dislikes} size="small" color="error" variant="outlined" /></TableCell>
                  <TableCell align="center">
                    <Chip label={`${row.ratio.toFixed(0)}%`} size="small" color={row.ratio >= 50 ? 'success' : 'error'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

function DenunciasStats({ data }) {
  if (!data) return null;
  const maxEstado = Math.max(...(data.porEstado || []).map((d) => d.cantidad), 1);
  const maxMotivo = Math.max(...(data.porMotivo || []).map((d) => d.cantidad), 1);
  return (
    <Grid container spacing={2}>
      {data.porEstado && data.porEstado.length > 0 && (
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Card variant="outlined" sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Denuncias por Estado</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ flexGrow: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                      <TableCell>Estado</TableCell>
                      <TableCell>Cantidad</TableCell>
                      <TableCell sx={{ width: '40%' }}>Distribución</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.porEstado.map((r, i) => {
                      const colors = { pendiente: 'warning', confirmada: 'error', rechazada: 'default', revocada: 'info' };
                      return (
                        <TableRow key={i}>
                          <TableCell><Chip label={r.estado} size="small" color={colors[r.estado] || 'default'} /></TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{r.cantidad}</TableCell>
                          <TableCell><MiniBar value={r.cantidad} max={maxEstado} color={colors[r.estado] || 'primary'} /></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      )}
      {data.porMotivo && data.porMotivo.length > 0 && (
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Card variant="outlined" sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Denuncias por Motivo</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ flexGrow: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                      <TableCell>Motivo</TableCell>
                      <TableCell>Cantidad</TableCell>
                      <TableCell sx={{ width: '40%' }}>Distribución</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.porMotivo.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell>{r.motivo}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{r.cantidad}</TableCell>
                        <TableCell><MiniBar value={r.cantidad} max={maxMotivo} color="error" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}

function UtilizacionSesionesCard({ data }) {
  if (!data) return null;
  return (
    <Grid container spacing={2}>
      <Grid item xs={4}><StatCard icon={MenuBook} label="Total de sesiones" value={data.totalSesiones} color="info" /></Grid>
      <Grid item xs={4}><StatCard icon={Group} label="Sesiones con participantes" value={data.sesionesConParticipantes} color="success" /></Grid>
      <Grid item xs={4}><StatCard icon={People} label="Promedio de participantes" value={data.promedioParticipantes} color="warning" /></Grid>
      {data.distribucion && data.distribucion.length > 0 && (
        <Grid item xs={12}>
          <DistribucionTable
            title="Participantes por Sesión"
            data={data.distribucion}
            labelKey="participantes"
            valueKey="sesiones"
            labelName="Participantes"
            valueName="Sesiones"
            color="info"
          />
        </Grid>
      )}
    </Grid>
  );
}

function CarrerasActivasTable({ data }) {
  if (!data || data.length === 0) return null;
  const maxPuntaje = Math.max(...data.map((d) => d.puntaje));
  return (
    <Card variant="outlined" sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Carreras con Comunidad Más Activa</Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                <TableCell>#</TableCell>
                <TableCell>Carrera</TableCell>
                <TableCell align="center">Estudiantes</TableCell>
                <TableCell align="center">Materiales</TableCell>
                <TableCell align="center">Sesiones</TableCell>
                <TableCell align="center">Puntaje</TableCell>
                <TableCell sx={{ width: '30%' }}>Actividad</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.nombre}</TableCell>
                  <TableCell align="center">{row.estudiantes}</TableCell>
                  <TableCell align="center">{row.materiales}</TableCell>
                  <TableCell align="center">{row.sesiones}</TableCell>
                  <TableCell align="center"><Chip label={row.puntaje} size="small" color="primary" /></TableCell>
                  <TableCell><MiniBar value={row.puntaje} max={maxPuntaje} color="success" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

export default function ReportesTab() {
  const [subTab, setSubTab] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/api/admin/reportes')
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Avatar sx={{ bgcolor: 'success.main', width: 36, height: 36 }}>
          <BarChart sx={{ fontSize: 20, color: '#fff' }} />
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Reportes y Estadísticas</Typography>
      </Box>

      <Tabs
        value={subTab}
        onChange={(_, v) => setSubTab(v)}
        sx={{ mb: 3, minHeight: 10, '& .MuiTab-root': { pt: 1, pb: 1, minHeight: 10, '& .MuiTab-iconWrapper': { mb: 0 } } }}
      >
        <Tab icon={<BarChart />} label="Uso del Sistema" iconPosition="start" />
        <Tab icon={<MenuBook />} label="Materiales y Sesiones" iconPosition="start" />
        <Tab icon={<HowToVote />} label="Denuncias" iconPosition="start" />
        <Tab icon={<Group />} label="Social" iconPosition="start" />
      </Tabs>

      <TabPanel value={subTab} index={0}>
        <ResumenUsuarios data={data?.usuariosActivos} />
        <DistribucionTable
          title="Materias Cursadas por Alumno"
          data={data?.materiasCursadasPorAlumno}
          labelKey="materias"
          valueKey="alumnos"
          labelName="Materias cursando"
          valueName="Alumnos"
          color="info"
        />
        <DistribucionTable
          title="Materias Aprobadas por Alumno"
          data={data?.materiasAprobadasPorAlumno}
          labelKey="materias"
          valueKey="alumnos"
          labelName="Materias aprobadas"
          valueName="Alumnos"
          color="success"
        />
        <DistribucionTable
          title="Materias Cursadas por Carrera"
          data={data?.materiasCursadasPorCarrera}
          labelKey="carrera"
          valueKey="cantidad"
          labelName="Carrera"
          valueName="Materias cursando"
          color="info"
        />
        <DistribucionTable
          title="Materias Aprobadas por Carrera"
          data={data?.materiasAprobadasPorCarrera}
          labelKey="carrera"
          valueKey="cantidad"
          labelName="Carrera"
          valueName="Materias aprobadas"
          color="success"
        />
      </TabPanel>

      <TabPanel value={subTab} index={1}>
        <TopMateriasTable title="Materias con Más Materiales Compartidos" data={data?.materiasConMasMateriales} />
        <SesionesChart data={data?.sesionesPorPeriodo} />
        <MaterialesValoradosTable data={data?.materialesMejorValorados} />
      </TabPanel>

      <TabPanel value={subTab} index={2}>
        <DenunciasStats data={data?.estadisticasDenuncias} />
      </TabPanel>

      <TabPanel value={subTab} index={3}>
        <DistribucionTable
          title="Conexiones por Estudiante"
          data={data?.conexionesPorEstudiante}
          labelKey="conexiones"
          valueKey="estudiantes"
          labelName="Cantidad de conexiones"
          valueName="Estudiantes"
          color="primary"
        />
        <Box sx={{ mt: 2 }}>
          <UtilizacionSesionesCard data={data?.utilizacionSesiones} />
        </Box>
        <CarrerasActivasTable data={data?.carrerasMasActivas} />
      </TabPanel>
    </Box>
  );
}
