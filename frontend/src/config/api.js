const defaultApiBase = import.meta.env.DEV
  ? 'http://localhost:4000'
  : 'https://backend-webbandienthoai.onrender.com';

export const API_BASE = (import.meta.env.VITE_API_URL || defaultApiBase).replace(/\/$/, '');
