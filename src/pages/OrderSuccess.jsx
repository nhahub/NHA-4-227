import { Link } from 'react-router-dom';
import { Alert, Button, Card } from '@heroui/react';
import { formatCurrency } from '../utils/format';

const OrderSuccess = () => {
  const rawOrder = localStorage.getItem('lastOrder');
  const order = rawOrder ? JSON.parse(rawOrder) : null;

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>No recent order found</Alert.Title>
            <Alert.Description>Place an order first to view confirmation details.</Alert.Description>
          </Alert.Content>
        </Alert>
        <Link to="/products">
          <Button size="lg" className="bg-indigo-600 text-white hover:bg-indigo-500">Back to Products</Button>
        </Link>
      </div>
    );
  }

  const orderReference = order._id || order.id;
  const orderItems = order.orderItems || order.items || [];
  const shippingAddress = order.shippingAddress || order.shippingInfo;
  const orderTotal = order.totalPrice ?? order.summary?.total ?? 0;
  const orderCreatedAt = order.createdAt;

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <Alert status="success">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Order Placed Successfully</Alert.Title>
          <Alert.Description>
            Thank you for your purchase. Your order reference is{' '}
            <span className="font-semibold">{orderReference}</span>.
            {orderCreatedAt && (
              <> Created at: {new Date(orderCreatedAt).toLocaleString()}</>
            )}
          </Alert.Description>
        </Alert.Content>
      </Alert>

      <Card className="border border-[#2A2E3E] bg-[#14161C]">
        <Card.Header className="border-b border-[#2A2E3E] px-6 py-4">
          <Card.Title className="text-lg font-bold text-[#E8EAF0]">Shipping & Payment</Card.Title>
        </Card.Header>
        <Card.Content className="px-6 py-4">
          <div className="space-y-1 text-sm text-[#C4C9DB]">
            <p>
              <span className="font-semibold text-[#E8EAF0]">Name:</span> {shippingAddress?.fullName}
            </p>
            <p>
              <span className="font-semibold text-[#E8EAF0]">Address:</span>{' '}
              {shippingAddress?.address}, {shippingAddress?.city}, {shippingAddress?.country}
            </p>
            <p>
              <span className="font-semibold text-[#E8EAF0]">Phone:</span> {shippingAddress?.phone}
            </p>
            <p>
              <span className="font-semibold text-[#E8EAF0]">Payment:</span> {order.paymentMethod}
            </p>
          </div>
        </Card.Content>
      </Card>

      <Card className="border border-[#2A2E3E] bg-[#14161C]">
        <Card.Header className="border-b border-[#2A2E3E] px-6 py-4">
          <Card.Title className="text-lg font-bold text-[#E8EAF0]">Order Summary</Card.Title>
        </Card.Header>
        <Card.Content className="px-6 py-4">
          <div className="space-y-2">
            {orderItems.map((item) => {
              const itemId = item._id || item.id || item.product;
              return (
                <div key={itemId} className="flex items-center justify-between text-sm">
                  <p className="text-[#C4C9DB]">
                    {item.name} <span className="text-[#8B91A8]">x{item.quantity}</span>
                  </p>
                  <p className="font-semibold text-[#E8EAF0]">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 space-y-1 border-t border-[#2A2E3E] pt-4 text-sm">
            {order.summary?.subtotal !== undefined && (
              <div className="flex justify-between text-[#8B91A8]">
                <span>Subtotal</span>
                <span>{formatCurrency(order.summary.subtotal)}</span>
              </div>
            )}
            {order.summary?.shipping !== undefined && (
              <div className="flex justify-between text-[#8B91A8]">
                <span>Shipping</span>
                <span>{order.summary.shipping === 0 ? 'Free' : formatCurrency(order.summary.shipping)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold">
              <span className="text-[#E8EAF0]">Total</span>
              <span className="text-indigo-400">{formatCurrency(orderTotal)}</span>
            </div>
          </div>
        </Card.Content>
      </Card>

      <Link to="/products" className="inline-block">
        <Button size="lg" className="bg-indigo-600 text-white hover:bg-indigo-500">Back to Products</Button>
      </Link>
    </section>
  );
};

export default OrderSuccess;
