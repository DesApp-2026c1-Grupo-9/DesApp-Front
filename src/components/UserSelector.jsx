import React, { useEffect } from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  Avatar,
  Box,
  Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchStudents, switchStudent } from '../features/auth/slice';

export function UserSelector({ sx }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  const handleSwitch = async (usuarioId) => {
    const usuarioIdNumero = Number(usuarioId);
    const selectedUser = students.find((s) => s.id === usuarioIdNumero);
    dispatch(switchStudent(usuarioIdNumero));
    await cambiarEstudiantePorUsuarioId(usuarioIdNumero);
    if (selectedUser?.rol === 'administrador') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <FormControl
      size="small"
      sx={{
        minWidth: 240,
        bgcolor: 'background.paper',
        borderRadius: 1,
        ...sx,
      }}
      disabled={loadingStudents || !students?.length}
    >
      <Select
        value={user?.id || ''}
        onChange={(e) => handleSwitch(e.target.value)}
        sx={{
          borderRadius: 0,
          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
        }}
        renderValue={(selected) => {
          const student = students.find((s) => s.id === selected);
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                src={student?.avatarUrl || student?.avatar}
                sx={{ width: 24, height: 24 }}
              >
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
              <Avatar
                src={s.avatarUrl || s.avatar}
                sx={{ width: 28, height: 28 }}
              >
                {s.nombre?.charAt(0)}
              </Avatar>
              <Box>
                <Typography>{s.nombre} {s.apellido}</Typography>
                {s.rol === 'administrador' && (
                  <Typography
                    variant="caption"
                    color="warning.main"
                    sx={{ fontWeight: 'bold' }}
                  >
                    Administrador
                  </Typography>
                )}
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
