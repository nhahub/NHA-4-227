import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Spinner } from '@heroui/react';
import { getSellerOrders, updateFulfillmentStatus } from '../../services/sellerService';
import { formatCurrency } from '../../utils/format';
import { resolveImageUrl } from '../../utils/image';

const FULFILL_STEP = {
  pending:       0,
  preparing:     1,
  ready_to_ship: 2,
  shipped:       3,
};

const FULFILL_LABEL = {
  pending:       'Order Placed',
  preparing:     'Being Prepared',
  ready_to_ship: 'Out for Delivery',
  shipped:       'Delivered',
};

const FULFILL_COLOR = {
  pending:       'text-amber-400',
  preparing:     'text-indigo-400',
  ready_to_ship: 'text-sky-400',
  shipped:       'text-emerald-400',
};

const FULFILL_BG = {
  pending:       'bg-amber-500/15 border-amber-500/30',
  preparing:     'bg-indigo-500/15 border-indigo-500/30',
  ready_to_ship: 'bg-sky-500/15 border-sky-500/30',
  shipped:       'bg-emerald-500/15 border-emerald-500/30',
};

const SellerOrders = () => {
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [expandedId, setExpandedId] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getSellerOrders();
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const advanceFulfillment = async (orderId, currentStatus) => {
    const next = {
      pending:       'preparing',
      preparing:     'ready_to_ship',
      ready_to_ship: 'shipped',
    }[currentStatus];
    if (!next) return;
    try {
      setUpdatingId(orderId);
      setError('');
      await updateFulfillmentStatus(orderId, next);
      setOrders((prev) =>
        prev.map((o) => o._id === orderId ? { ...o, fulfillmentStatus: next } : o)
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingId('');
    }
  };

  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.orderItems || []).reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 0), 0),
    0
  );

  return (
    <section className="space-y-5">
      <Card className="border border-[#2A2E3E] bg-[#14161C]">
        <Card.Content className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <h1 className="font-syne text-2xl font-bold text-[#E8EAF0]">Orders</h1>
            <p className="mt-1 text-sm text-[#8B91A8]">Orders containing your products.</p>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="font-syne text-xl font-bold text-indigo-400">{orders.length}</p>
              <p className="text-xs text-[#555D78]">Total Orders</p>
            </div>
            <div className="border-l border-[#2A2E3E] pl-4">
              <p className="font-syne text-xl font-bold text-emerald-400">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-[#555D78]">Revenue</p>
            </div>
          </div>
        </Card.Content>
      </Card>

      {error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content><Alert.Description>{error}</Alert.Description></Alert.Content>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-14">
          <Spinner size="lg" />
        </div>
      ) : (
        <Card className="border border-[#2A2E3E] bg-[#14161C]">
          <Card.Content className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-[#2A2E3E] bg-[#1C1F29] text-left text-xs uppercase tracking-wide text-[#8B91A8]">
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">My Revenue</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td className="px-4 py-10 text-center text-sm text-[#8B91A8]" colSpan={7}>
                        No orders yet. Orders will appear here when customers purchase your products.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const myItems      = order.orderItems || [];
                      const myTotal      = myItems.reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 0), 0);
                      const isExpanded   = expandedId === order._id;
                      const fulfil       = order.fulfillmentStatus || 'pending';
                      const step         = FULFILL_STEP[fulfil] ?? 0;
                      const isDelivered  = fulfil === 'shipped' || order.isDelivered;

                      const nextAction = {
                        pending:       { label: 'Confirm & Prepare', color: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/25' },
                        preparing:     { label: 'Hand to Shipping',  color: 'bg-sky-500/15 border-sky-500/40 text-sky-300 hover:bg-sky-500/25' },
                        ready_to_ship: { label: 'Mark Delivered',    color: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25' },
                      }[fulfil];

                      return (
                        <React.Fragment key={order._id}>
                          <tr
                            className="border-b border-[#2A2E3E] text-sm text-[#C4C9DB] hover:bg-[#1C1F29] cursor-pointer"
                            onClick={() => setExpandedId(isExpanded ? '' : order._id)}
                          >
                            <td className="px-4 py-3 font-mono text-xs font-semibold text-[#E8EAF0]">
                              #{String(order._id).slice(-8).toUpperCase()}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-[#E8EAF0]">{order.user?.name || 'Customer'}</p>
                              <p className="text-[11px] text-[#555D78]">{order.user?.email}</p>
                            </td>
                            <td className="px-4 py-3 text-[#8B91A8]">
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'short', day: 'numeric',
                              })}
                            </td>
                            <td className="px-4 py-3">{myItems.length} item{myItems.length !== 1 ? 's' : ''}</td>
                            <td className="px-4 py-3 font-semibold text-indigo-400">{formatCurrency(myTotal)}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${FULFILL_BG[fulfil]} ${FULFILL_COLOR[fulfil]}`}>
                                {FULFILL_LABEL[fulfil] || fulfil}
                              </span>
                            </td>
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                              {!isDelivered && nextAction ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  isLoading={updatingId === order._id}
                                  isDisabled={!!updatingId}
                                  onClick={() => advanceFulfillment(order._id, fulfil)}
                                  className={`border text-xs font-medium ${nextAction.color}`}
                                >
                                  {nextAction.label}
                                </Button>
                              ) : (
                                <span className="text-[11px] text-emerald-400">Delivered</span>
                              )}
                            </td>
                          </tr>

                          {/* Expanded detail row */}
                          {isExpanded && (
                            <tr key={`${order._id}-expanded`} className="bg-[#0D0F14]">
                              <td colSpan={7} className="px-6 py-5">
                                <div className="grid gap-6 md:grid-cols-2">
                                  {/* Items */}
                                  <div>
                                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#555D78]">
                                      Your Items
                                    </p>
                                    <div className="space-y-2">
                                      {myItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 rounded-xl border border-[#2A2E3E] bg-[#14161C] p-3">
                                          <img
                                            src={resolveImageUrl(item.image)}
                                            alt={item.name}
                                            className="h-10 w-10 rounded-md object-cover bg-[#1C1F29]"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                          />
                                          <div className="flex-1">
                                            <p className="text-sm font-medium text-[#E8EAF0]">{item.name}</p>
                                            <p className="text-xs text-[#555D78]">{formatCurrency(item.price)} × {item.quantity}</p>
                                          </div>
                                          <p className="font-semibold text-indigo-400">
                                            {formatCurrency(Number(item.price) * Number(item.quantity))}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Delivery + Payment */}
                                  <div className="space-y-4">
                                    <div>
                                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#555D78]">
                                        Delivery Address
                                      </p>
                                      <div className="rounded-xl border border-[#2A2E3E] bg-[#14161C] p-3 text-sm text-[#C4C9DB] space-y-0.5">
                                        <p className="font-medium text-[#E8EAF0]">{order.shippingAddress?.fullName}</p>
                                        <p>{order.shippingAddress?.address}</p>
                                        <p>{order.shippingAddress?.city}, {order.shippingAddress?.country}</p>
                                        <p className="text-[#8B91A8]">Phone: {order.shippingAddress?.phone}</p>
                                      </div>
                                    </div>

                                    <div>
                                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#555D78]">
                                        Payment Method
                                      </p>
                                      <div className="rounded-xl border border-[#2A2E3E] bg-[#14161C] p-3 text-sm">
                                        <p className={`font-medium ${order.paymentMethod === 'Credit Card' ? 'text-sky-300' : 'text-emerald-300'}`}>
                                          {order.paymentMethod === 'Credit Card' ? '💳 Credit Card' : '💵 Cash on Delivery'}
                                        </p>
                                        {order.paymentMethod === 'Credit Card' && (
                                          <p className="mt-1 text-xs text-[#8B91A8]">
                                            Customer paid by card. Check your Payment Settings to ensure your bank/card details are up to date for receiving transfers.
                                          </p>
                                        )}
                                        {order.paymentMethod !== 'Credit Card' && (
                                          <p className="mt-1 text-xs text-[#8B91A8]">
                                            Collect cash from the customer upon delivery.
                                          </p>
                                        )}
                                        <p className="mt-1.5 text-[11px]">
                                          <span className="text-[#555D78]">Paid: </span>
                                          <span className={order.isPaid ? 'text-emerald-400' : 'text-amber-400'}>
                                            {order.isPaid ? 'Yes' : 'Not yet'}
                                          </span>
                                        </p>
                                      </div>
                                    </div>

                                    {/* 4-step timeline */}
                                    <div>
                                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#555D78]">
                                        Order Progress
                                      </p>
                                      <OrderTimeline step={step} />
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>
      )}
    </section>
  );
};

const TIMELINE_STEPS = [
  { label: 'Order Placed',    icon: '📦' },
  { label: 'Being Prepared',  icon: '🔧' },
  { label: 'Out for Delivery',icon: '🚚' },
  { label: 'Delivered',       icon: '✅' },
];

const OrderTimeline = ({ step }) => (
  <div className="flex items-start gap-0">
    {TIMELINE_STEPS.map((s, i) => {
      const done    = i <= step;
      const current = i === step;
      return (
        <div key={i} className="flex flex-1 flex-col items-center">
          <div className="flex w-full items-center">
            {/* Line before */}
            {i > 0 && (
              <div className={`h-0.5 flex-1 transition-colors ${done ? 'bg-indigo-500' : 'bg-[#2A2E3E]'}`} />
            )}
            {/* Circle */}
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs transition-all ${
              done
                ? current
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 ring-2 ring-indigo-500/30'
                  : 'border-indigo-500 bg-indigo-500 text-white'
                : 'border-[#2A2E3E] bg-[#1C1F29] text-[#555D78]'
            }`}>
              {s.icon}
            </div>
            {/* Line after */}
            {i < TIMELINE_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 transition-colors ${i < step ? 'bg-indigo-500' : 'bg-[#2A2E3E]'}`} />
            )}
          </div>
          <p className={`mt-1.5 text-center text-[10px] font-medium leading-tight ${done ? 'text-indigo-300' : 'text-[#555D78]'}`}>
            {s.label}
          </p>
        </div>
      );
    })}
  </div>
);

export default SellerOrders;
