import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button, Card, Chip, Spinner } from '@heroui/react';
import { setCredentials } from '../redux/slices/authSlice';
import { updateProfile } from '../services/authService';
import { getSavedCard, saveCard, deleteCard } from '../services/walletService';
import UserAvatar from '../components/UserAvatar';
import CreditCard3D from '../components/CreditCard3D';
import InteractiveCardForm from '../components/InteractiveCardForm';
import { resolveImageUrl } from '../utils/image';

const inputClass =
  'w-full rounded-xl border border-[#2A2E3E] bg-[#1C1F29] px-4 py-2.5 text-sm text-[#E8EAF0] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';
const readonlyClass =
  'w-full cursor-not-allowed rounded-xl border border-[#2A2E3E] bg-[#11131A] px-4 py-2.5 text-sm text-[#8B91A8]';

/* ── Saved Card Display ── */
const SavedCardBlock = ({ card, onRemove, onReplace, removing }) => (
  <div className="space-y-4">
    <CreditCard3D
      cardNumber={`xxxxxxxxxxxx${card.last4}`}
      cardName={card.cardName}
      expiry={card.expiry}
      mini
    />
    <div className="flex items-center gap-3 rounded-xl border border-[#2A2E3E] bg-[#1C1F29] px-4 py-3 text-sm">
      <div className="flex-1">
        <p className="font-semibold text-[#E8EAF0]">{card.cardBrand} •••• {card.last4}</p>
        <p className="text-xs text-[#555D78]">Expires {card.expiry} · {card.cardName}</p>
      </div>
      <Chip size="sm" color="success" variant="soft">Active</Chip>
    </div>
    <div className="flex gap-3">
      <Button
        size="sm"
        variant="ghost"
        onClick={onReplace}
        className="border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
      >
        Replace Card
      </Button>
      <Button
        size="sm"
        variant="ghost"
        isLoading={removing}
        onClick={onRemove}
        className="border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
      >
        Remove
      </Button>
    </div>
  </div>
);

