import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Alert, Button, Card, Chip, Spinner } from '@heroui/react';
import { getMyTickets } from '../../services/supportService';

const statusColor = {
  open: 'accent',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'default',
};

const SupportTickets = () => {
  const userInfo = useSelector((state) => state.auth.userInfo);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getMyTickets();
        setTickets(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load support tickets.');
      } finally {
        setLoading(false);
      }
    };

    if (userInfo?.role === 'customer') {
      fetchTickets();
    }
  }, [userInfo]);

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  if (userInfo.role !== 'customer') {
    return <Navigate to="/" replace />;
  }

  return (
    <Card className="border border-[#2A2E3E] bg-[#14161C]">
      <Card.Header className="border-b border-[#2A2E3E] px-5 py-5 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Card.Title className="font-syne text-2xl font-bold text-[#E8EAF0]">Support Tickets</Card.Title>
            <Card.Description className="text-[#8B91A8]">Track and manage your support conversations.</Card.Description>
          </div>
          <Link to="/support/new">
            <Button className="border border-[#6366F1]/40 bg-[#6366F1]/15 text-[#C9CEFF] hover:bg-[#6366F1]/25" variant="ghost">
              New Ticket
            </Button>
          </Link>
        </div>
      </Card.Header>
      <Card.Content className="space-y-4 p-5 md:p-8">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
          </div>
        )}

        {error && (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content><Alert.Description>{error}</Alert.Description></Alert.Content>
          </Alert>
        )}

        {!loading && !error && tickets.length === 0 && (
          <div className="rounded-xl border border-[#2A2E3E] bg-[#1C1F29] p-5 text-sm text-[#8B91A8]">
            No tickets found. Create your first support ticket.
          </div>
        )}

        {!loading && !error && tickets.length > 0 && (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <Link
                key={ticket._id}
                to={`/support/tickets/${ticket._id}`}
                className="block rounded-xl border border-[#2A2E3E] bg-[#1C1F29] p-4 transition hover:border-[#6366F1]/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-[#E8EAF0]">{ticket.subject}</p>
                  <Chip size="sm" color={statusColor[ticket.status] || 'accent'} variant="soft">
                    {ticket.status.replace('_', ' ')}
                  </Chip>
                </div>
                <p className="mt-2 text-sm text-[#8B91A8]">{ticket.message}</p>
                <p className="mt-3 text-xs text-[#6B728A]">
                  {new Date(ticket.createdAt).toLocaleString()} - {ticket.category}
                </p>
              </Link>
            ))}
          </div>
        )}
      </Card.Content>
    </Card>
  );
};

export default SupportTickets;
