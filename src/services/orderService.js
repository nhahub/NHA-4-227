import api from './api';

export const createOrder = async (orderData) => {
  const { data } = await api.post('/orders', orderData);
  return data;
};

export const getMyOrders = async () => {
  const { data } = await api.get('/orders/myorders');
  return data;
};

export const getOrderById = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
};

export const payOrderSimulated = async (id) => {
  const { data } = await api.put(`/orders/${id}/pay-simulated`);
  return data;
};
