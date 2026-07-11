import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button, Card, Chip } from '@heroui/react';
import {
  clearCart,
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
} from '../redux/slices/cartSlice';
import { formatCurrency } from '../utils/format';
import { resolveImageUrl } from '../utils/image';

const Cart = () => {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const userInfo = useSelector((state) => state.auth.userInfo);
  // Only customers (and unauthenticated guests) may proceed to checkout
  const canCheckout = !userInfo || userInfo.role === 'customer';
  const checkoutPath = !userInfo ? '/login' : '/checkout';

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <Card className="border border-[#2A2E3E] bg-[#14161C]">
          <Card.Content className="px-8 py-14">
            <div className="mb-4 text-5xl">🛒</div>
            <Card.Title className="font-syne text-xl font-bold text-[#E8EAF0]">
              Your cart is empty
            </Card.Title>
            <Card.Description className="mt-2 text-[#8B91A8]">
              Looks like you haven&apos;t added anything yet. Start exploring products.
            </Card.Description>
            <Link to="/products" className="mt-6 inline-block">
              <Button className="bg-indigo-600 text-white hover:bg-indigo-500" size="lg">
                Browse Products
              </Button>
            </Link>
          </Card.Content>
        </Card>
      </div>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      {/* ── Cart items ── */}
      <div className="space-y-4">
        <h1 className="font-syne text-2xl font-bold text-white">Shopping Cart</h1>

        {items.map((item) => {
          const itemId = item._id || item.id;
          return (
            <Card
              key={itemId}
              className="border border-[#2A2E3E] bg-[#14161C]"
            >
              <Card.Content className="p-0">
                <div className="grid gap-4 p-4 sm:grid-cols-[96px_1fr_auto] sm:items-center">
                  <img
                    src={resolveImageUrl(item.image)}
                    alt={item.name}
                    className="h-24 w-24 rounded-xl object-cover ring-1 ring-[#2A2E3E]"
                  />

                  <div>
                    <h3 className="font-semibold text-white">{item.name}</h3>
                    <Chip size="sm" variant="soft" className="mt-1">
                      {item.category}
                    </Chip>
                    <p className="mt-2 text-sm font-semibold text-indigo-400">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>

                  <div className="flex items-center gap-2 sm:justify-self-end">
                    <button
                      type="button"
                      onClick={() => dispatch(decrementQuantity(itemId))}
                      aria-label={`Decrease quantity for ${item.name}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#2A2E3E] bg-[#0f1117] text-sm font-bold text-slate-200 transition hover:border-indigo-500/50 hover:bg-indigo-500/10"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => dispatch(incrementQuantity(itemId))}
                      aria-label={`Increase quantity for ${item.name}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/40 bg-indigo-500/10 text-sm font-bold text-indigo-300 transition hover:bg-indigo-500/25"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch(removeFromCart(itemId))}
                      className="ml-1 inline-flex h-8 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </Card.Content>
            </Card>
          );
        })}
      </div>

      {/* ── Order summary ── */}
      <aside className="h-fit">
        <Card className="border border-[#2A2E3E] bg-[#14161C]">
          <Card.Header className="border-b border-[#2A2E3E] px-5 py-4">
            <Card.Title className="font-syne text-lg font-bold text-white">Order Summary</Card.Title>
          </Card.Header>
          <Card.Content className="px-5 py-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[#8B91A8]">
                <span>Subtotal</span>
                <span className="text-slate-200">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#8B91A8]">
                <span>Shipping</span>
                <span className="text-emerald-400">Free</span>
              </div>
              <div className="border-t border-[#2A2E3E] pt-3">
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-indigo-400">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </Card.Content>
          <Card.Footer className="flex flex-col gap-2 border-t border-[#2A2E3E] px-5 py-4">
            {canCheckout ? (
              <Link to={checkoutPath} className="block">
                <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-500" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>
            ) : (
              <>
                <Button className="w-full bg-indigo-600/40 text-white/50 cursor-not-allowed" size="lg" isDisabled>
                  Proceed to Checkout
                </Button>
                <Alert status="warning">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Description className="text-xs">
                      <strong className="capitalize">{userInfo?.role}</strong> accounts cannot place orders. Only customer accounts can checkout.
                    </Alert.Description>
                  </Alert.Content>
                </Alert>
              </>
            )}
            <Button
              variant="ghost"
              className="w-full border border-[#2A2E3E] text-[#8B91A8] hover:bg-[#1C1F29]"
              onClick={() => dispatch(clearCart())}
            >
              Clear Cart
            </Button>
          </Card.Footer>
        </Card>
      </aside>
    </section>
  );
};

export default Cart;
