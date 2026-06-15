import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Button, Checkbox, FormControlLabel, Box
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '../api/axiosConfig';

const SesionModal = ({ open, sesion, onSave, onCancel }) => {
  const [materias, setMaterias] = useState([]);
  const [materiaMenuWidth, setMateriaMenuWidth] = useState(0);
  const materiaFormRef = useCallback(node => {
    if (node && !materiaMenuWidth) setMateriaMenuWidth(node.offsetWidth);
  }, []);

  useEffect(() => {
    api.get('/api/materias?limit=0')
      .then(res => {
        const lista = res.data?.data || res.data || [];
        const mapped = Array.isArray(lista) 
          ? lista.map(m => ({ id: m.id, nombre: m.nombre }))
          : [];
        setMaterias(mapped);
      })
      .catch(err => {
        console.error('Error loading materias:', err);
        setMaterias([]);
      });
  }, []);
  const isEdit = !!sesion;
  const [formData, setFormData] = useState({
    materiaId: '',
    tema: '',
    tipo: 'virtual',
    link: '',
    ubicacion: '',
    fechaHora: new Date(),
    duracion: 60,
    cupos: '',
    descripcion: '',
    necesidadAprobacion: false
  });

  useEffect(() => {
    if (sesion) {
      setFormData({
        materiaId: sesion.materiaId,
        tema: sesion.tema,
        tipo: sesion.tipo,
        link: sesion.link || '',
        ubicacion: sesion.ubicacion || '',
        fechaHora: new Date(sesion.fechaHora),
        duracion: sesion.duracion,
        cupos: sesion.cupos || '',
        descripcion: sesion.descripcion || '',
        necesidadAprobacion: sesion.necesidadAprobacion
      });
    } else {
      setFormData({
        materiaId: '',
        tema: '',
        tipo: 'virtual',
        link: '',
        ubicacion: '',
        fechaHora: new Date(),
        duracion: 60,
        cupos: '',
        descripcion: '',
        necesidadAprobacion: false
      });
    }
  }, [sesion, open]);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, fechaHora: date }));
  };

  const handleCheckboxChange = (event) => {
    setFormData(prev => ({
      ...prev,
      necesidadAprobacion: event.target.checked
    }));
  };

  const handleSave = () => {
    const data = {
      ...formData,
      materiaId: parseInt(formData.materiaId),
      duracion: parseInt(formData.duracion),
      cupos: formData.cupos ? parseInt(formData.cupos) : null
    };
    onSave(data);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEdit ? 'Editar Sesión' : 'Nueva Sesión de Estudio'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth required ref={materiaFormRef}>
              <InputLabel>Materia</InputLabel>
              <Select
                value={formData.materiaId}
                onChange={handleChange('materiaId')}
                label="Materia"
                MenuProps={{
                  PaperProps: { style: { maxHeight: 280, width: materiaMenuWidth || undefined } }
                }}
              >
                {materias.map(m => (
                  <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Tema"
              value={formData.tema}
              onChange={handleChange('tema')}
              required
            />

            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={formData.tipo}
                onChange={handleChange('tipo')}
                label="Tipo"
              >
                <MenuItem value="virtual">Virtual</MenuItem>
                <MenuItem value="presencial">Presencial</MenuItem>
              </Select>
            </FormControl>

            {formData.tipo === 'virtual' ? (
              <TextField
                fullWidth
                label="Link de videollamada"
                value={formData.link}
                onChange={handleChange('link')}
                required
                placeholder="https://meet.google.com/..."
              />
            ) : (
              <TextField
                fullWidth
                label="Ubicación"
                value={formData.ubicacion}
                onChange={handleChange('ubicacion')}
                required
                placeholder="Aula 305, Biblioteca, etc."
              />
            )}

            <DateTimePicker
              label="Fecha y Hora"
              value={formData.fechaHora}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} fullWidth required />}
            />

            <TextField
              fullWidth
              label="Duración (minutos)"
              type="number"
              value={formData.duracion}
              onChange={handleChange('duracion')}
              required
            />

            <TextField
              fullWidth
              label="Cupos (opcional)"
              type="number"
              value={formData.cupos}
              onChange={handleChange('cupos')}
              helperText="Dejar vacío para cupos ilimitados"
            />

            <TextField
              fullWidth
              label="Descripción"
              value={formData.descripcion}
              onChange={handleChange('descripcion')}
              multiline
              rows={3}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.necesidadAprobacion}
                  onChange={handleCheckboxChange}
                />
              }
              label="Requiere aprobación para participar"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {isEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default SesionModal;
