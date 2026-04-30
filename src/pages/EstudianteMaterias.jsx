import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer,TableHead, TableRow, Paper, Chip, Alert, CircularProgress, Tabs, Tab, Grid, Avatar, ButtonGroup} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import EstudianteService from '../services/EstudianteService';
import { calcularMateriasDisponibles, ESTADOS_MATERIA, verificarCorrelatividades } from '../services/AcademicService';

// Importamos el plan completo de materias desde AcademicService
const MATERIAS_CARRERA = {
  'Licenciatura en Informática': [
    // Primer año
    { id: 1, nombre: 'Matemática I', año: 1, cuatrimestre: 1, correlativas: [], cargaHoraria: 8, area: 'CB' },
    { id: 2, nombre: 'Introducción a la Programación', año: 1, cuatrimestre: 1, correlativas: [], cargaHoraria: 8, area: 'AyL' },
    { id: 3, nombre: 'Organización de Computadoras', año: 1, cuatrimestre: 1, correlativas: [], cargaHoraria: 6, area: 'ASOyR' },
    { id: 4, nombre: 'Nuevos Entornos y Lenguajes', año: 1, cuatrimestre: 1, correlativas: [], cargaHoraria: 2, area: 'Otros' },
    { id: 5, nombre: 'Estructuras de Datos', año: 1, cuatrimestre: 2, correlativas: ['Introducción a la Programación'], cargaHoraria: 8, area: 'TC' },
    { id: 6, nombre: 'Programación con Objetos I', año: 1, cuatrimestre: 2, correlativas: ['Introducción a la Programación'], cargaHoraria: 8, area: 'AyL' },
    { id: 7, nombre: 'Bases de Datos', año: 1, cuatrimestre: 2, correlativas: ['Introducción a la Programación'], cargaHoraria: 6, area: 'ISBDySI' },
    { id: 8, nombre: 'Inglés I', año: 1, cuatrimestre: 2, correlativas: [], cargaHoraria: 2, area: 'Otros' },
    // Segundo Año
    { id: 9, nombre: 'Matemática II', año: 2, cuatrimestre: 1, correlativas: ['Matemática I'], cargaHoraria: 4, area: 'CB' },
    { id: 10, nombre: 'Programación con Objetos II', año: 2, cuatrimestre: 1, correlativas: ['Programación con Objetos I'], cargaHoraria: 6, area: 'AyL' },
    { id: 11, nombre: 'Redes de Computadoras', año: 2, cuatrimestre: 1, correlativas: ['Organización de Computadoras'], cargaHoraria: 6, area: 'ASOyR' },
    { id: 12, nombre: 'Sistemas Operativos', año: 2, cuatrimestre: 1, correlativas: ['Organización de Computadoras'], cargaHoraria: 6, area: 'ASOyR' },
    { id: 13, nombre: 'Programación Funcional', año: 2, cuatrimestre: 2, correlativas: ['Programación con Objetos I'], cargaHoraria: 4, area: 'AyL' },
    { id: 14, nombre: 'Construcción de Interfaces de Usuario', año: 2, cuatrimestre: 2, correlativas: ['Programación con Objetos II'], cargaHoraria: 6, area: 'ISBDySI' },
    { id: 15, nombre: 'Algoritmos', año: 2, cuatrimestre: 2, correlativas: ['Estructuras de Datos', 'Matemática II'], cargaHoraria: 6, area: 'AyL' },
    { id: 16, nombre: 'Estrategias de Persistencia', año: 2, cuatrimestre: 2, correlativas: ['Bases de Datos', 'Programación con Objetos II'], cargaHoraria: 6, area: 'ISBDySI' },
    { id: 17, nombre: 'Laboratorio de Sistemas Operativos y Redes', año: 2, cuatrimestre: 2, correlativas: ['Sistemas Operativos', 'Redes de Computadoras'], cargaHoraria: 4, area: 'ASOyR' },
    // Tercer Año
    { id: 18, nombre: 'Análisis Matemático', año: 3, cuatrimestre: 1, correlativas: ['Matemática II'], cargaHoraria: 6, area: 'CB' },
    { id: 19, nombre: 'Lógica y Programación', año: 3, cuatrimestre: 1, correlativas: ['Algoritmos'], cargaHoraria: 6, area: 'TC' },
    { id: 20, nombre: 'Elementos de Ingeniería de Software', año: 3, cuatrimestre: 1, correlativas: ['Programación con Objetos II'], cargaHoraria: 6, area: 'ISBDySI' },
    { id: 21, nombre: 'Seguridad de la Información', año: 3, cuatrimestre: 1, correlativas: ['Redes de Computadoras', 'Sistemas Operativos'], cargaHoraria: 4, area: 'ASOyR' },
    { id: 22, nombre: 'Materia UNAHUR I', año: 3, cuatrimestre: 1, correlativas: [], cargaHoraria: 2, area: 'Otros' },
    { id: 23, nombre: 'Inglés II', año: 3, cuatrimestre: 1, correlativas: ['Inglés I'], cargaHoraria: 2, area: 'Otros' },
    { id: 24, nombre: 'Matemática III', año: 3, cuatrimestre: 2, correlativas: ['Análisis Matemático'], cargaHoraria: 4, area: 'CB' },
    { id: 25, nombre: 'Programación Concurrente', año: 3, cuatrimestre: 2, correlativas: ['Programación con Objetos II', 'Sistemas Operativos'], cargaHoraria: 4, area: 'AyL' },
    { id: 26, nombre: 'Ingeniería de Requerimientos', año: 3, cuatrimestre: 2, correlativas: ['Elementos de Ingeniería de Software'], cargaHoraria: 4, area: 'ISBDySI' },
    { id: 27, nombre: 'Desarrollo de Aplicaciones', año: 3, cuatrimestre: 2, correlativas: ['Construcción de Interfaces de Usuario', 'Estrategias de Persistencia'], cargaHoraria: 6, area: 'ISBDySI' },
    // Cuarto Año
    { id: 28, nombre: 'Probabilidad y Estadística', año: 4, cuatrimestre: 1, correlativas: ['Matemática III'], cargaHoraria: 6, area: 'CB' },
    { id: 29, nombre: 'Gestión de Proyectos de Desarrollo de Software', año: 4, cuatrimestre: 1, correlativas: ['Ingeniería de Requerimientos'], cargaHoraria: 4, area: 'ISBDySI' },
    { id: 30, nombre: 'Lenguajes Formales y Autómatas', año: 4, cuatrimestre: 1, correlativas: ['Lógica y Programación'], cargaHoraria: 4, area: 'TC' },
    { id: 31, nombre: 'Programación con Objetos III', año: 4, cuatrimestre: 1, correlativas: ['Programación Concurrente'], cargaHoraria: 4, area: 'AyL' },
    { id: 32, nombre: 'Materia UNAHUR II', año: 4, cuatrimestre: 1, correlativas: ['Materia UNAHUR I'], cargaHoraria: 2, area: 'Otros' },
    { id: 33, nombre: 'Práctica Profesional Supervisada (PPS)', año: 4, cuatrimestre: 2, correlativas: ['Desarrollo de Aplicaciones'], cargaHoraria: 6, area: 'Otros' },
    { id: 34, nombre: 'Teoría de la Computación', año: 4, cuatrimestre: 2, correlativas: ['Lenguajes Formales y Autómatas'], cargaHoraria: 4, area: 'TC' },
    { id: 35, nombre: 'Arquitectura de Software I', año: 4, cuatrimestre: 2, correlativas: ['Gestión de Proyectos de Desarrollo de Software'], cargaHoraria: 4, area: 'ISBDySI' },
    { id: 36, nombre: 'Sistemas Distribuidos y Tiempo Real', año: 4, cuatrimestre: 2, correlativas: ['Laboratorio de Sistemas Operativos y Redes', 'Programación Concurrente'], cargaHoraria: 6, area: 'ASOyR' },
    // Quinto Año
    { id: 37, nombre: 'Tesina de Licenciatura', año: 5, cuatrimestre: 1, correlativas: ['Práctica Profesional Supervisada (PPS)'], cargaHoraria: 5, area: 'Otros' },
    { id: 38, nombre: 'Materia Optativa I', año: 5, cuatrimestre: 1, correlativas: [], cargaHoraria: 4, area: 'Optativa' },
    { id: 39, nombre: 'Características de Lenguajes de Programación', año: 5, cuatrimestre: 1, correlativas: ['Programación con Objetos III'], cargaHoraria: 4, area: 'AyL' },
    { id: 40, nombre: 'Arquitectura de Software II', año: 5, cuatrimestre: 1, correlativas: ['Arquitectura de Software I'], cargaHoraria: 4, area: 'ISBDySI' },
    { id: 41, nombre: 'Arquitectura de Computadoras', año: 5, cuatrimestre: 2, correlativas: ['Sistemas Distribuidos y Tiempo Real'], cargaHoraria: 4, area: 'ASOyR' },
    { id: 42, nombre: 'Materia Optativa II', año: 5, cuatrimestre: 2, correlativas: [], cargaHoraria: 4, area: 'Optativa' },
    { id: 43, nombre: 'Parseo y generación de código', año: 5, cuatrimestre: 2, correlativas: ['Teoría de la Computación'], cargaHoraria: 4, area: 'AyL' },
    { id: 44, nombre: 'Ejercicio Profesional', año: 5, cuatrimestre: 2, correlativas: [], cargaHoraria: 3, area: 'APyS' },
    { id: 45, nombre: 'Tecnología y Sociedad', año: 5, cuatrimestre: 2, correlativas: [], cargaHoraria: 3, area: 'APyS' }
  ],
  'Tecnicatura en Inteligencia Artificial': [
    { id: 1, nombre: 'Matemática para informática I', año: 1, cuatrimestre: 1, correlativas: [], cargaHoraria: 4, area: 'CB' },
    { id: 2, nombre: 'Introducción a lógica y problemas computacionales', año: 1, cuatrimestre: 1, correlativas: [], cargaHoraria: 4, area: 'AyL' },
    { id: 3, nombre: 'Introducción a la inteligencia artificial', año: 1, cuatrimestre: 1, correlativas: [], cargaHoraria: 4, area: 'IA' },
    { id: 4, nombre: 'Nuevos entornos y lenguajes', año: 1, cuatrimestre: 1, correlativas: [], cargaHoraria: 2, area: 'Gral' },
    { id: 5, nombre: 'Álgebra lineal', año: 1, cuatrimestre: 2, correlativas: ['Matemática para informática I'], cargaHoraria: 4, area: 'CB' },
    { id: 6, nombre: 'Cálculo', año: 1, cuatrimestre: 2, correlativas: ['Matemática para informática I'], cargaHoraria: 4, area: 'CB' },
    { id: 7, nombre: 'Taller de Programación I', año: 1, cuatrimestre: 2, correlativas: ['Introducción a lógica y problemas computacionales'], cargaHoraria: 4, area: 'AyL' },
    { id: 8, nombre: 'Tecnología y sociedad', año: 1, cuatrimestre: 2, correlativas: [], cargaHoraria: 3, area: 'Gral' },
    { id: 9, nombre: 'Inglés I', año: 1, cuatrimestre: 2, correlativas: [], cargaHoraria: 2, area: 'Gral' },
    { id: 10, nombre: 'Bases de datos', año: 2, cuatrimestre: 1, correlativas: ['Álgebra lineal'], cargaHoraria: 6, area: 'ISBDySI' },
    { id: 11, nombre: 'Probabilidad y estadística', año: 2, cuatrimestre: 1, correlativas: ['Álgebra lineal', 'Cálculo'], cargaHoraria: 6, area: 'CB' },
    { id: 12, nombre: 'Taller de Programación II', año: 2, cuatrimestre: 1, correlativas: ['Taller de Programación I'], cargaHoraria: 4, area: 'AyL' },
    { id: 13, nombre: 'Fundamentos de redes neuronales', año: 2, cuatrimestre: 1, correlativas: ['Introducción a la inteligencia artificial', 'Álgebra lineal', 'Taller de Programación I'], cargaHoraria: 4, area: 'IA' },
    { id: 14, nombre: 'Fundamentos de ciencias de datos', año: 2, cuatrimestre: 2, correlativas: ['Introducción a la inteligencia artificial', 'Álgebra lineal', 'Cálculo'], cargaHoraria: 3, area: 'IA' },
    { id: 15, nombre: 'Aprendizaje Automático', año: 2, cuatrimestre: 2, correlativas: ['Probabilidad y estadística', 'Fundamentos de redes neuronales'], cargaHoraria: 4, area: 'IA' },
    { id: 16, nombre: 'Electiva', año: 2, cuatrimestre: 2, correlativas: ['Probabilidad y estadística', 'Fundamentos de redes neuronales'], cargaHoraria: 4, area: 'Elec' },
    { id: 17, nombre: 'Taller de Programación III', año: 2, cuatrimestre: 2, correlativas: ['Taller de Programación II'], cargaHoraria: 4, area: 'AyL' },
    { id: 18, nombre: 'Inglés II', año: 2, cuatrimestre: 2, correlativas: ['Inglés I'], cargaHoraria: 2, area: 'Gral' },
    { id: 19, nombre: 'Materia UNAHUR', año: 3, cuatrimestre: 1, correlativas: [], cargaHoraria: 2, area: 'Gral' },
    { id: 20, nombre: 'Aprendizaje Automático Avanzado', año: 3, cuatrimestre: 1, correlativas: ['Aprendizaje Automático', 'Taller de Programación III'], cargaHoraria: 6, area: 'IA' },
    { id: 21, nombre: 'Procesamiento de Imágenes y Visión por Computadora', año: 3, cuatrimestre: 1, correlativas: ['Aprendizaje Automático', 'Taller de Programación III'], cargaHoraria: 6, area: 'IA' },
    { id: 22, nombre: 'Proyecto integrador', año: 3, cuatrimestre: 1, correlativas: ['Aprendizaje Automático', 'Taller de Programación III'], cargaHoraria: 5, area: 'IA' }
  ]
};

