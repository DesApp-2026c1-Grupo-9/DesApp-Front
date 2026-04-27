import React, { useState } from 'react';
import { Box, Card, CardContent, Grid, Typography, Avatar, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Switch, FormControlLabel, Divider, LinearProgress} from '@mui/material';
import { School, Email, Person, AccountCircle } from '@mui/icons-material';
import { AcademicAnalysisComponent } from '../components/AcademicAnalysisComponent';

export function StudentProfilePage() {
  const [showEmail, setShowEmail] = useState(true);
  const [showAcademicSituation, setShowAcademicSituation] = useState(true);
  const [profilePublic, setProfilePublic] = useState(false);

  // Mock data del estudiante
  const studentData = {
    name: 'Juan Pérez',
    email: 'juan.perez@estudiante.unahur.edu.ar',
    legajo: '12345',
    carrera: 'Licenciatura en Informática',
    planEstudio: 'Plan 2026',
    añoIngreso: 2025,
    materias: [
      { nombre: 'Matemática I', estado: 'Aprobada', año: 2025, cuatrimestre: 1, nota: 8 },
      { nombre: 'Introducción a la Programación', estado: 'Aprobada', año: 2025, cuatrimestre: 1, nota: 9 },
      { nombre: 'Organización de Computadoras', estado: 'Aprobada', año: 2025, cuatrimestre: 1, nota: 7 },
      { nombre: 'Nuevos Entornos y Lenguajes', estado: 'Aprobada', año: 2025, cuatrimestre: 1, nota: 8 },
      { nombre: 'Estructuras de Datos', estado: 'Regularizada', año: 2025, cuatrimestre: 2, nota: null },
      { nombre: 'Programación con Objetos I', estado: 'Cursando', año: 2026, cuatrimestre: 1, nota: null },
      { nombre: 'Bases de Datos', estado: 'Cursando', año: 2026, cuatrimestre: 1, nota: null },
      { nombre: 'Inglés I', estado: 'Aprobada', año: 2025, cuatrimestre: 2, nota: 7 }
    ]
  };

  // Calcular progreso de la carrera
  const materiasAprobadas = studentData.materias.filter(m => m.estado === 'Aprobada').length;
  const totalMaterias = 45; // Total de materias de la Licenciatura en Informática
  const progresoCarrera = (materiasAprobadas / totalMaterias) * 100;

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Aprobada': return 'success';
      case 'Regularizada': return 'warning';
      case 'Cursando': return 'info';
      case 'Puede Cursar': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
        Perfil de Estudiante
      </Typography>

      <Grid container spacing={3}>
        {/* Información Personal */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                src="/placeholder-avatar.jpg"
              >
                <AccountCircle sx={{ fontSize: 80 }} />
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {studentData.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Legajo: {studentData.legajo}
              </Typography>

              {showEmail && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <Email sx={{ mr: 1, verticalAlign: 'middle', fontSize: 16 }} />
                  {studentData.email}
                </Typography>
              )}

              <Chip
                icon={<School />}
                label={studentData.carrera}
                color="primary"
                sx={{ mb: 1 }}
              />
              
              <Typography variant="body2" color="text.secondary">
                {studentData.planEstudio} - Ingreso {studentData.añoIngreso}
              </Typography>

              <Divider sx={{ my: 2 }} />
              
              {/* Configuración de Privacidad */}
              <Typography variant="h6" gutterBottom>
                Configuración de Privacidad
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={profilePublic}
                    onChange={(e) => setProfilePublic(e.target.checked)}
                  />
                }
                label="Perfil Público"
                sx={{ mb: 1 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={showEmail}
                    onChange={(e) => setShowEmail(e.target.checked)}
                  />
                }
                label="Mostrar Email"
                sx={{ mb: 1 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={showAcademicSituation}
                    onChange={(e) => setShowAcademicSituation(e.target.checked)}
                  />
                }
                label="Mostrar Situación Académica"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Situación Académica */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Progreso de Carrera
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={progresoCarrera} 
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(progresoCarrera)}%
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                {materiasAprobadas} de {totalMaterias} materias aprobadas
              </Typography>
            </CardContent>
          </Card>

          {showAcademicSituation && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Situación Académica Detallada
                </Typography>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Materia</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Año</TableCell>
                        <TableCell>Cuatrimestre</TableCell>
                        <TableCell>Nota</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {studentData.materias.map((materia, index) => (
                        <TableRow key={index}>
                          <TableCell component="th" scope="row">
                            {materia.nombre}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={materia.estado}
                              color={getEstadoColor(materia.estado)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{materia.año || '-'}</TableCell>
                          <TableCell>{materia.cuatrimestre || '-'}</TableCell>
                          <TableCell>{materia.nota || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Componente de Análisis Académico */}
      {showAcademicSituation && (
        <AcademicAnalysisComponent 
          situacionAcademica={studentData.materias}
          carrera={studentData.carrera}
        />
      )}
    </Box>
  );
}