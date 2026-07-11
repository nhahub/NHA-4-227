import api from './api';

export const getAdminUsers = async () => {
  const { data } = await api.get('/users');
  return data;
};

export const getAdminOrders = async () => {
  const { data } = await api.get('/orders');
  return data;
};

export const getAdminProducts = async () => {
  const { data } = await api.get('/products');
  return data;
};

export const getAdminAnalytics = async () => {
  const { data } = await api.get('/admin/analytics');
  return data;
};

export const getAdminSettings = async () => {
  const { data } = await api.get('/admin/settings');
  return data;
};

export const createAdminUser = async (userData) => {
  const { data } = await api.post('/users/admin/create', userData);
  return data;
};

export const markOrderAsPaid = async (id) => {
  const { data } = await api.put(`/orders/${id}/pay`);
  return data;
};

export const markOrderAsDelivered = async (id) => {
  const { data } = await api.put(`/orders/${id}/deliver`);
  return data;
};

export const cancelOrder = async (id) => {
  const { data } = await api.put(`/orders/${id}/cancel`);
  return data;
};

export const createAdminProduct = async (productData) => {
  const { data } = await api.post('/products', productData);
  return data;
};

export const updateAdminProduct = async (id, productData) => {
  const { data } = await api.put(`/products/${id}`, productData);
  return data;
};

export const deleteAdminProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};

export const getPendingProducts = async (statusFilter = 'pending') => {
  const { data } = await api.get(`/products?status=${statusFilter}`);
  return data;
};

export const updateAdminProductStatus = async (id, { status, rejectionReason = '' }) => {
  const { data } = await api.put(`/products/${id}/status`, { status, rejectionReason });
  return data;
};
