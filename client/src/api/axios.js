import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('soundwave_auth');

  if (authData) {
    const parsedAuthData = JSON.parse(authData);

    if (parsedAuthData?.state?.accessToken) {
      config.headers.Authorization = `Bearer ${parsedAuthData.state.accessToken}`;
    }
  }

  return config;
});

export default api;