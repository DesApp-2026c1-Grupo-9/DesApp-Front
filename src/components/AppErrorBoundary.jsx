import React from 'react';

const ERROR_STORAGE_KEY = 'app_unexpected_error';
const GENERAL_ERROR_EVENT = 'app-general-error';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const payload = {
      type: 'render_error',
      message: error?.message || 'Error inesperado al renderizar la interfaz',
      stack: errorInfo?.componentStack || '',
      timestamp: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(payload));
    } catch (storageError) {
      console.error('No se pudo guardar el error de UI en sessionStorage', storageError);
    }

    try {
      window.dispatchEvent(new CustomEvent(GENERAL_ERROR_EVENT, { detail: payload }));
    } catch (eventError) {
      console.error('No se pudo emitir el evento de error general', eventError);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return null;
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
