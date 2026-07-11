import api from './api';

export const getCategories = async (params = {}) => {
  const { data } = await api.get('/categories', { params });
  return data;
};

export const createCategory = async (categoryData) => {
  const { data } = await api.post('/categories', categoryData);
  return data;
};

export const updateCategory = async (id, categoryData) => {
  const { data } = await api.put(`/categories/${id}`, categoryData);
  return data;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
};

