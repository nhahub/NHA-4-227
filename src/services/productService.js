import api from './api';

export const getProducts = async (params = {}) => {
  const { data } = await api.get('/products', { params });
  return data;
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const getCategories = async () => {
  const { data } = await api.get('/products/categories');
  return data;
};

export const createProductReview = async (productId, reviewData) => {
  const { data } = await api.post(`/products/${productId}/reviews`, reviewData);
  return data;
};

export const uploadProductImage = async (file) => {
  const formData = new FormData();
  formData.append('productImage', file);
  const { data } = await api.post('/products/upload-image', formData);
  return data;
};
