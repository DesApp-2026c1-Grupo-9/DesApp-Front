import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Chip, TextField, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, Alert, Grid} from '@mui/material';
import { MenuBook, ExpandMore, FilterList, School, Link as LinkIcon} from '@mui/icons-material';

export function SubjectManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Datos fijos del estudiante Juan Pérez
  const estudianteActual = {
    id: 1,
    nombre: 'Juan Pérez',
    carrera: 'Licenciatura en Informática',
    planEstudio: 'Plan 2026'
  };

  // Progreso académico de Juan Pérez - Licenciatura en Informática
  const progresoAcademico = [
    // Primer año
    { nombre: 'Matemática I', estado: 'Aprobada', año: 2025, cuatrimestre: 1, nota: 8 },
    { nombre: 'Introducción a la Programación', estado: 'Aprobada', año: 2025, cuatrimestre: 1, nota: 9 },
    { nombre: 'Organización de Computadoras', estado: 'Aprobada', año: 2025, cuatrimestre: 1, nota: 7 },
    { nombre: 'Nuevos Entornos y Lenguajes', estado: 'Aprobada', año: 2025, cuatrimestre: 1, nota: 8 },
    { nombre: 'Estructuras de Datos', estado: 'Regularizada', año: 2025, cuatrimestre: 2 },
    { nombre: 'Programación con Objetos I', estado: 'Cursando', año: 2026, cuatrimestre: 1 },
    { nombre: 'Bases de Datos', estado: 'Cursando', año: 2026, cuatrimestre: 1 },
    { nombre: 'Inglés I', estado: 'Aprobada', año: 2025, cuatrimestre: 2, nota: 7 }
  ];

  // Plan de estudios de la Licenciatura en Informática
  const planEstudios = {
    plan: 'Plan 2026',
    materias: [
        // Primer año
        {
          id: 1,
          nombre: 'Matemática I',
          año: 1,
          cuatrimestre: 1,
          tipo: 'Obligatoria',
          cargaHoraria: 8,
          area: 'CB',
          correlativas: [],
          descripcion: 'Fundamentos matemáticos para informática'
        },
        {
          id: 2,
          nombre: 'Introducción a la Programación',
          año: 1,
          cuatrimestre: 1,
          tipo: 'Obligatoria',
          cargaHoraria: 8,
          area: 'AyL',
          correlativas: [],
          descripcion: 'Conceptos fundamentales de programación'
        },
        {
          id: 3,
          nombre: 'Organización de Computadoras',
          año: 1,
          cuatrimestre: 1,
          tipo: 'Obligatoria',
          cargaHoraria: 6,
          area: 'ASOyR',
          correlativas: [],
          descripcion: 'Arquitectura y funcionamiento de computadoras'
        },
        {
          id: 4,
          nombre: 'Nuevos Entornos y Lenguajes',
          año: 1,
          cuatrimestre: 1,
          tipo: 'Obligatoria',
          cargaHoraria: 2,
          area: 'Otros',
          correlativas: [],
          descripcion: 'Exploración de tecnologías emergentes'
        },
        {
          id: 5,
          nombre: 'Estructuras de Datos',
          año: 1,
          cuatrimestre: 2,
          tipo: 'Obligatoria',
          cargaHoraria: 8,
          area: 'TC',
          correlativas: ['Introducción a la Programación'],
          descripcion: 'Algoritmos y estructuras fundamentales'
        },
        {
          id: 6,
          nombre: 'Programación con Objetos I',
          año: 1,
          cuatrimestre: 2,
          tipo: 'Obligatoria',
          cargaHoraria: 8,
          area: 'AyL',
          correlativas: ['Introducción a la Programación'],
          descripcion: 'Paradigma de programación orientada a objetos'
        },
        {
          id: 7,
          nombre: 'Bases de Datos',
          año: 1,
          cuatrimestre: 2,
          tipo: 'Obligatoria',
          cargaHoraria: 6,
          area: 'ISBDySI',
          correlativas: ['Introducción a la Programación'],
          descripcion: 'Diseño y gestión de bases de datos relacionales'
        },
        {
          id: 8,
          nombre: 'Inglés I',
          año: 1,
          cuatrimestre: 2,
          tipo: 'Obligatoria',
          cargaHoraria: 2,
          area: 'Otros',
          correlativas: [],
          descripcion: 'Inglés técnico nivel básico'
        },
        // Segundo Año
        {
          id: 9,
          nombre: 'Matemática II',
          año: 2,
          cuatrimestre: 1,
          tipo: 'Obligatoria',
          cargaHoraria: 4,
          area: 'CB',
          correlativas: ['Matemática I'],
          descripcion: 'Cálculo y álgebra avanzada'
        },
        {
          id: 10,
          nombre: 'Programación con Objetos II',
          año: 2,
          cuatrimestre: 1,
          tipo: 'Obligatoria',
          cargaHoraria: 6,
          area: 'AyL',
          correlativas: ['Programación con Objetos I'],
          descripcion: 'Programación orientada a objetos avanzada'
        },
        {
          id: 11,
          nombre: 'Análisis Matemático',
          año: 2,
          cuatrimestre: 2,
          tipo: 'Obligatoria',
          cargaHoraria: 4,
          area: 'CB',
          correlativas: ['Matemática II'],
          descripcion: 'Análisis matemático avanzado'
        },
        {
          id: 12,
          nombre: 'Matemática III',
          año: 3,
          cuatrimestre: 1,
          tipo: 'Obligatoria',
          cargaHoraria: 4,
          area: 'CB',
          correlativas: ['Análisis Matemático'],
          descripcion: 'Matemática discreta y álgebra lineal'
        },
        {
          id: 13,
          nombre: 'Inglés II',
          año: 3,
          cuatrimestre: 1,
          tipo: 'Obligatoria',
          cargaHoraria: 2,
          area: 'Otros',
          correlativas: ['Inglés I'],
          descripcion: 'Inglés técnico nivel intermedio'
        }
        // Las demás materias se pueden agregar según necesidad para mostrar la estructura completa
      ]
    };

  // Función para obtener el estado de una materia específica
  const getEstadoMateria = (nombreMateria) => {
    const materia = progresoAcademico.find(m => m.nombre === nombreMateria);
    return materia ? materia.estado : 'Sin Cursar';
  };

  // Función para obtener información adicional de progreso
  const getInfoProgreso = (nombreMateria) => {
    const materia = progresoAcademico.find(m => m.nombre === nombreMateria);
    return materia || null;
  };

  // Combinar plan de estudios con progreso académico del estudiante actual
  const materiasConProgreso = planEstudios.materias.map(materia => {
      const estadoMateria = getEstadoMateria(materia.nombre);
      const infoProgreso = getInfoProgreso(materia.nombre);
      
      return {
        ...materia,
        estadoAcademico: estadoMateria,
        infoProgreso: infoProgreso
      };
    }).filter(materia => {
      const matchesSearch = searchTerm === '' || 
        materia.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

  // Calcular estadísticas de progreso
  const calcularEstadisticas = () => {
    const totalMaterias = planEstudios.materias.length;
    const aprobadas = materiasConProgreso.filter(m => m.estadoAcademico === 'Aprobada').length;
    const regularizadas = materiasConProgreso.filter(m => m.estadoAcademico === 'Regularizada').length;
    const cursando = materiasConProgreso.filter(m => m.estadoAcademico === 'Cursando').length;
    const sinCursar = materiasConProgreso.filter(m => m.estadoAcademico === 'Sin Cursar').length;
    
    return {
      totalMaterias,
      aprobadas,
      regularizadas,
      cursando,
      sinCursar,
      porcentajeAprobado: ((aprobadas / totalMaterias) * 100).toFixed(1)
    };
  };

  const estadisticas = calcularEstadisticas();

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Aprobada': return 'success';
      case 'Regularizada': return 'warning';
      case 'Cursando': return 'info';
      case 'Sin Cursar': return 'default';
      default: return 'default';
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'Obligatoria': return 'primary';
      case 'Optativa': return 'secondary';
      case 'Electiva': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <MenuBook sx={{ mr: 1, verticalAlign: 'middle' }} />
        Mi Progreso Académico
      </Typography>

      {/* Información del Estudiante y Búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom>
                {estudianteActual.nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {estudianteActual.carrera} - {estudianteActual.planEstudio}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Buscar materia por nombre"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        {estudianteActual.nombre} - {estudianteActual.carrera} - {estudianteActual.planEstudio}
      </Typography>

      {/* Estadísticas de Progreso */}
      {estadisticas && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <School sx={{ mr: 1, verticalAlign: 'middle' }} />
              Progreso de {estudianteActual.carrera}
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">{estadisticas.aprobadas}</Typography>
                  <Typography variant="body2">Aprobadas</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="warning.main">{estadisticas.regularizadas}</Typography>
                  <Typography variant="body2">Regularizadas</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="info.main">{estadisticas.cursando}</Typography>
                  <Typography variant="body2">Cursando</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="text.secondary">{estadisticas.sinCursar}</Typography>
                  <Typography variant="body2">Sin Cursar</Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info">
                  Progreso total: <strong>{estadisticas.porcentajeAprobado}%</strong> completado 
                  ({estadisticas.aprobadas} de {estadisticas.totalMaterias} materias aprobadas)
                </Alert>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Lista de Materias con Progreso */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Plan de Estudios - {estudianteActual.carrera} ({materiasConProgreso.length} materias)
          </Typography>
          
          {materiasConProgreso.length > 0 ? (
              materiasConProgreso.map((materia) => (
                <Accordion key={materia.id} sx={{ mb: 1 }}>
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls={`panel-${materia.id}-content`}
                    id={`panel-${materia.id}-header`}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {materia.nombre}
                        </Typography>
                        
                        {/* Estado Académico */}
                        <Chip
                          label={materia.estadoAcademico}
                          color={getEstadoColor(materia.estadoAcademico)}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                        
                        {/* Nota si está aprobada */}
                        {materia.infoProgreso && materia.infoProgreso.nota && (
                          <Chip
                            label={`Nota: ${materia.infoProgreso.nota}`}
                            color="success"
                            variant="outlined"
                            size="small"
                          />
                        )}
                        
                        <Chip
                          label={materia.tipo}
                          color={getTipoColor(materia.tipo)}
                          size="small"
                          variant="outlined"
                        />
                        
                        {materia.correlativas.length > 0 && (
                          <Chip
                            icon={<LinkIcon />}
                            label={`${materia.correlativas.length} correlativa${materia.correlativas.length > 1 ? 's' : ''}`}
                            variant="outlined"
                            size="small"
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {materia.año}° Año • {materia.cuatrimestre}° Cuatrimestre • 
                        {materia.cargaHoraria}hs semanales
                        {materia.area && ` • Área: ${materia.area}`}
                        {materia.infoProgreso && materia.infoProgreso.año && 
                          ` • Cursada en: ${materia.infoProgreso.año}`}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Descripción
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {materia.descripcion}
                        </Typography>
                        
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                          Detalles Académicos
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText
                              primary="Año de cursada"
                              secondary={`${materia.año}° Año`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Cuatrimestre"
                              secondary={`${materia.cuatrimestre}° Cuatrimestre`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Carga horaria semanal"
                              secondary={`${materia.cargaHoraria} horas`}
                            />
                          </ListItem>
                        </List>
                      </Grid>
                      
                      <Grid item xs={12} md={3}>
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Correlatividades
                        </Typography>
                        {materia.correlativas.length > 0 ? (
                          <List dense>
                            {materia.correlativas.map((correlativa, index) => (
                              <ListItem key={index} sx={{ py: 0.5 }}>
                                <Chip
                                  label={correlativa}
                                  variant="outlined"
                                  size="small"
                                  color="primary"
                                />
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No tiene correlatividades
                          </Typography>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} md={3}>
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Estado Académico
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Chip
                            label={materia.estadoAcademico}
                            color={getEstadoColor(materia.estadoAcademico)}
                            sx={{ fontWeight: 'bold', width: 'fit-content' }}
                          />
                          
                          {materia.infoProgreso && (
                            <>
                              {materia.infoProgreso.nota && (
                                <Typography variant="body2">
                                  <strong>Nota:</strong> {materia.infoProgreso.nota}
                                </Typography>
                              )}
                              {materia.infoProgreso.año && (
                                <Typography variant="body2">
                                  <strong>Año cursada:</strong> {materia.infoProgreso.año}
                                </Typography>
                              )}
                              {materia.infoProgreso.cuatrimestre && (
                                <Typography variant="body2">
                                  <strong>Cuatrimestre:</strong> {materia.infoProgreso.cuatrimestre}°
                                </Typography>
                              )}
                            </>
                          )}
                          
                          {materia.estadoAcademico === 'Sin Cursar' && (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              Materia no cursada aún
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                No se encontraron materias con los filtros aplicados
              </Typography>
            )}
          </CardContent>
        </Card>
    </Box>
  );
}