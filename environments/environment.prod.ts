const origin = typeof window !== 'undefined' ? window.location.origin : '';

export const environment = {
  production: true,
  apiUrl: '/api',
  apiBase: origin
};
