import { useState } from 'react';

import { Paper, Avatar, TextField, Button, Box, Typography } from '@mui/material';

function CreatePostForm({ onSubmit, loading, currentStudent }) {
  const [contenido, setContenido] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contenido.trim()) return;
    onSubmit({ tipo: 'posteo', titulo: contenido.substring(0, 50), contenido: contenido.trim() });
    setContenido('');
  };

  return (
    <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar src={currentStudent?.avatar} sx={{ width: 40, height: 40 }}>
          {currentStudent?.nombre?.charAt(0)}
        </Avatar>
        <Typography variant="subtitle1" fontWeight="500">
          ¿Qué estás pensando, {currentStudent?.nombre}?
        </Typography>
      </Box>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Comparte algo con tus compañeros..."
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !contenido.trim()}
            sx={{ px: 4 }}
          >
            Publicar
          </Button>
        </Box>
      </form>
    </Paper>
  );
}

export default CreatePostForm;