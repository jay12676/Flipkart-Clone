import axios from 'axios';
import { auth } from '../firebase.js';

const baseURL = import.meta.env.VITE_API_BASE_URL || '';

const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail =
      error?.response?.data?.detail ||
      error?.message ||
      'Something went wrong';
    const normalised = new Error(detail);
    normalised.status = error?.response?.status;
    return Promise.reject(normalised);
  }
);

export default client;
