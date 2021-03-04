import axios from 'axios';

const api = axios.create({
  baseURL: 'https://gobarberapi.akynatan.dev',
});

export default api;
