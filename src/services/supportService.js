import api from './api';

export const createTicket = async (data) => {
  const response = await api.post('/support/tickets', data);
  return response.data;
};

export const getMyTickets = async () => {
  const response = await api.get('/support/my-tickets');
  return response.data;
};

export const getAllTickets = async () => {
  const response = await api.get('/support/tickets');
  return response.data;
};

export const getTicketById = async (id) => {
  const response = await api.get(`/support/tickets/${id}`);
  return response.data;
};

export const updateTicketStatus = async (id, status) => {
  const response = await api.put(`/support/tickets/${id}/status`, { status });
  return response.data;
};

export const addTicketReply = async (id, message) => {
  const response = await api.post(`/support/tickets/${id}/replies`, { message });
  return response.data;
};
