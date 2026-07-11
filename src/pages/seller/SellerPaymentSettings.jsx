import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Chip, Spinner } from '@heroui/react';
import { getSavedCard, saveCard, deleteCard } from '../../services/walletService';
import { getSellerPaymentInfo, updateSellerPaymentInfo } from '../../services/sellerService';
import CreditCard3D from '../../components/CreditCard3D';
import InteractiveCardForm from '../../components/InteractiveCardForm';

const inp =
  'w-full rounded-xl border border-[#2A2E3E] bg-[#1C1F29] px-4 py-2.5 text-sm text-[#E8EAF0] placeholder-[#555D78] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

const EMPTY_BANK = { bankName: '', accountNumber: '', accountName: '', iban: '' };

const SellerPaymentSettings = () => {
  /* Card wallet state */
  const [savedCard, setSavedCard]       = useState(null);
  const [cardLoading, setCardLoading]   = useState(true);
  const [showCardForm, setShowCardForm] = useState(false);
  const [savingCard, setSavingCard]     = useState(false);
  const [removingCard, setRemovingCard] = useState(false);
  const [cardMsg, setCardMsg]           = useState({ type: '', text: '' });

  /* Bank details state */
  const [bankForm, setBankForm]   = useState(EMPTY_BANK);
  const [bankLoading, setBankLoading] = useState(true);
  const [savingBank, setSavingBank]   = useState(false);
  const [bankMsg, setBankMsg]         = useState({ type: '', text: '' });

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

  const fetchBank = useCallback(async () => {
    try {
      setBankLoading(true);
      const info = await getSellerPaymentInfo();
      setBankForm({
        bankName:      info.bankName      || '',
        accountNumber: info.accountNumber || '',
        accountName:   info.accountName   || '',
        iban:          info.iban          || '',
      });
    } catch {
      // keep empty
    } finally {
      setBankLoading(false);
    }
  }, []);

  useEffect(() => { fetchCard(); fetchBank(); }, [fetchCard, fetchBank]);

  /* Card handlers */
  const handleSaveCard = async (cardInfo) => {
    try {
      setSavingCard(true);
      setCardMsg({ type: '', text: '' });
      const saved = await saveCard(cardInfo);
      setSavedCard(saved);
      setShowCardForm(false);
      setCardMsg({ type: 'success', text: 'Card saved — customers paying by Visa will send to this card.' });
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
      setCardMsg({ type: 'success', text: 'Card removed.' });
    } catch {
      setCardMsg({ type: 'error', text: 'Failed to remove card.' });
    } finally {
      setRemovingCard(false);
    }
  };

  /* Bank handlers */
  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveBank = async (e) => {
    e.preventDefault();
    try {
      setSavingBank(true);
      setBankMsg({ type: '', text: '' });
      await updateSellerPaymentInfo(bankForm);
      setBankMsg({ type: 'success', text: 'Bank details saved.' });
    } catch (err) {
      setBankMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save bank details.' });
    } finally {
      setSavingBank(false);
    }
  };

  return (
    <section className="max-w-2xl space-y-6">
      {/* Header */}
      <Card className="border border-[#2A2E3E] bg-[#14161C]">
        <Card.Content className="p-5">
          <h1 className="font-syne text-2xl font-bold text-[#E8EAF0]">Payment Settings</h1>
          <p className="mt-1 text-sm text-[#8B91A8]">
            Configure how you receive payments from customers. Customers who pay by card will need your card or bank details to send the payment.
          </p>
        </Card.Content>
      </Card>

      {/* ── Visa / Card ── */}
      <Card className="border border-[#2A2E3E] bg-[#14161C]">
        <Card.Header className="border-b border-[#2A2E3E] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Card.Title className="text-lg font-semibold text-[#E8EAF0]">💳 Visa / Debit Card</Card.Title>
              <p className="mt-0.5 text-xs text-[#555D78]">Customers paying by Visa will transfer to this card</p>
            </div>
            {savedCard && !showCardForm && (
              <Chip size="sm" color="success" variant="soft">Active</Chip>
            )}
          </div>
        </Card.Header>
        <Card.Content className="p-5">
          {cardMsg.text && (
            <Alert status={cardMsg.type === 'error' ? 'danger' : 'success'} className="mb-5">
              <Alert.Indicator />
              <Alert.Content><Alert.Description>{cardMsg.text}</Alert.Description></Alert.Content>
            </Alert>
          )}

          {cardLoading ? (
            <div className="flex justify-center py-8"><Spinner size="md" /></div>
          ) : showCardForm ? (
            <InteractiveCardForm
              onSave={handleSaveCard}
              onCancel={() => setShowCardForm(false)}
              saving={savingCard}
              submitLabel={savedCard ? 'Replace Card' : 'Save Card'}
            />
          ) : savedCard ? (
            <div className="space-y-4">
              <CreditCard3D
                cardNumber={`xxxxxxxxxxxx${savedCard.last4}`}
                cardName={savedCard.cardName}
                expiry={savedCard.expiry}
                mini
              />
              <div className="flex items-center gap-3 rounded-xl border border-[#2A2E3E] bg-[#1C1F29] px-4 py-3 text-sm">
                <div className="flex-1">
                  <p className="font-semibold text-[#E8EAF0]">{savedCard.cardBrand} •••• {savedCard.last4}</p>
                  <p className="text-xs text-[#555D78]">Expires {savedCard.expiry} · {savedCard.cardName}</p>
                </div>
                <Chip size="sm" color="success" variant="soft">Active</Chip>
              </div>
              <div className="flex gap-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setShowCardForm(true); setCardMsg({ type: '', text: '' }); }}
                  className="border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
                >
                  Replace Card
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  isLoading={removingCard}
                  onClick={handleRemoveCard}
                  className="border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4 text-center">
              <div className="text-4xl">💳</div>
              <p className="text-sm text-[#8B91A8]">
                Add your Visa/debit card so customers paying by card can send payments to you.
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

      {/* ── Bank Transfer ── */}
      <Card className="border border-[#2A2E3E] bg-[#14161C]">
        <Card.Header className="border-b border-[#2A2E3E] px-5 py-4">
          <Card.Title className="text-lg font-semibold text-[#E8EAF0]">🏦 Bank Transfer (Optional)</Card.Title>
          <p className="mt-0.5 text-xs text-[#555D78]">Alternative for customers who prefer wire transfer</p>
        </Card.Header>
        <Card.Content className="p-5">
          {bankMsg.text && (
            <Alert status={bankMsg.type === 'error' ? 'danger' : 'success'} className="mb-5">
              <Alert.Indicator />
              <Alert.Content><Alert.Description>{bankMsg.text}</Alert.Description></Alert.Content>
            </Alert>
          )}

          {bankLoading ? (
            <div className="flex justify-center py-8"><Spinner size="md" /></div>
          ) : (
            <form onSubmit={handleSaveBank} className="space-y-4">
              {[
                { name: 'bankName',      label: 'Bank Name',            placeholder: 'e.g. National Bank' },
                { name: 'accountName',   label: 'Account Holder Name',  placeholder: 'Full name on account' },
                { name: 'accountNumber', label: 'Account Number',       placeholder: 'e.g. 1234567890' },
                { name: 'iban',          label: 'IBAN (optional)',       placeholder: 'e.g. SA12 3456 7890...' },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#555D78]">{label}</label>
                  <input name={name} value={bankForm[name]} onChange={handleBankChange} placeholder={placeholder} className={inp} />
                </div>
              ))}
              <div className="flex justify-end pt-1">
                <Button type="submit" isLoading={savingBank} className="bg-indigo-600 font-semibold text-white hover:bg-indigo-500">
                  Save Bank Details
                </Button>
              </div>
            </form>
          )}
        </Card.Content>
      </Card>
    </section>
  );
};

export default SellerPaymentSettings;