export const EstudianteMaterias = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [estudiante, setEstudiante] = useState(null);
  const [situacionAcademica, setSituacionAcademica] = useState(null);
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Datos de estudiantes para navegación
  const estudiantesDisponibles = [
    { id: 1, nombre: 'Juan Pérez', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
    { id: 2, nombre: 'María González', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face' },
    { id: 3, nombre: 'Carlos López', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }
  ];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [estudianteData, situacionData] = await Promise.all([
          EstudianteService.obtenerEstudiante(id),
          EstudianteService.obtenerMateriasEstudiante(id)
        ]);
        
        setEstudiante(estudianteData);
        setSituacionAcademica(situacionData);

        // Obtener plan completo de la carrera
        const materiasCompletas = obtenerPlanCompleto(situacionData);
        setMateriasDisponibles(materiasCompletas);
        
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar la información del estudiante');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      cargarDatos();
    }
  }, [id]);

  // Función para obtener el plan completo con estados
  const obtenerPlanCompleto = (situacionData) => {
    const planCarrera = MATERIAS_CARRERA[situacionData.carrera] || [];
    console.log('Plan de carrera:', planCarrera.length, 'materias');
    console.log('Situacion academica:', situacionData.situacionAcademica.length, 'materias cursadas');
    
    const resultado = planCarrera.map(materiaCompleta => {
      // Buscar si el estudiante ya cursó esta materia
      const materiaCursada = situacionData.situacionAcademica.find(
        m => m.nombre === materiaCompleta.nombre
      );

      if (materiaCursada) {
        // Si ya la cursó, usar su estado actual
        return {
          ...materiaCompleta,
          estado: materiaCursada.estado,
          nota: materiaCursada.nota,
          fecha: materiaCursada.fecha
        };
      } else {
        // Si no la cursó, verificar si puede cursarla por correlatividades
        const verificacion = verificarCorrelatividades(
          materiaCompleta.nombre, 
          situacionData.situacionAcademica, 
          situacionData.carrera
        );
        
        const estado = verificacion.puedeCorrer ? 'Puede Cursar' : 'No Disponible';
        
        if (!verificacion.puedeCorrer) {
          console.log(`${materiaCompleta.nombre}: No disponible -`, verificacion.motivo, verificacion.correlativasPendientes);
        }
        
        return {
          ...materiaCompleta,
          estado: estado,
          motivo: verificacion.motivo,
          correlativasPendientes: verificacion.correlativasPendientes?.map(c => c.nombre || c) || [],
          nota: null,
          fecha: null
        };
      }
    });
    
    const estados = {};
    resultado.forEach(m => {
      estados[m.estado] = (estados[m.estado] || 0) + 1;
    });
    console.log('Estados calculados:', estados);
    
    return resultado;
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'Aprobada': return 'success';
      case 'Regularizada': return 'warning';
      case 'Cursando': return 'info';
      case 'Puede Cursar': return 'primary';
      case 'No Disponible': return 'default';
      default: return 'default';
    }
  };

  const obtenerIconoEstado = (estado) => {
    switch (estado) {
      case 'Aprobada': return <CheckCircleIcon fontSize="small" />;
      case 'Cursando': return <ScheduleIcon fontSize="small" />;
      case 'Regularizada': return <ScheduleIcon fontSize="small" color="warning" />;
      case 'Puede Cursar': return <SchoolIcon fontSize="small" color="primary" />;
      case 'No Disponible': return <SchoolIcon fontSize="small" color="disabled" />;
      default: return <SchoolIcon fontSize="small" />;
    }
  };

  const filtrarMateriasPorEstado = (estado) => {
    const filtradas = materiasDisponibles.filter(m => m.estado === estado);
    if (estado === 'No Disponible') {
      console.log(`Filtrando por estado "${estado}":`, filtradas.length, 'materias encontradas');
      console.log('Primeras 3 materias No Disponibles:', filtradas.slice(0, 3));
    }
    return filtradas;
  };

  const contarMateriasPorAño = (año) => {
    const materias = materiasDisponibles.filter(m => m.año === año);
    return {
      total: materias.length,
      aprobadas: materias.filter(m => m.estado === 'Aprobada').length,
      cursando: materias.filter(m => m.estado === 'Cursando').length,
      disponibles: materias.filter(m => m.estado === 'Puede Cursar').length
    };
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!estudiante || !situacionAcademica) {
    return (
      <Box p={3}>
        <Alert severity="info">No se encontró información del estudiante</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          Inicio
        </Button>
        <Box flexGrow={1}>
          <Typography variant="h4">
            Materias de {estudiante.nombre} {estudiante.apellido}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {situacionAcademica.carrera}
          </Typography>
        </Box>
      </Box>

      {/* Navegación entre estudiantes */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Ver otros estudiantes:
        </Typography>
        <ButtonGroup variant="outlined" size="small">
          {estudiantesDisponibles.map((est) => (
            <Button
              key={est.id}
              variant={parseInt(id) === est.id ? "contained" : "outlined"}
              startIcon={
                <Avatar src={est.avatar} sx={{ width: 24, height: 24 }}>
                  <PersonIcon sx={{ fontSize: 16 }} />
                </Avatar>
              }
              onClick={() => navigate(`/estudiante/${est.id}/materias`)}
            >
              {est.nombre}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* Resumen estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {situacionAcademica?.estadisticas?.materiasAprobadas || 0}
              </Typography>
              <Typography variant="caption">Aprobadas</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {situacionAcademica?.estadisticas?.materiasRegularizadas || 0}
              </Typography>
              <Typography variant="caption">Regularizadas</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {situacionAcademica?.estadisticas?.materiasCursando || 0}
              </Typography>
              <Typography variant="caption">Cursando</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {filtrarMateriasPorEstado('Puede Cursar').length}
              </Typography>
              <Typography variant="caption">Disponibles</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="text.secondary">
                {(situacionAcademica?.estadisticas?.materiasAprobadas || 0) + 
                 (situacionAcademica?.estadisticas?.materiasRegularizadas || 0) + 
                 (situacionAcademica?.estadisticas?.materiasCursando || 0) + 
                 (situacionAcademica?.estadisticas?.materiasSinCursar || 0)}
              </Typography>
              <Typography variant="caption">Total Plan</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`Todas (${materiasDisponibles.length})`} />
            <Tab label={`Aprobadas (${filtrarMateriasPorEstado('Aprobada').length})`} />
            <Tab label={`Cursando (${filtrarMateriasPorEstado('Cursando').length})`} />
            <Tab label={`Disponibles (${filtrarMateriasPorEstado('Puede Cursar').length})`} />
            <Tab label={`Regularizadas (${filtrarMateriasPorEstado('Regularizada').length})`} />
            <Tab label={`No Disponibles (${filtrarMateriasPorEstado('No Disponible').length})`} />
          </Tabs>
        </Box>

        <CardContent>
          {/* Tab 0: Todas las materias */}
          {tabValue === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Año</TableCell>
                    <TableCell>Materia</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Nota</TableCell>
                    <TableCell>Carga Horaria</TableCell>
                    <TableCell>Área</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materiasDisponibles.map((materia, index) => (
                    <TableRow key={index}>
                      <TableCell>{materia.año}°</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {obtenerIconoEstado(materia.estado)}
                          <Typography sx={{ ml: 1 }}>
                            {materia.nombre}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={materia.estado}
                          color={obtenerColorEstado(materia.estado)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{materia.nota || '-'}</TableCell>
                      <TableCell>{materia.cargaHoraria}hs</TableCell>
                      <TableCell>{materia.area}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tab 1: Aprobadas */}
          {tabValue === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Año</TableCell>
                    <TableCell>Materia</TableCell>
                    <TableCell>Nota</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Área</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtrarMateriasPorEstado('Aprobada').map((materia, index) => (
                    <TableRow key={index}>
                      <TableCell>{materia.año}°</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {obtenerIconoEstado(materia.estado)}
                          <Typography sx={{ ml: 1 }}>
                            {materia.nombre}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography color="success.main" fontWeight="bold">
                          {materia.nota}
                        </Typography>
                      </TableCell>
                      <TableCell>{materia.fecha || '-'}</TableCell>
                      <TableCell>{materia.area}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tab 2: Cursando */}
          {tabValue === 2 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Año</TableCell>
                    <TableCell>Materia</TableCell>
                    <TableCell>Carga Horaria</TableCell>
                    <TableCell>Área</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtrarMateriasPorEstado('Cursando').map((materia, index) => (
                    <TableRow key={index}>
                      <TableCell>{materia.año}°</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {obtenerIconoEstado(materia.estado)}
                          <Typography sx={{ ml: 1 }}>
                            {materia.nombre}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{materia.cargaHoraria}hs</TableCell>
                      <TableCell>{materia.area}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tab 3: Disponibles para cursar */}
          {tabValue === 3 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Año</TableCell>
                    <TableCell>Materia</TableCell>
                    <TableCell>Carga Horaria</TableCell>
                    <TableCell>Correlatividades</TableCell>
                    <TableCell>Área</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtrarMateriasPorEstado('Puede Cursar').map((materia, index) => (
                    <TableRow key={index}>
                      <TableCell>{materia.año}°</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {obtenerIconoEstado(materia.estado)}
                          <Typography sx={{ ml: 1 }}>
                            {materia.nombre}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{materia.cargaHoraria}hs</TableCell>
                      <TableCell>
                        <Typography variant="caption" color="success.main">
                          ✓ Cumple correlatividades
                        </Typography>
                      </TableCell>
                      <TableCell>{materia.area}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tab 4: Regularizadas */}
          {tabValue === 4 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Año</TableCell>
                    <TableCell>Materia</TableCell>
                    <TableCell>Área</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtrarMateriasPorEstado('Regularizada').map((materia, index) => (
                    <TableRow key={index}>
                      <TableCell>{materia.año}°</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {obtenerIconoEstado(materia.estado)}
                          <Typography sx={{ ml: 1 }}>
                            {materia.nombre}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{materia.area}</TableCell>
                      <TableCell>
                        <Alert severity="warning" size="small">
                          Regularizada - Debe rendir final
                        </Alert>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tab 5: No Disponibles */}
          {tabValue === 5 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Año</TableCell>
                    <TableCell>Materia</TableCell>
                    <TableCell>Correlatividades Faltantes</TableCell>
                    <TableCell>Área</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtrarMateriasPorEstado('No Disponible').map((materia, index) => (
                    <TableRow key={index}>
                      <TableCell>{materia.año}°</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {obtenerIconoEstado(materia.estado)}
                          <Typography sx={{ ml: 1 }}>
                            {materia.nombre}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {materia.correlativasPendientes && materia.correlativasPendientes.length > 0 ? (
                          materia.correlativasPendientes.map((corr, idx) => (
                            <Chip key={idx} label={corr} size="small" color="error" sx={{ mr: 0.5, mb: 0.5 }} />
                          ))
                        ) : (
                          <Typography variant="caption">Verificar correlatividades</Typography>
                        )}
                      </TableCell>
                      <TableCell>{materia.area}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

        </CardContent>
      </Card>
    </Box>
  );
};