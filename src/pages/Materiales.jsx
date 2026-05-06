import { useState } from 'react';
import {
  Typography, Box, Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemIcon, ListItemText, ListItemButton,
  Chip, TextField, InputAdornment
} from '@mui/material';
import {
  ExpandMore, PictureAsPdf, VideoLibrary, Link as LinkIcon,
  Search
} from '@mui/icons-material';

const mockMaterias = [
  {
    id: 1,
    nombre: "Algoritmos y Estructuras de Datos",
    codigo: "AED-101",
    profesor: "Dr. Carlos García",
    recursos: [
      { id: 1, tipo: "pdf", titulo: "Apuntes de Complejidad Algorítmica", url: "#", fecha: "2026-03-15" },
      { id: 2, tipo: "pdf", titulo: "Guía de Trabajos Prácticos - Unidad 3", url: "#", fecha: "2026-03-20" },
      { id: 3, tipo: "video", titulo: "Explicación de Árboles Binarios", url: "https://youtube.com", fecha: "2026-03-10" },
      { id: 4, tipo: "link", titulo: "Documentación Oficial de Estructuras de Datos", url: "https://docs.python.org", fecha: "2026-02-28" },
    ]
  },
  {
    id: 2,
    nombre: "Análisis Matemático I",
    codigo: "AM1-202",
    profesor: "Mg. Ana López",
    recursos: [
      { id: 5, tipo: "pdf", titulo: "Teoría de Límites y Continuidad", url: "#", fecha: "2026-04-01" },
      { id: 6, tipo: "pdf", titulo: "Ejercicios Resueltos - Serie 2", url: "#", fecha: "2026-04-05" },
      { id: 7, tipo: "video", titulo: "Tutorial: Derivadas paso a paso", url: "https://youtube.com", fecha: "2026-03-25" },
    ]
  },
  {
    id: 3,
    nombre: "Introducción a la Programación",
    codigo: "INT-101",
    profesor: "Lic. Martín Rodríguez",
    recursos: [
      { id: 8, tipo: "pdf", titulo: "Sintaxis básica de JavaScript", url: "#", fecha: "2026-02-15" },
      { id: 9, tipo: "pdf", titulo: "Práctica de Funciones", url: "#", fecha: "2026-02-20" },
      { id: 10, tipo: "video", titulo: "Introducción a Variables y Tipos de Datos", url: "https://youtube.com", fecha: "2026-02-10" },
      { id: 11, tipo: "link", titulo: "Recursos adicionales - MDN Web Docs", url: "https://developer.mozilla.org", fecha: "2026-02-05" },
    ]
  },
  {
    id: 4,
    nombre: "Sistemas Operativos",
    codigo: "SO-301",
    profesor: "Ing. Paula Fernández",
    recursos: [
      { id: 12, tipo: "pdf", titulo: "Apuntes de Gestión de Procesos", url: "#", fecha: "2026-03-01" },
      { id: 13, tipo: "video", titulo: "Video: Concepto de Memoria Virtual", url: "https://youtube.com", fecha: "2026-03-08" },
    ]
  }
];

const getIcono = (tipo) => {
  switch (tipo) {
    case 'pdf': return <PictureAsPdf color="error" />;
    case 'video': return <VideoLibrary color="error" />;
    case 'link': return <LinkIcon color="primary" />;
    default: return <LinkIcon />;
  }
};

const getChipColor = (tipo) => {
  switch (tipo) {
    case 'pdf': return 'error';
    case 'video': return 'error';
    case 'link': return 'primary';
    default: return 'default';
  }
};

const Materiales = () => {
  const [busqueda, setBusqueda] = useState('');

  const materiasFiltradas = mockMaterias.filter(materia =>
    materia.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    materia.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1000, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Materiales de Estudio
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Buscar por materia o código..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 4 }}
      />

      {materiasFiltradas.length === 0 ? (
        <Typography color="textSecondary" sx={{ textAlign: 'center', mt: 4 }}>
          No se encontraron materias
        </Typography>
      ) : (
        materiasFiltradas.map((materia) => (
          <Accordion key={materia.id} sx={{ mb: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{ backgroundColor: '#f5f5f5' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                <Typography variant="h6" sx={{ flex: 1 }}>
                  {materia.nombre}
                </Typography>
                <Chip label={materia.codigo} size="small" variant="outlined" />
                <Typography variant="body2" color="textSecondary">
                  {materia.recursos.length} recursos
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
                Profesor: {materia.profesor}
              </Typography>
              <List>
                {materia.recursos.map((recurso) => (
                  <ListItem key={recurso.id} disablePadding>
                    <ListItemButton
                      component="a"
                      href={recurso.url}
                      target="_blank"
                      rel="noopener"
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {getIcono(recurso.tipo)}
                      </ListItemIcon>
                      <ListItemText
                        primary={recurso.titulo}
                        secondary={recurso.fecha}
                      />
                      <Chip
                        label={recurso.tipo.toUpperCase()}
                        size="small"
                        color={getChipColor(recurso.tipo)}
                        variant="outlined"
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
};

export default Materiales;