import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Chip } from '@mui/material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { School, Person, Book, Home, People, Groups, DynamicFeed, SwapHoriz } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export function TopMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { estudianteActual, loading } = useAuth();

  const menuItems = [
    { label: 'Inicio', path: '/', icon: <Home /> },
    { label: 'Mi Perfil', path: '/mi-perfil', icon: <Person /> },
    { label: 'Mis Materias', path: '/mis-materias', icon: <Book /> },
    { label: 'Carreras', path: '/carreras', icon: <School /> },
    { label: 'Feed', path: '/feed', icon: <DynamicFeed /> },
    { label: 'Conexiones', path: '/conexiones', icon: <Groups /> },
    { label: 'Sesiones', path: '/sesiones', icon: <Groups /> },
    // Demo oculto - cambiar manualmente la URL a /demo-selector
  ];

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Sistema Académico UNAHUR
          {/* Nombre de estudiante removido para mayor realismo */}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {menuItems.map((item) => (
            <Button
              key={item.label}
              color="inherit"
              onClick={() => {
                if (item.label === 'Materias') {
                  navigate(getMateriasPath());
                } else {
                  navigate(item.path);
                }
              }}
              startIcon={item.icon}
              sx={{ 
                backgroundColor: (
                  location.pathname === item.path || 
                  (item.label === 'Materias' && location.pathname.includes('/materias'))
                ) ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}