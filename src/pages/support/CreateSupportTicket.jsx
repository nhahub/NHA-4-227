import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Alert, Button, Card } from '@heroui/react';
import { createTicket } from '../../services/supportService';

const inputClass =
  'w-full rounded-lg border border-[#2A2E3E] bg-[#1C1F29] px-3 py-2 text-sm text-[#E8EAF0] focus:border-[#6366F1] focus:outline-none';

const CreateSupportTicket = () => {
  const userInfo = useSelector((state) => state.auth.userInfo);
  const navigate = useNavigate();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('other');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  if (userInfo.role !== 'customer') {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      await createTicket({ subject, message, category, priority });
      navigate('/support');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-[#2A2E3E] bg-[#14161C]">
      <Card.Header className="border-b border-[#2A2E3E] px-5 py-5 md:px-8">
        <Card.Title className="font-syne text-2xl font-bold text-[#E8EAF0]">Create Support Ticket</Card.Title>
        <Card.Description className="text-[#8B91A8]">Describe your issue and our team will help you.</Card.Description>
      </Card.Header>
      <Card.Content className="p-5 md:p-8">
        {error && (
          <div className="mb-4">
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content><Alert.Description>{error}</Alert.Description></Alert.Content>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm text-[#8B91A8]">Subject</span>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              required
              className={inputClass}
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-[#8B91A8]">Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={inputClass}
            >
              <option value="order">Order</option>
              <option value="payment">Payment</option>
              <option value="product">Product</option>
              <option value="account">Account</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm text-[#8B91A8]">Priority</span>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className={inputClass}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm text-[#8B91A8]">Message</span>
            <textarea
              rows={6}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
              className={inputClass}
            />
          </label>

          <div className="md:col-span-2">
            <Button
              type="submit"
              isLoading={loading}
              isDisabled={loading}
              className="bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Submit Ticket
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card>
  );
};

export default CreateSupportTicket;
