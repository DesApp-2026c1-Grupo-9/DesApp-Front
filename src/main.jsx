import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@mui/material';

import theme from './theme/theme';

import AppRouter from './routes/AppRouter';
import './index.css'
import { Provider } from 'react-redux';
import { store } from './store/store';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <AppRouter />
    </ThemeProvider>
  </Provider>
)
