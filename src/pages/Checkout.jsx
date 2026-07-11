import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Chip, Spinner } from '@heroui/react';
import { clearCart } from '../redux/slices/cartSlice';
import { formatCurrency } from '../utils/format';
import { createOrder } from '../services/orderService';
import { getSavedCard, saveCard } from '../services/walletService';
import { resolveImageUrl } from '../utils/image';
import CreditCard3D, { detectBrand } from '../components/CreditCard3D';
import InteractiveCardForm from '../components/InteractiveCardForm';

const initialForm = { fullName: '', address: '', city: '', country: '', phone: '' };
const inputClass =
  'w-full rounded-lg border border-[#2A2E3E] bg-[#1C1F29] px-3 py-2 text-sm text-[#E8EAF0] placeholder:text-[#555D78] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

const Checkout = () => {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const cartItems   = useSelector((state) => state.cart.items);
  const userInfo    = useSelector((state) => state.auth.userInfo);
  const isCustomer  = userInfo?.role === 'customer';
  const isAdmin     = userInfo?.role === 'admin';
  const isSeller    = userInfo?.role === 'seller';

  useEffect(() => {
    if (!userInfo) { navigate('/login', { replace: true }); return; }
    if (!isCustomer) { navigate('/', { replace: true }); }
  }, [userInfo, isCustomer, navigate]);

  const [formData, setFormData]       = useState(initialForm);
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [errors, setErrors]           = useState({});
  const [apiError, setApiError]       = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Wallet state */
  const [walletCard, setWalletCard]   = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [useWallet, setUseWallet]     = useState(true);   // use saved card by default
  const [pendingCard, setPendingCard] = useState(null);   // card from InteractiveCardForm (not yet saved)
  const [saveToWallet, setSaveToWallet] = useState(true); // offer to save new card

  const fetchWallet = useCallback(async () => {
    try {
      setWalletLoading(true);
      const card = await getSavedCard();
      setWalletCard(card);
    } catch {
      setWalletCard(null);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  useEffect(() => {
    if (paymentMethod === 'Credit Card') fetchWallet();
  }, [paymentMethod, fetchWallet]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0), [cartItems]
  );
  const total = subtotal;

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* Validate shipping only — card validation is inside InteractiveCardForm */
  const validateShipping = () => {
    const e = {};
    if (cartItems.length === 0) e.cart = 'Your cart is empty.';
    Object.entries(formData).forEach(([k, v]) => {
      if (!v.trim()) e[k] = 'Required';
    });
    if (paymentMethod === 'Credit Card') {
      const activeCard = useWallet && walletCard ? walletCard : pendingCard;
      if (!activeCard) e.card = 'Please add a payment card.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!userInfo || !isCustomer) return;
    if (!validateShipping()) return;

    setApiError('');
    setIsSubmitting(true);

    // Determine which card to use
    const activeCard = useWallet && walletCard ? walletCard : pendingCard;

    const orderPayload = {
      orderItems: cartItems.map((item) => ({
        product: item._id || item.id,
        quantity: item.quantity,
      })),
      shippingAddress: {
        fullName: formData.fullName,
        address:  formData.address,
        city:     formData.city,
        country:  formData.country,
        phone:    formData.phone,
      },
      paymentMethod,
    };

    if (paymentMethod === 'Credit Card' && activeCard) {
      orderPayload.paymentInfo = {
        cardBrand: activeCard.cardBrand,
        last4:     activeCard.last4,
        cardName:  activeCard.cardName,
      };

      // Optionally save new card to wallet
      if (!useWallet && saveToWallet && pendingCard) {
        try {
          await saveCard(pendingCard);
        } catch {
          /* non-fatal */
        }
      }
    }

    try {
      const createdOrder = await createOrder(orderPayload);
      localStorage.setItem('lastOrder', JSON.stringify(createdOrder));
      dispatch(clearCart());
      navigate('/order-success');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Called by InteractiveCardForm when user enters a new card */
  const handleNewCard = (cardInfo) => {
    setPendingCard(cardInfo);
    setErrors((prev) => ({ ...prev, card: undefined }));
  };

  if (!userInfo || !isCustomer) return null;

  return (
    <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      {isAdmin ? (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Admin accounts cannot place orders</Alert.Title>
            <Alert.Description>
              <Link to="/admin/orders" className="font-semibold text-indigo-400 hover:text-indigo-300">Go to Admin Orders</Link>
            </Alert.Description>
          </Alert.Content>
        </Alert>
      ) : isSeller ? (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Seller accounts cannot place orders</Alert.Title>
            <Alert.Description>
              <Link to="/products" className="font-semibold text-indigo-400 hover:text-indigo-300">Back to Products</Link>
            </Alert.Description>
          </Alert.Content>
        </Alert>
      ) : (
        <form onSubmit={handlePlaceOrder} className="space-y-6">
          {/* Header */}
          <Card className="border border-[#2A2E3E] bg-[#14161C]">
            <Card.Header className="border-b border-[#2A2E3E] px-5 py-4">
              <Card.Title className="font-syne text-2xl font-bold text-[#E8EAF0]">Checkout</Card.Title>
              <Card.Description className="text-[#8B91A8]">Enter your shipping details to place your order.</Card.Description>
            </Card.Header>
            <Card.Content className="space-y-3 p-5">
              {errors.cart && (
                <Alert status="danger">
                  <Alert.Indicator />
                  <Alert.Content><Alert.Description>{errors.cart}</Alert.Description></Alert.Content>
                </Alert>
              )}
              {apiError && (
                <Alert status="danger">
                  <Alert.Indicator />
                  <Alert.Content><Alert.Description>{apiError}</Alert.Description></Alert.Content>
                </Alert>
              )}
            </Card.Content>
          </Card>

          {/* Shipping */}
          <Card className="border border-[#2A2E3E] bg-[#14161C]">
            <Card.Header className="border-b border-[#2A2E3E] px-5 py-4">
              <Card.Title className="text-lg font-bold text-[#E8EAF0]">Shipping Information</Card.Title>
            </Card.Header>
            <Card.Content className="p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { id: 'fullName', label: 'Full Name', colSpan: 2, placeholder: 'Enter full name' },
                  { id: 'address',  label: 'Address',   colSpan: 2, placeholder: 'Street and building details' },
                  { id: 'city',     label: 'City',       colSpan: 1, placeholder: 'City' },
                  { id: 'country',  label: 'Country',    colSpan: 1, placeholder: 'Country' },
                  { id: 'phone',    label: 'Phone',      colSpan: 2, placeholder: 'Phone number' },
                ].map(({ id, label, colSpan, placeholder }) => (
                  <div key={id} className={colSpan === 2 ? 'sm:col-span-2' : ''}>
                    <label htmlFor={id} className="mb-1 block text-sm font-medium text-[#8B91A8]">{label}</label>
                    <input id={id} name={id} value={formData[id]} onChange={onChange} placeholder={placeholder} className={inputClass} />
                    {errors[id] && <p className="mt-1 text-xs text-rose-400">{errors[id]}</p>}
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>

          {/* Payment Method */}
          <Card className="border border-[#2A2E3E] bg-[#14161C]">
            <Card.Header className="border-b border-[#2A2E3E] px-5 py-4">
              <Card.Title className="text-lg font-bold text-[#E8EAF0]">Payment Method</Card.Title>
            </Card.Header>
            <Card.Content className="p-5 space-y-4">
              {/* Method picker */}
              <div className="space-y-3">
                {['Cash on Delivery', 'Credit Card'].map((m) => (
                  <label
                    key={m}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                      paymentMethod === m
                        ? 'border-indigo-500/60 bg-indigo-500/10'
                        : 'border-[#2A2E3E] bg-[#1C1F29] hover:border-indigo-500/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={m}
                      checked={paymentMethod === m}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setPendingCard(null);
                        setErrors({});
                      }}
                      className="accent-indigo-500"
                    />
                    <span className="text-sm font-medium text-[#E8EAF0]">
                      {m === 'Cash on Delivery' ? '💵 Cash on Delivery' : '💳 Credit / Debit Card'}
                    </span>
                  </label>
                ))}
              </div>

              {/* ── Credit Card section ── */}
              {paymentMethod === 'Credit Card' && (
                <div className="mt-2 space-y-4">
                  {walletLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Spinner size="md" />
                    </div>
                  ) : walletCard && useWallet ? (
                    /* Saved card on file — use it */
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#555D78]">Saved Card</p>
                      <CreditCard3D
                        cardNumber={`xxxxxxxxxxxx${walletCard.last4}`}
                        cardName={walletCard.cardName}
                        expiry={walletCard.expiry}
                        mini
                      />
                      <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                        <span className="text-lg">✅</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#E8EAF0]">{walletCard.cardBrand} •••• {walletCard.last4}</p>
                          <p className="text-xs text-[#555D78]">Expires {walletCard.expiry} · {walletCard.cardName}</p>
                        </div>
                        <Chip size="sm" color="success" variant="soft">Will be charged</Chip>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUseWallet(false)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition underline underline-offset-2"
                      >
                        Use a different card instead
                      </button>
                    </div>
                  ) : (
                    /* No saved card OR user chose to use different card */
                    <div className="space-y-3">
                      {walletCard && (
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-widest text-[#555D78]">Enter card details</p>
                          <button
                            type="button"
                            onClick={() => { setUseWallet(true); setPendingCard(null); }}
                            className="text-xs text-indigo-400 hover:text-indigo-300 transition underline underline-offset-2"
                          >
                            ← Use saved card
                          </button>
                        </div>
                      )}

                      {!walletCard && (
                        <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                          <span className="text-base">💡</span>
                          <p className="text-xs text-amber-300">
                            No saved card found. Enter your card details below. You can save it to your wallet for faster checkout next time.
                          </p>
                        </div>
                      )}

                      {/* The form calls handleNewCard when complete */}
                      <InteractiveCardForm
                        onSave={handleNewCard}
                        submitLabel={pendingCard ? '✓ Card Ready — update' : 'Confirm Card Details'}
                        compact
                      />

                      {pendingCard && (
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
                          <span className="text-sm text-emerald-400">✓</span>
                          <p className="text-xs text-emerald-300">
                            {pendingCard.cardBrand} •••• {pendingCard.last4} — ready to use
                          </p>
                        </div>
                      )}

                      {/* Save to wallet option */}
                      {!walletCard && (
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={saveToWallet}
                            onChange={(e) => setSaveToWallet(e.target.checked)}
                            className="accent-indigo-500 h-4 w-4"
                          />
                          <span className="text-xs text-[#8B91A8]">Save this card to my wallet for future orders</span>
                        </label>
                      )}
                    </div>
                  )}

                  {errors.card && <p className="text-xs text-rose-400">{errors.card}</p>}
                </div>
              )}
            </Card.Content>
          </Card>

          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            className="w-full bg-indigo-600 text-white hover:bg-indigo-500 sm:w-auto"
          >
            Place Order
          </Button>
        </form>
      )}

      {/* ── Order Summary ── */}
      <aside className="h-fit">
        <Card className="border border-[#2A2E3E] bg-[#14161C]">
          <Card.Header className="border-b border-[#2A2E3E] px-5 py-4">
            <Card.Title className="font-syne text-lg font-bold text-[#E8EAF0]">Order Summary</Card.Title>
          </Card.Header>
          <Card.Content className="p-5">
            <div className="space-y-3">
              {cartItems.length === 0 ? (
                <p className="text-sm text-[#8B91A8]">No items in cart.</p>
              ) : (
                cartItems.map((item) => {
                  const itemId = item._id || item.id;
                  return (
                    <div key={itemId} className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex min-w-0 items-center gap-2">
                        <img src={resolveImageUrl(item.image)} alt={item.name} className="h-8 w-8 rounded-md object-cover ring-1 ring-[#2A2E3E]" />
                        <p className="line-clamp-1 text-[#C4C9DB]">
                          {item.name} <span className="text-[#8B91A8]">x{item.quantity}</span>
                        </p>
                      </div>
                      <p className="font-semibold text-indigo-300">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  );
                })
              )}
            </div>
          </Card.Content>
          <Card.Footer className="border-t border-[#2A2E3E] px-5 py-4">
            <div className="w-full space-y-2 text-sm">
              <div className="flex justify-between text-[#8B91A8]">
                <span>Subtotal</span>
                <span className="text-[#C4C9DB]">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#8B91A8]">
                <span>Shipping</span>
                <span className="text-[#C4C9DB]">Free</span>
              </div>
              <div className="flex justify-between border-t border-[#2A2E3E] pt-2 text-base font-bold">
                <span className="text-[#E8EAF0]">Total</span>
                <span className="text-indigo-300">{formatCurrency(total)}</span>
              </div>
            </div>
            <Link to="/cart" className="mt-3 inline-block text-sm font-medium text-indigo-400 hover:text-indigo-300">
              Back to Cart
            </Link>
          </Card.Footer>
        </Card>
      </aside>
    </section>
  );
};

export default Checkout;
