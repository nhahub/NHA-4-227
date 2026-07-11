import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Alert, Button, Card, Chip, Spinner } from '@heroui/react';
import { getMyOrders } from '../services/orderService';
import { formatCurrency } from '../utils/format';

const TIMELINE_STEPS = [
  { key: 0, label: 'Order Placed',     icon: '📦', desc: 'We received your order' },
  { key: 1, label: 'Being Prepared',   icon: '🔧', desc: 'Seller is preparing it' },
  { key: 2, label: 'Out for Delivery', icon: '🚚', desc: 'On its way to you' },
  { key: 3, label: 'Delivered',        icon: '✅', desc: 'Enjoy your purchase!' },
];

const fulfillStep = (order) => {
  if (order.isDelivered || order.fulfillmentStatus === 'shipped') return 3;
  if (order.fulfillmentStatus === 'ready_to_ship') return 2;
  if (order.fulfillmentStatus === 'preparing') return 1;
  return 0;
};

const OrderTimeline = ({ step }) => (
  <div className="mt-4 flex items-start">
    {TIMELINE_STEPS.map((s, i) => {
      const done    = i <= step;
      const current = i === step;
      return (
        <div key={s.key} className="flex flex-1 flex-col items-center">
          {/* connector + node row */}
          <div className="flex w-full items-center">
            {i > 0 && (
              <div className={`h-0.5 flex-1 transition-colors duration-500 ${done ? 'bg-indigo-500' : 'bg-[#2A2E3E]'}`} />
            )}
            <div className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm transition-all ${
              done
                ? current
                  ? 'border-indigo-400 bg-indigo-500/20 text-base ring-2 ring-indigo-500/25'
                  : 'border-indigo-500 bg-indigo-500 text-white'
                : 'border-[#2A2E3E] bg-[#14161C] text-[#555D78]'
            }`}>
              {s.icon}
              {current && (
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-indigo-400 ring-2 ring-[#14161C] animate-pulse" />
              )}
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 transition-colors duration-500 ${i < step ? 'bg-indigo-500' : 'bg-[#2A2E3E]'}`} />
            )}
          </div>
          {/* Label */}
          <div className="mt-2 flex flex-col items-center text-center">
            <p className={`text-[11px] font-semibold leading-tight ${done ? 'text-[#E8EAF0]' : 'text-[#555D78]'}`}>
              {s.label}
            </p>
            {current && (
              <p className="mt-0.5 text-[10px] text-indigo-400">{s.desc}</p>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

const MyOrders = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userInfo) return;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your orders.');
      } finally {
        setLoading(false);
      }
    })();
  }, [userInfo]);

  if (!userInfo) return <Navigate to="/login" replace />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#555D78]">History</p>
        <h1 className="mt-1 font-syne text-3xl font-bold text-[#E8EAF0]">My Orders</h1>
        <p className="mt-1 text-sm text-[#555D78]">Track your recent orders in real time.</p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content><Alert.Description>{error}</Alert.Description></Alert.Content>
        </Alert>
      )}

      {!loading && !error && orders.length === 0 && (
        <Card className="border border-[#2A2E3E] bg-[#14161C]">
          <Card.Content className="px-8 py-16 text-center">
            <div className="mb-4 text-5xl">📦</div>
            <Card.Title className="font-syne text-lg font-bold text-[#E8EAF0]">No orders yet</Card.Title>
            <Card.Description className="mt-2 text-[#555D78]">
              You haven&apos;t placed any orders. Start shopping to see them here.
            </Card.Description>
            <Link to="/products" className="mt-6 inline-block">
              <Button className="bg-indigo-600 text-white hover:bg-indigo-500">
                Start Shopping →
              </Button>
            </Link>
          </Card.Content>
        </Card>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
            const step = fulfillStep(order);
            const isCancelled = order.status === 'cancelled';

            return (
              <Card key={order._id} className="border border-[#2A2E3E] bg-[#14161C]">
                <Card.Content className="p-5">
                  {/* Top row */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-indigo-400 bg-[#1C1F29] px-2 py-1 rounded-md border border-[#2A2E3E]">
                          #{String(order._id || '').slice(-8).toUpperCase()}
                        </span>
                        <Chip
                          size="sm"
                          color={order.isPaid ? 'success' : 'warning'}
                          variant="soft"
                        >
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </Chip>
                        {isCancelled && (
                          <Chip size="sm" color="danger" variant="soft">Cancelled</Chip>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs text-[#555D78]">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                        {' · '}
                        {order.paymentMethod}
                        {' · '}
                        {order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-syne text-xl font-bold text-[#E8EAF0]">
                        {formatCurrency(order.totalPrice || 0)}
                      </span>
                      <Link to={`/orders/${order._id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="border border-[#2A2E3E] text-indigo-400 hover:bg-[#1C1F29]"
                        >
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Timeline */}
                  {!isCancelled ? (
                    <OrderTimeline step={step} />
                  ) : (
                    <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                      This order was cancelled.
                    </div>
                  )}
                </Card.Content>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
