import axios from 'axios';

const ERROR_STORAGE_KEY = 'app_unexpected_error';

const buildErrorPayload = (error) => {
  const status = error?.response?.status;
  const isNetworkError = !error.response;
  const isServerError = status >= 500;
  const isNotFound = status === 404;
  const isForbidden = status === 403;
  const isRateLimited = status === 429;

  let kind = 'unexpected';
  if (isNetworkError) {
    kind = 'network';
  } else if (isServerError) {
    kind = 'server';
  } else if (isNotFound) {
    kind = 'not_found';
  } else if (isForbidden) {
    kind = 'forbidden';
  } else if (isRateLimited) {
    kind = 'rate_limited';
  }

  return {
    type: 'api_error',
    kind,
    message:
      error?.response?.data?.message ||
      error?.message ||
      'Error inesperado de red',
    status,
    endpoint: error?.config?.url,
    timestamp: new Date().toISOString(),
  };
};

const guardarErrorInesperado = (error) => {
  const payload = buildErrorPayload(error);

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

    const esErrorQueDebeSeguirEnLaVista =
      error.response?.status === 400 ||
      error.response?.status === 409 ||
      error.response?.status === 422;

    if (esErrorQueDebeSeguirEnLaVista) {
      return Promise.reject(error);
    }

    const esErrorInesperado =
      !error.response ||
      error.response.status >= 500 ||
      error.response.status === 403 ||
      error.response.status === 404 ||
      error.response.status === 429;

    if (esErrorInesperado) {
      guardarErrorInesperado(error);
      if (window.location.pathname !== '/error') {
        window.location.replace('/error');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
