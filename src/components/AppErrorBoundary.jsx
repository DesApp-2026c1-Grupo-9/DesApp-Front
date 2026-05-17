import React from 'react';

const ERROR_STORAGE_KEY = 'app_unexpected_error';

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

    if (window.location.pathname !== '/error') {
      window.location.assign('/error');
    }
  }

  render() {
    if (this.state.hasError && window.location.pathname !== '/error') {
      return null;
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
