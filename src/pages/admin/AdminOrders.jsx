import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Chip } from '@heroui/react';
import AdminTable from '../../components/admin/AdminTable';
import {
  cancelOrder,
  getAdminOrders,
  markOrderAsDelivered,
  markOrderAsPaid,
} from '../../services/adminService';
import { formatCurrency } from '../../utils/format';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminOrders();
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getCustomerName = (order) => order.user?.name || order.user?.email || 'Guest';

  const getPaymentChip = (order) => {
    if (order.isPaid) return { label: 'Paid', color: 'success' };
    return { label: 'Unpaid', color: 'warning' };
  };

  const getDeliveryChip = (order) => {
    if (order.status === 'cancelled') return { label: 'Cancelled', color: 'danger' };
    if (order.isDelivered || order.status === 'delivered') return { label: 'Delivered', color: 'success' };
    if (order.status === 'processing') return { label: 'Processing', color: 'accent' };
    return { label: 'Pending', color: 'default' };
  };

  const runOrderAction = async (orderId, actionType) => {
    const actionKey = `${orderId}-${actionType}`;
    setActionLoading(actionKey);
    setError('');
    setSuccess('');

    try {
      if (actionType === 'pay') {
        await markOrderAsPaid(orderId);
        setSuccess('Order marked as paid.');
      }

      if (actionType === 'deliver') {
        await markOrderAsDelivered(orderId);
        setSuccess('Order marked as delivered.');
      }

      if (actionType === 'cancel') {
        await cancelOrder(orderId);
        setSuccess('Order cancelled successfully.');
      }

      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setActionLoading('');
    }
  };

  const ActionButtons = ({ row }) => {
    const orderId = row._id;
    const isCancelled = row.status === 'cancelled';
    const payDisabled = row.isPaid || isCancelled;
    const deliverDisabled = row.isDelivered || isCancelled;
    const cancelDisabled = isCancelled;

    return (
      <div className="flex flex-wrap gap-2">
        <Link to={`/orders/${orderId}`}>
          <Button size="sm" variant="ghost" className="border border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-300 hover:bg-indigo-500/20">
            View Details
          </Button>
        </Link>

        <Button
          size="sm"
          variant="ghost"
          isDisabled={payDisabled || actionLoading === `${orderId}-pay`}
          isLoading={actionLoading === `${orderId}-pay`}
          onClick={() => runOrderAction(orderId, 'pay')}
          className="border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 hover:bg-emerald-500/20"
        >
          Mark Paid
        </Button>

        <Button
          size="sm"
          variant="ghost"
          isDisabled={deliverDisabled || actionLoading === `${orderId}-deliver`}
          isLoading={actionLoading === `${orderId}-deliver`}
          onClick={() => runOrderAction(orderId, 'deliver')}
          className="border border-blue-500/30 bg-blue-500/10 text-xs text-blue-300 hover:bg-blue-500/20"
        >
          Mark Delivered
        </Button>

        <Button
          size="sm"
          variant="ghost"
          isDisabled={cancelDisabled || actionLoading === `${orderId}-cancel`}
          isLoading={actionLoading === `${orderId}-cancel`}
          onClick={() => runOrderAction(orderId, 'cancel')}
          className="border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 hover:bg-rose-500/20"
        >
          Cancel
        </Button>
      </div>
    );
  };

  const columns = [
    {
      key: '_id',
      label: 'Order ID',
      render: (row) => <span className="admin-id-chip">#{String(row._id || '').slice(0, 8)}...</span>,
    },
    {
      key: 'user',
      label: 'Customer',
      render: (row) => getCustomerName(row),
    },
    {
      key: 'totalPrice',
      label: 'Total',
      render: (row) => <span className="font-semibold">{formatCurrency(row.totalPrice)}</span>,
    },
    { key: 'paymentMethod', label: 'Payment Method' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const payment = getPaymentChip(row);
        const delivery = getDeliveryChip(row);
        return (
          <div className="flex flex-wrap gap-2">
            <Chip size="sm" color={payment.color} variant="soft">{payment.label}</Chip>
            <Chip size="sm" color={delivery.color} variant="soft">{delivery.label}</Chip>
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => <ActionButtons row={row} />,
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (row) => new Date(row.createdAt).toLocaleString(),
    },
  ];

  return (
    <section className="space-y-4">
      <div className="admin-panel p-5">
        <h2 className="text-lg font-bold text-[var(--text)]">Orders</h2>
        <p className="text-sm text-[var(--text2)]">Monitor transactions and update order status.</p>
      </div>

      {loading && <div className="admin-panel p-5 text-sm text-[var(--text2)]">Loading orders...</div>}

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

      {!loading && !error && <AdminTable columns={columns} data={orders} emptyText="No orders found" />}
    </section>
  );
};

export default AdminOrders;
