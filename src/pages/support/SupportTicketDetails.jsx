import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Alert, Button, Card, Chip, Spinner } from '@heroui/react';
import { addTicketReply, getTicketById } from '../../services/supportService';

const statusColor = {
  open: 'accent',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'default',
};

const SupportTicketDetails = () => {
  const { id } = useParams();
  const userInfo = useSelector((state) => state.auth.userInfo);

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState('');

  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getTicketById(id);
      setTicket(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ticket.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (userInfo?.role === 'customer') {
      fetchTicket();
    }
  }, [fetchTicket, userInfo]);

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  if (userInfo.role !== 'customer') {
    return <Navigate to="/" replace />;
  }

  const handleReply = async (event) => {
    event.preventDefault();
    try {
      setReplyLoading(true);
      setReplyError('');
      await addTicketReply(id, reply.trim());
      setReply('');
      await fetchTicket();
    } catch (err) {
      setReplyError(err.response?.data?.message || 'Failed to add reply.');
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/support" className="text-sm text-[#8B91A8] hover:text-[#E8EAF0]">
          ← Back to tickets
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content><Alert.Description>{error}</Alert.Description></Alert.Content>
        </Alert>
      )}

      {!loading && !error && ticket && (
        <>
          <Card className="border border-[#2A2E3E] bg-[#14161C]">
            <Card.Content className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="font-syne text-xl font-bold text-[#E8EAF0]">{ticket.subject}</h1>
                <Chip size="sm" color={statusColor[ticket.status] || 'accent'} variant="soft">
                  {ticket.status.replace('_', ' ')}
                </Chip>
              </div>
              <p className="mt-2 text-sm text-[#C4C9DB]">{ticket.message}</p>
              <p className="mt-3 text-xs text-[#8B91A8]">
                {ticket.category} - priority: {ticket.priority} - {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </Card.Content>
          </Card>

          <section className="space-y-3">
            <h2 className="font-syne text-lg font-bold text-[#E8EAF0]">Conversation</h2>
            <div className="space-y-2">
              <Card className="border border-[#2A2E3E] bg-[#1C1F29]">
                <Card.Content className="p-3">
                  <p className="text-xs text-[#8B91A8]">Original message</p>
                  <p className="mt-1 text-sm text-[#E8EAF0]">{ticket.message}</p>
                </Card.Content>
              </Card>
              {(ticket.replies || []).map((item) => (
                <Card key={item._id} className="border border-[#2A2E3E] bg-[#1C1F29]">
                  <Card.Content className="p-3">
                    <p className="text-xs text-[#8B91A8]">
                      {item.user?.name || item.user?.email || 'User'} - {new Date(item.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-[#E8EAF0]">{item.message}</p>
                  </Card.Content>
                </Card>
              ))}
            </div>
          </section>

          <Card className="border border-[#2A2E3E] bg-[#14161C]">
            <Card.Content className="p-4">
              <form onSubmit={handleReply} className="space-y-3">
                <label htmlFor="reply" className="text-sm text-[#8B91A8]">Add reply</label>
                <textarea
                  id="reply"
                  rows={4}
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  required
                  className="w-full rounded-lg border border-[#2A2E3E] bg-[#1C1F29] px-3 py-2 text-sm text-[#E8EAF0] focus:border-[#6366F1] focus:outline-none"
                />
                {replyError && (
                  <Alert status="danger">
                    <Alert.Indicator />
                    <Alert.Content><Alert.Description>{replyError}</Alert.Description></Alert.Content>
                  </Alert>
                )}
                <Button
                  type="submit"
                  isLoading={replyLoading}
                  isDisabled={replyLoading}
                  className="bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  Send Reply
                </Button>
              </form>
            </Card.Content>
          </Card>
        </>
      )}
    </section>
  );
};

export default SupportTicketDetails;
