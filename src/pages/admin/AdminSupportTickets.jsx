import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Button, Chip } from '@heroui/react';
import AdminTable from '../../components/admin/AdminTable';
import { addTicketReply, getAllTickets, updateTicketStatus } from '../../services/supportService';

const statusOptions = ['open', 'in_progress', 'resolved', 'closed'];

const statusColor = {
  open: 'accent',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'default',
};

const AdminSupportTickets = () => {
  const userInfo = useSelector((state) => state.auth.userInfo);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState('');
  const [replyDrafts, setReplyDrafts] = useState({});

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllTickets();
      setTickets(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load support tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    if (statusFilter === 'all') return tickets;
    return tickets.filter((ticket) => ticket.status === statusFilter);
  }, [tickets, statusFilter]);

  const handleStatusUpdate = async (ticketId, status) => {
    try {
      setActionLoading(`status-${ticketId}`);
      setError('');
      setSuccess('');
      await updateTicketStatus(ticketId, status);
      setSuccess('Ticket status updated.');
      await fetchTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoading('');
    }
  };

  const handleReply = async (ticketId) => {
    const message = String(replyDrafts[ticketId] || '').trim();
    if (!message) {
      setError('Reply message is required.');
      return;
    }

    try {
      setActionLoading(`reply-${ticketId}`);
      setError('');
      setSuccess('');
      await addTicketReply(ticketId, message);
      setReplyDrafts((prev) => ({ ...prev, [ticketId]: '' }));
      setSuccess('Reply sent successfully.');
      await fetchTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reply.');
    } finally {
      setActionLoading('');
    }
  };

  const columns = [
    {
      key: '_id',
      label: 'Ticket',
      render: (row) => <span className="admin-id-chip">#{String(row._id || '').slice(0, 8)}...</span>,
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (row) => (
        <div>
          <p className="font-medium text-[var(--text)]">{row.subject}</p>
          <p className="text-xs text-[var(--text2)]">{row.category}</p>
        </div>
      ),
    },
    {
      key: 'user',
      label: 'Customer',
      render: (row) => row.user?.name || row.user?.email || 'Unknown',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Chip size="sm" color={statusColor[row.status] || 'accent'} variant="soft">
          {row.status.replace('_', ' ')}
        </Chip>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (row) => row.priority,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="space-y-2">
          <select
            value={row.status}
            onChange={(event) => handleStatusUpdate(row._id, event.target.value)}
            disabled={actionLoading === `status-${row._id}`}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--bg3)] px-2 py-1 text-xs text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option.replace('_', ' ')}
              </option>
            ))}
          </select>

          <div className="flex gap-1.5">
            <input
              value={replyDrafts[row._id] || ''}
              onChange={(event) =>
                setReplyDrafts((prev) => ({
                  ...prev,
                  [row._id]: event.target.value,
                }))
              }
              placeholder="Reply..."
              className="flex-1 rounded-md border border-[var(--border)] bg-[var(--bg3)] px-2 py-1 text-xs text-[var(--text)] placeholder:text-[var(--text3)] focus:border-[var(--accent)] focus:outline-none"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleReply(row._id)}
              isLoading={actionLoading === `reply-${row._id}`}
              isDisabled={actionLoading === `reply-${row._id}`}
              className="border border-[var(--accent)]/40 bg-[var(--accent)]/20 px-2 text-xs text-[var(--accent2)] hover:bg-[var(--accent)]/30"
            >
              Send
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-4">
      <div className="admin-panel p-5">
        <h2 className="text-lg font-bold text-[var(--text)]">Support Tickets</h2>
        <p className="text-sm text-[var(--text2)]">
          {userInfo?.role === 'support'
            ? 'Respond to customer tickets and keep issues moving.'
            : 'Monitor and manage all customer support conversations.'}
        </p>
      </div>

      <div className="admin-panel flex items-center gap-2 p-4">
        <label htmlFor="statusFilter" className="text-sm text-[var(--text2)]">Filter:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-md border border-[var(--border)] bg-[var(--bg3)] px-3 py-1.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
        >
          <option value="all">All</option>
          {statusOptions.map((item) => (
            <option key={item} value={item}>{item.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {loading && <div className="admin-panel p-5 text-sm text-[var(--text2)]">Loading tickets...</div>}

      {error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content><Alert.Description>{error}</Alert.Description></Alert.Content>
        </Alert>
      )}

      {success && (
        <Alert status="success">
          <Alert.Indicator />
          <Alert.Content><Alert.Description>{success}</Alert.Description></Alert.Content>
        </Alert>
      )}

      {!loading && !error && (
        <AdminTable columns={columns} data={filteredTickets} emptyText="No support tickets found" />
      )}
    </section>
  );
};

export default AdminSupportTickets;
