import api from './api';

export const getMySellerProducts = async () => {
  const { data } = await api.get('/products/seller/my-products');
  return data;
};

export const createSellerProduct = async (productData) => {
  const { data } = await api.post('/products', productData);
  return data;
};

export const updateSellerProduct = async (id, productData) => {
  const { data } = await api.put(`/products/${id}`, productData);
  return data;
};

export const deleteSellerProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};

export const uploadProductImage = async (file) => {
  const formData = new FormData();
  formData.append('productImage', file);
  const { data } = await api.post('/products/upload-image', formData);
  return data;
};

export const getSellerOrders = async () => {
  const { data } = await api.get('/orders/seller/my-orders');
  return data;
};

export const updateFulfillmentStatus = async (orderId, fulfillmentStatus) => {
  const { data } = await api.put(`/orders/${orderId}/fulfillment`, { fulfillmentStatus });
  return data;
};

export const submitProductForReview = async (id, productPayload = {}) => {
  const { data } = await api.put(`/products/${id}`, { ...productPayload, submitForReview: true });
  return data;
};

export const getSellerPaymentInfo = async () => {
  const { data } = await api.get('/users/seller/payment-info');
  return data;
};

export const updateSellerPaymentInfo = async (paymentInfo) => {
  const { data } = await api.put('/users/seller/payment-info', paymentInfo);
  return data;
};
