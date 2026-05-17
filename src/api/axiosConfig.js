import axios from 'axios';

const ERROR_STORAGE_KEY = 'app_unexpected_error';

const guardarErrorInesperado = (error) => {
  const payload = {
    type: 'api_error',
    message: error?.response?.data?.message || error?.message || 'Error inesperado de red',
    status: error?.response?.status,
    endpoint: error?.config?.url,
    timestamp: new Date().toISOString(),
  };

  try {
    sessionStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(payload));
  } catch (storageError) {
    console.error('No se pudo guardar el error inesperado en sessionStorage', storageError);
  }
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    const esErrorInesperado = !error.response || error.response.status >= 500;
    if (esErrorInesperado) {
      guardarErrorInesperado(error);
      if (window.location.pathname !== '/error') {
        window.location.href = '/error';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