const Profile = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  /* Profile form */
  const [name, setName] = useState(userInfo?.name || '');
  const [displayName, setDisplayName] = useState(userInfo?.displayName || '');
  const [address, setAddress] = useState(userInfo?.address || '');
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(userInfo?.profileImage || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /* Wallet */
  const [savedCard, setSavedCard]       = useState(null);
  const [cardLoading, setCardLoading]   = useState(true);
  const [showCardForm, setShowCardForm] = useState(false);
  const [savingCard, setSavingCard]     = useState(false);
  const [removingCard, setRemovingCard] = useState(false);
  const [cardMsg, setCardMsg]           = useState({ type: '', text: '' });

  useEffect(() => {
    if (!userInfo) return;
    setName(userInfo.name || '');
    setDisplayName(userInfo.displayName || '');
    setAddress(userInfo.address || '');
    setPreview(userInfo.profileImage || '');
  }, [userInfo]);

  const fetchCard = useCallback(async () => {
    try {
      setCardLoading(true);
      const card = await getSavedCard();
      setSavedCard(card);
    } catch {
      setSavedCard(null);
    } finally {
      setCardLoading(false);
    }
  }, []);

  useEffect(() => { if (userInfo) fetchCard(); }, [userInfo, fetchCard]);

  if (!userInfo) return <Navigate to="/login" replace />;

  /* Profile handlers */
  const resetForm = () => {
    setName(userInfo.name || '');
    setDisplayName(userInfo.displayName || '');
    setAddress(userInfo.address || '');
    setPreview(userInfo.profileImage || '');
    setProfileImage(null);
  };

  const handleCancel = () => { setError(''); setSuccess(''); resetForm(); setIsEditing(false); };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!name.trim()) { setError('Name is required'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', name.trim());
      fd.append('displayName', displayName.trim());
      if (userInfo.role === 'customer') fd.append('address', address.trim());
      if (profileImage) fd.append('profileImage', profileImage);
      const updated = await updateProfile(fd);
      dispatch(setCredentials(updated));
      setSuccess('Profile updated successfully.');
      setProfileImage(null);
      setPreview(updated.profileImage || '');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  /* Wallet handlers */
  const handleSaveCard = async (cardInfo) => {
    try {
      setSavingCard(true);
      setCardMsg({ type: '', text: '' });
      const saved = await saveCard(cardInfo);
      setSavedCard(saved);
      setShowCardForm(false);
      setCardMsg({ type: 'success', text: 'Card saved to your wallet.' });
    } catch (err) {
      setCardMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save card.' });
    } finally {
      setSavingCard(false);
    }
  };

  const handleRemoveCard = async () => {
    try {
      setRemovingCard(true);
      await deleteCard();
      setSavedCard(null);
      setCardMsg({ type: 'success', text: 'Card removed from your wallet.' });
    } catch {
      setCardMsg({ type: 'error', text: 'Failed to remove card.' });
    } finally {
      setRemovingCard(false);
    }
  };

  const canHaveWallet = ['customer', 'seller'].includes(userInfo.role);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* ── Profile Card ── */}
      <Card className="overflow-hidden border border-[#2A2E3E] bg-[#14161C]">
        <Card.Header className="border-b border-[#2A2E3E] px-6 py-5">
          <div className="flex items-center justify-between">
            <Card.Title className="font-syne text-2xl font-bold text-[#E8EAF0]">My Profile</Card.Title>
            <Chip size="sm" color="accent" variant="soft" className="capitalize">{userInfo.role}</Chip>
          </div>
        </Card.Header>

        <Card.Content className="space-y-6 px-6 py-6">
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

          {/* Avatar row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-[#2A2E3E]">
              <UserAvatar
                user={{ ...userInfo, profileImage: preview || userInfo.profileImage, name, displayName }}
                size="lg"
                className="h-full w-full rounded-none"
              />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <>
                  <label className="mb-1.5 block text-xs font-medium text-[#8B91A8]">Profile Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full rounded-xl border border-[#2A2E3E] bg-[#1C1F29] px-3 py-2 text-sm text-[#E8EAF0] file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                  />
                  <p className="mt-1 text-xs text-[#555D78]">JPG, PNG, WEBP supported.</p>
                </>
              ) : (
                <p className="text-sm text-[#8B91A8]">Click &quot;Edit Profile&quot; to update your photo.</p>
              )}
            </div>
          </div>

          {/* Form / Display */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-[#8B91A8]">Name</label>
                  <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="displayName" className="mb-1.5 block text-xs font-medium text-[#8B91A8]">Display Name</label>
                  <input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#8B91A8]">Email</label>
                  <input type="email" value={userInfo.email} readOnly className={readonlyClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#8B91A8]">Role</label>
                  <input type="text" value={userInfo.role} readOnly className={`${readonlyClass} capitalize`} />
                </div>
              </div>
              {userInfo.role === 'customer' && (
                <div>
                  <label htmlFor="address" className="mb-1.5 block text-xs font-medium text-[#8B91A8]">Address</label>
                  <textarea id="address" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your shipping address" className={inputClass} />
                </div>
              )}
              <div className="flex flex-wrap gap-3 pt-1">
                <Button type="submit" isLoading={loading} className="bg-indigo-600 text-white hover:bg-indigo-500">Save Changes</Button>
                <Button variant="ghost" onClick={handleCancel} className="border border-[#2A2E3E] text-[#8B91A8]">Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: 'Name',         value: userInfo.name },
                  { label: 'Display Name', value: userInfo.displayName },
                  { label: 'Email',        value: userInfo.email },
                  { label: 'Role',         value: userInfo.role, capitalize: true },
                ].map(({ label, value, capitalize }) => (
                  <div key={label} className="rounded-xl border border-[#2A2E3E] bg-[#1C1F29] px-4 py-3">
                    <p className="text-xs text-[#8B91A8]">{label}</p>
                    <p className={`mt-1 text-sm font-medium text-[#E8EAF0] ${capitalize ? 'capitalize' : ''}`}>{value || '—'}</p>
                  </div>
                ))}
              </div>
              {userInfo.role === 'customer' && (
                <div className="rounded-xl border border-[#2A2E3E] bg-[#1C1F29] px-4 py-3">
                  <p className="text-xs text-[#8B91A8]">Address</p>
                  <p className="mt-1 text-sm font-medium text-[#E8EAF0]">{userInfo.address || '—'}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-3 pt-1">
                <Button onClick={() => setIsEditing(true)} className="bg-indigo-600 text-white hover:bg-indigo-500">Edit Profile</Button>
                {userInfo.role === 'customer' && (
                  <Link to="/my-orders">
                    <Button variant="ghost" className="border border-[#2A2E3E] text-[#8B91A8]">My Orders</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* ── Payment Card / Wallet ── */}
      {canHaveWallet && (
        <Card className="overflow-hidden border border-[#2A2E3E] bg-[#14161C]">
          <Card.Header className="border-b border-[#2A2E3E] px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <Card.Title className="font-syne text-xl font-bold text-[#E8EAF0]">
                  {userInfo.role === 'seller' ? 'Payment Card' : 'My Wallet'}
                </Card.Title>
                <p className="mt-0.5 text-xs text-[#555D78]">
                  {userInfo.role === 'seller'
                    ? 'Your Visa/card where customers send card payments'
                    : 'Saved card for faster checkout'}
                </p>
              </div>
              {savedCard && !showCardForm && (
                <Chip size="sm" color="success" variant="soft">Card on file</Chip>
              )}
            </div>
          </Card.Header>

          <Card.Content className="px-6 py-6">
            {cardMsg.text && (
              <Alert status={cardMsg.type === 'error' ? 'danger' : 'success'} className="mb-5">
                <Alert.Indicator />
                <Alert.Content><Alert.Description>{cardMsg.text}</Alert.Description></Alert.Content>
              </Alert>
            )}

            {cardLoading ? (
              <div className="flex items-center justify-center py-10">
                <Spinner size="md" />
              </div>
            ) : showCardForm ? (
              <InteractiveCardForm
                onSave={handleSaveCard}
                onCancel={() => setShowCardForm(false)}
                saving={savingCard}
                submitLabel={savedCard ? 'Replace Card' : 'Save Card'}
              />
            ) : savedCard ? (
              <SavedCardBlock
                card={savedCard}
                onRemove={handleRemoveCard}
                onReplace={() => { setShowCardForm(true); setCardMsg({ type: '', text: '' }); }}
                removing={removingCard}
              />
            ) : (
              <div className="space-y-4 text-center py-4">
                <div className="text-4xl">💳</div>
                <p className="text-sm text-[#8B91A8]">
                  {userInfo.role === 'seller'
                    ? 'Add your card so you can receive card payments from customers.'
                    : 'Add a card to your wallet for faster checkout.'}
                </p>
                <Button
                  onClick={() => { setShowCardForm(true); setCardMsg({ type: '', text: '' }); }}
                  className="bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  + Add Card
                </Button>
              </div>
            )}
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

export default Profile;
