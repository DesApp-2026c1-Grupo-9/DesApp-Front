import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { School, Person, Book, Home } from '@mui/icons-material';

export function TopMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Inicio', path: '/', icon: <Home /> },
    { label: 'Perfil Estudiantil', path: '/estudiante', icon: <Person /> },
    { label: 'Carreras', path: '/carreras', icon: <School /> },
    { label: 'Materias', path: '/materias', icon: <Book /> },
  ];

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Sistema Académico UNAHUR
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {menuItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              onClick={() => navigate(item.path)}
              startIcon={item.icon}
              sx={{ 
                backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.2)' : 'transparent',
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