import api from './api';

export const getSavedCard = async () => {
  const { data } = await api.get('/users/wallet');
  return data; // null if no card saved
};

export const saveCard = async ({ last4, cardBrand, cardName, expiry }) => {
  const { data } = await api.put('/users/wallet', { last4, cardBrand, cardName, expiry });
  return data;
};

export const deleteCard = async () => {
  const { data } = await api.delete('/users/wallet');
  return data;
};
