import React, { useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { School, Person, Book, Home, People, Groups, DynamicFeed, SwapHoriz, LibraryBooks, AdminPanelSettings } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { fetchStudents, switchStudent } from '../features/auth/slice';

export function TopMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, students, loadingStudents } = useSelector((state) => state.auth);
  const { cambiarEstudiantePorUsuarioId } = useAuth();

  useEffect(() => {
    if (!students?.length) {
      dispatch(fetchStudents());
    }
  }, [dispatch, students?.length]);

  useEffect(() => {
    if (user?.id) {
      cambiarEstudiantePorUsuarioId(user.id);
    }
  }, [user?.id, cambiarEstudiantePorUsuarioId]);

  const handleSwitchUsuarioGlobal = async (usuarioId) => {
    const usuarioIdNumero = Number(usuarioId);
    dispatch(switchStudent(usuarioIdNumero));
    await cambiarEstudiantePorUsuarioId(usuarioIdNumero);
  };

  const showAdmin = user?.rol === 'administrador';

  const menuItems = [
    { label: 'Inicio', path: '/', icon: <Home /> },
    { label: 'Mi Perfil', path: '/mi-perfil', icon: <Person /> },
    { label: 'Mis Materias', path: '/mis-materias', icon: <Book /> },
    { label: 'Carreras', path: '/carreras', icon: <School /> },
    { label: 'Feed', path: '/feed', icon: <DynamicFeed /> },
    { label: 'Conexiones', path: '/conexiones', icon: <Groups /> },
    { label: 'Sesiones', path: '/sesiones', icon: <Groups /> },
    { label: 'Materiales', path: '/materiales', icon: <LibraryBooks /> },
    ...(showAdmin ? [{ label: 'Admin', path: '/admin', icon: <AdminPanelSettings /> }] : []),
  ];

  return (
    <AppBar position="static" sx={{ mb: 3, borderRadius: 0 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Box
            component="a"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            sx={{
              fontWeight: 'bold',
              color: 'inherit',
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': {
                color: 'inherit'
              }
            }}
          >
            Sistema Académico UNAHUR
          </Box>
        </Typography>

        <FormControl size="small" sx={{ minWidth: 240, mr: 2, bgcolor: 'background.paper', borderRadius: 1 }} disabled={loadingStudents || !students?.length}>
          
          <Select
            value={user?.id || ''}
            label="Simular Usuario"
            onChange={(e) => handleSwitchUsuarioGlobal(e.target.value)}
            sx={{ 
              borderRadius: 0,
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
            }}
            renderValue={(selected) => {
              const student = students.find((s) => s.id === selected);
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar src={student?.avatarUrl || student?.avatar} sx={{ width: 24, height: 24 }}>
                    {student?.nombre?.charAt(0)}
                  </Avatar>
                  <Typography variant="body2" fontWeight="500">
                    {student?.nombre} {student?.apellido}
                  </Typography>
                </Box>
              );
            }}
          >
            {students.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar src={s.avatarUrl || s.avatar} sx={{ width: 28, height: 28 }}>
                    {s.nombre?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography>
                      {s.nombre} {s.apellido}
                    </Typography>
                    {s.rol === 'administrador' && (
                      <Typography variant="caption" color="warning.main" sx={{ fontWeight: 'bold' }}>
                        Administrador
                      </Typography>
                    )}
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {menuItems.filter(item => item.label !== 'Inicio').map((item) => (
            <Button
              key={item.label}
              variant="text"
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