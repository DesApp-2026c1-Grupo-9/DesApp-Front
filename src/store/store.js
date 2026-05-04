import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/slice';
import perfilReducer from '../features/perfil/slice';
import sesionesReducer from '../features/sesiones/slice';
import feedReducer from '../features/feed/slice';
import conexionesReducer from '../features/conexiones/slice';
import academicoReducer from '../features/academico/slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    perfil: perfilReducer,
    sesiones: sesionesReducer,
    feed: feedReducer,
    conexiones: conexionesReducer,
    academico: academicoReducer,
  },
});
