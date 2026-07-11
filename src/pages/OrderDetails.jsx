import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Alert, Button, Card, Chip, Spinner } from '@heroui/react';
import { getOrderById, payOrderSimulated } from '../services/orderService';
import { formatCurrency } from '../utils/format';
import { resolveImageUrl } from '../utils/image';

const OrderDetails = () => {
  const { id } = useParams();
  const { userInfo } = useSelector((state) => state.auth);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState('');

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id, fetchOrder]);

  const itemsTotal = useMemo(() => {
    if (!order?.orderItems) return 0;
    return order.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [order]);

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  const handleSimulatedPayment = async () => {
    if (!order?._id) {
      return;
    }

    try {
      setPayLoading(true);
      setPayError('');
      setPaySuccess('');
      await payOrderSimulated(order._id);
      setPaySuccess('Payment completed successfully.');
      await fetchOrder();
    } catch (err) {
      setPayError(err.response?.data?.message || 'Failed to process payment.');
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content><Alert.Description>{error}</Alert.Description></Alert.Content>
      </Alert>
    );
  }

  if (!order) {
    return null;
  }

  const deliveryColor = order.status === 'cancelled' ? 'danger' : order.isDelivered ? 'accent' : 'default';
  const deliveryLabel = order.status === 'cancelled' ? 'Cancelled' : order.isDelivered ? 'Delivered' : 'Pending';

  // Compute timeline step from fulfillmentStatus
  const fulfillStep = (() => {
    if (order.isDelivered || order.fulfillmentStatus === 'shipped') return 3;
    if (order.fulfillmentStatus === 'ready_to_ship') return 2;
    if (order.fulfillmentStatus === 'preparing') return 1;
    return 0;
  })();

  const TIMELINE_STEPS = [
    { label: 'Order Placed',     icon: '📦' },
    { label: 'Being Prepared',   icon: '🔧' },
    { label: 'Out for Delivery', icon: '🚚' },
    { label: 'Delivered',        icon: '✅' },
  ];

  return (
    <section className="space-y-6">
      <Card className="border border-[#2A2E3E] bg-[#14161C]">
        <Card.Content className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#E8EAF0]">Order Details</h1>
              <p className="mt-1 text-sm text-[#8B91A8]">Order #{String(order._id || '').slice(0, 12)}...</p>
            </div>
            <Link to={userInfo.role === 'admin' ? '/admin/orders' : '/my-orders'}>
              <Button variant="ghost" className="border border-[#2A2E3E] text-[#C4C9DB] hover:bg-[#1C1F29]">
                Back
              </Button>
            </Link>
          </div>
        </Card.Content>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card className="border border-[#2A2E3E] bg-[#14161C]">
            <Card.Header className="border-b border-[#2A2E3E] px-5 py-4">
              <Card.Title className="text-lg font-semibold text-[#E8EAF0]">Order Items</Card.Title>
            </Card.Header>
            <Card.Content className="p-5">
              <div className="space-y-3">
                {order.orderItems?.map((item, index) => (
                  <div
                    key={`${item.product}-${index}`}
                    className="grid gap-3 rounded-xl border border-[#2A2E3E] bg-[#1C1F29] p-3 sm:grid-cols-[64px_1fr_auto]"
                  >
                    <img
                      src={resolveImageUrl(item.image)}
                      alt={item.name}
                      className="h-16 w-16 rounded-lg object-cover ring-1 ring-[#2A2E3E]"
                    />
                    <div>
                      <p className="font-medium text-[#E8EAF0]">{item.name}</p>
                      <p className="text-sm text-[#8B91A8]">Qty: {item.quantity}</p>
                      <p className="text-sm text-[#8B91A8]">Price: {formatCurrency(item.price)}</p>
                    </div>
                    <p className="self-center text-sm font-semibold text-indigo-300">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>

          {/* Order Timeline */}
          {order.status !== 'cancelled' && (
            <Card className="border border-[#2A2E3E] bg-[#14161C]">
              <Card.Header className="border-b border-[#2A2E3E] px-5 py-4">
                <Card.Title className="text-lg font-semibold text-[#E8EAF0]">Order Status</Card.Title>
              </Card.Header>
              <Card.Content className="p-5">
                <div className="flex items-start">
                  {TIMELINE_STEPS.map((s, i) => {
                    const done    = i <= fulfillStep;
                    const current = i === fulfillStep;
                    return (
                      <div key={i} className="flex flex-1 flex-col items-center">
                        <div className="flex w-full items-center">
                          {i > 0 && (
                            <div className={`h-0.5 flex-1 ${done ? 'bg-indigo-500' : 'bg-[#2A2E3E]'}`} />
                          )}
                          <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-base transition-all ${
                            done
                              ? current
                                ? 'border-indigo-400 bg-indigo-500/20 ring-2 ring-indigo-500/25'
                                : 'border-indigo-500 bg-indigo-500 text-white'
                              : 'border-[#2A2E3E] bg-[#14161C] text-[#555D78]'
                          }`}>
                            {s.icon}
                            {current && (
                              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-indigo-400 ring-2 ring-[#14161C] animate-pulse" />
                            )}
                          </div>
                          {i < TIMELINE_STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 ${i < fulfillStep ? 'bg-indigo-500' : 'bg-[#2A2E3E]'}`} />
                          )}
                        </div>
                        <p className={`mt-2 text-center text-[11px] font-medium leading-tight ${done ? 'text-[#E8EAF0]' : 'text-[#555D78]'}`}>
                          {s.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Card.Content>
            </Card>
          )}

          <Card className="border border-[#2A2E3E] bg-[#14161C]">
            <Card.Header className="border-b border-[#2A2E3E] px-5 py-4">
              <Card.Title className="text-lg font-semibold text-[#E8EAF0]">Shipping Address</Card.Title>
            </Card.Header>
            <Card.Content className="p-5">
              <div className="space-y-1 text-sm text-[#C4C9DB]">
                <p>{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.address}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.country}</p>
                <p>{order.shippingAddress?.phone}</p>
              </div>
            </Card.Content>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="border border-[#2A2E3E] bg-[#14161C]">
            <Card.Header className="border-b border-[#2A2E3E] px-5 py-4">
              <Card.Title className="text-lg font-semibold text-[#E8EAF0]">Order Info</Card.Title>
            </Card.Header>
            <Card.Content className="p-5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[#8B91A8]">
                  <span>Order ID</span>
                  <span className="max-w-[180px] truncate text-[#C4C9DB]">{order._id}</span>
                </div>
                <div className="flex justify-between text-[#8B91A8]">
                  <span>Created</span>
                  <span className="text-[#C4C9DB]">{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#8B91A8]">
                  <span>Payment</span>
                  <span className="text-[#C4C9DB]">{order.paymentMethod}</span>
                </div>

                {order.paymentMethod === 'Credit Card' && order.paymentInfo?.last4 && (
                  <div className="rounded-lg border border-[#2A2E3E] bg-[#1C1F29] px-3 py-2">
                    <p className="text-xs text-[#8B91A8]">Card</p>
                    <p className="text-sm text-[#C4C9DB]">
                      {order.paymentInfo?.cardBrand || 'Card'} - **** **** **** {order.paymentInfo.last4}
                    </p>
                    {order.paymentInfo?.cardName && (
                      <p className="text-xs text-[#8B91A8]">{order.paymentInfo.cardName}</p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-[#8B91A8]">Paid</span>
                  <Chip size="sm" color={order.isPaid ? 'success' : 'warning'} variant="soft">
                    {order.isPaid ? 'Paid' : 'Unpaid'}
                  </Chip>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[#8B91A8]">Delivery</span>
                  <Chip size="sm" color={deliveryColor} variant="soft">
                    {deliveryLabel}
                  </Chip>
                </div>
              </div>

              {order.paymentMethod === 'Credit Card' && !order.isPaid && (
                <div className="mt-4 border-t border-[#2A2E3E] pt-4 space-y-2">
                  {payError && (
                    <Alert status="danger">
                      <Alert.Indicator />
                      <Alert.Content><Alert.Description>{payError}</Alert.Description></Alert.Content>
                    </Alert>
                  )}
                  {paySuccess && (
                    <Alert status="success">
                      <Alert.Indicator />
                      <Alert.Content><Alert.Description>{paySuccess}</Alert.Description></Alert.Content>
                    </Alert>
                  )}
                  <Button
                    className="w-full border border-indigo-500/30 bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25"
                    isLoading={payLoading}
                    isDisabled={payLoading}
                    onClick={handleSimulatedPayment}
                  >
                    Pay Now
                  </Button>
                </div>
              )}
            </Card.Content>
          </Card>

          <Card className="border border-[#2A2E3E] bg-[#14161C]">
            <Card.Header className="border-b border-[#2A2E3E] px-5 py-4">
              <Card.Title className="text-lg font-semibold text-[#E8EAF0]">Customer</Card.Title>
            </Card.Header>
            <Card.Content className="p-5">
              <div className="space-y-1 text-sm text-[#C4C9DB]">
                <p>{order.user?.name || 'N/A'}</p>
                <p>{order.user?.email || 'N/A'}</p>
                <p className="capitalize text-[#8B91A8]">{order.user?.role || 'N/A'}</p>
              </div>
            </Card.Content>
          </Card>

          <Card className="border border-[#2A2E3E] bg-[#14161C]">
            <Card.Header className="border-b border-[#2A2E3E] px-5 py-4">
              <Card.Title className="text-lg font-semibold text-[#E8EAF0]">Total</Card.Title>
            </Card.Header>
            <Card.Content className="p-5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[#8B91A8]">
                  <span>Items Total</span>
                  <span className="text-[#C4C9DB]">{formatCurrency(itemsTotal)}</span>
                </div>
                <div className="flex justify-between border-t border-[#2A2E3E] pt-2 text-base font-bold">
                  <span className="text-[#E8EAF0]">Grand Total</span>
                  <span className="text-indigo-300">{formatCurrency(order.totalPrice || 0)}</span>
                </div>
              </div>
            </Card.Content>
          </Card>
        </aside>
      </div>
    </section>
  );
};

export default OrderDetails;
