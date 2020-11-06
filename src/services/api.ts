import axios from 'axios';

const api = axios.create({
  baseURL: process.env.LOGGI_URL_TRACKING,
  headers: {
    Authorization: `ApiKey ${process.env.LOGGI_API_EMAIL}:${process.env.LOGGI_API_TOKEN}`,
  },
});

export default api;
