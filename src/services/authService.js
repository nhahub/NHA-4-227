import api from './api';

export const register = async (userData) => {
  const { data } = await api.post('/users/register', userData);
  return data;
};

export const login = async (credentials) => {
  const { data } = await api.post('/users/login', credentials);
  return data;
};

export const getProfile = async () => {
  const { data } = await api.get('/users/profile');
  return data;
};

export const updateProfile = async (formData) => {
  const { data } = await api.put('/users/profile/edit', formData);
  return data;
};

export const adminCreateUser = async (formData) => {
  const { data } = await api.post('/users/admin/create', formData);
  return data;
};
