const API_KEY = '36c08297b5565b5604ed8646cb0c1393';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNmMwODI5N2I1NTY1YjU2MDRlZDg2NDZjYjBjMTM5MyIsIm5iZiI6MTcxNzM3MjM0Ny44NDcwMDAxLCJzdWIiOiI2NjVkMDViYmZkOTMxM2QwZDNhMGFjZDciLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.X8jcKcjIT1svPP5EeO0CtF3Ct11pZwrXaJ0DLAz5pDQ';

export const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
export const POSTER_SIZE = 'w500';
export const BACKDROP_SIZE = 'w1280';

export const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${ACCESS_TOKEN}`
  }
};

export { API_KEY };