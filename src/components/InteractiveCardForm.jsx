import { useState } from 'react';
import { Alert, Button } from '@heroui/react';
import CreditCard3D, { detectBrand } from './CreditCard3D';

const MONTHS = ['01','02','03','04','05','06','07','08','09','10','11','12'];

const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: 11 }, (_, i) => String(thisYear + i).slice(-2));

const fmtNumber = (v) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const luhnOk = (raw) => {
  const d = raw.replace(/\D/g, '');
  if (d.length < 12) return false;
  let sum = 0, flip = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);
    if (flip) { n *= 2; if (n > 9) n -= 9; }
    sum += n; flip = !flip;
  }
  return sum % 10 === 0;
};

const expiredCheck = (mm, yy) => {
  if (!mm || !yy) return true;
  const fullYear = 2000 + Number(yy);
  return new Date(fullYear, Number(mm), 0, 23, 59, 59) < new Date();
};

/* ── Shared input style ── */
const inp =
  'w-full rounded-xl border border-[#2A2E3E] bg-[#1C1F29] px-4 py-2.5 text-sm text-[#E8EAF0] placeholder:text-[#555D78] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';
const sel =
  'w-full rounded-xl border border-[#2A2E3E] bg-[#1C1F29] px-4 py-2.5 text-sm text-[#E8EAF0] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer';
const lbl = 'mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#555D78]';

/**
 * InteractiveCardForm
 *
 * Props:
 *   onSave(cardInfo)  – called with { last4, cardBrand, cardName, expiry, rawNumber (for checkout) }
 *   onCancel()        – optional cancel handler
 *   submitLabel       – button label (default "Save Card")
 *   saving            – loading state
 *   compact           – reduces vertical padding
 */
const InteractiveCardForm = ({
  onSave,
  onCancel,
  submitLabel = 'Save Card',
  saving = false,
  compact = false,
}) => {
  const [number,  setNumber]  = useState('');
  const [name,    setName]    = useState('');
  const [month,   setMonth]   = useState('');
  const [year,    setYear]    = useState('');
  const [cvv,     setCvv]     = useState('');
  const [flipped, setFlipped] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [apiErr,  setApiErr]  = useState('');

  const expiry = month && year ? `${month}/${year}` : month ? `${month}/YY` : year ? `MM/${year}` : '';

  const validate = () => {
    const e = {};
    const raw = number.replace(/\D/g, '');
    if (!raw)              e.number = 'Card number is required';
    else if (!luhnOk(raw)) e.number = 'Invalid card number';
    if (!name.trim())      e.name   = 'Cardholder name is required';
    if (!month)            e.month  = 'Required';
    if (!year)             e.year   = 'Required';
    if (month && year && expiredCheck(month, year)) e.year = 'Card is expired';
    if (!cvv)              e.cvv    = 'CVV is required';
    else if (!/^\d{3,4}$/.test(cvv)) e.cvv = '3 or 4 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setApiErr('');
    if (!validate()) return;
    const raw = number.replace(/\D/g, '');
    onSave({
      last4:     raw.slice(-4),
      cardBrand: detectBrand(raw),
      cardName:  name.trim().toUpperCase(),
      expiry:    `${month}/${year}`,
      rawNumber: raw,
      cvv,
    });
  };

  return (
    <div className={compact ? '' : 'space-y-5'}>
      {/* 3D Card Preview */}
      <div className={compact ? 'mb-4' : 'mb-6'}>
        <CreditCard3D
          cardNumber={number}
          cardName={name}
          expiry={expiry}
          cvv={cvv}
          flipped={flipped}
        />
      </div>

      {apiErr && (
        <Alert status="danger" className="mb-3">
          <Alert.Indicator />
          <Alert.Content><Alert.Description>{apiErr}</Alert.Description></Alert.Content>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div>
          <label className={lbl}>Card Number</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="•••• •••• •••• ••••"
            value={number}
            maxLength={19}
            onChange={(e) => setNumber(fmtNumber(e.target.value))}
            className={inp}
          />
          {errors.number && <p className="mt-1 text-xs text-rose-400">{errors.number}</p>}
        </div>

        {/* Cardholder Name */}
        <div>
          <label className={lbl}>Cardholder Name</label>
          <input
            type="text"
            placeholder="Full name as on card"
            value={name}
            maxLength={26}
            onChange={(e) => setName(e.target.value)}
            className={inp}
          />
          {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
        </div>

        {/* Expiry + CVV */}
        <div className="grid grid-cols-[1fr_1fr_100px] gap-3">
          {/* Month */}
          <div>
            <label className={lbl}>Month</label>
            <div className="relative">
              <select value={month} onChange={(e) => setMonth(e.target.value)} className={sel}>
                <option value="">MM</option>
                {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#555D78] text-xs">▾</span>
            </div>
            {errors.month && <p className="mt-1 text-xs text-rose-400">{errors.month}</p>}
          </div>

          {/* Year */}
          <div>
            <label className={lbl}>Year</label>
            <div className="relative">
              <select value={year} onChange={(e) => setYear(e.target.value)} className={sel}>
                <option value="">YY</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#555D78] text-xs">▾</span>
            </div>
            {errors.year && <p className="mt-1 text-xs text-rose-400">{errors.year}</p>}
          </div>

          {/* CVV */}
          <div>
            <label className={lbl}>CVV</label>
            <input
              type="password"
              inputMode="numeric"
              placeholder="•••"
              value={cvv}
              maxLength={4}
              onFocus={() => setFlipped(true)}
              onBlur={() => setFlipped(false)}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className={inp}
            />
            {errors.cvv && <p className="mt-1 text-xs text-rose-400">{errors.cvv}</p>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            type="submit"
            isLoading={saving}
            className="flex-1 bg-indigo-600 font-semibold text-white hover:bg-indigo-500"
          >
            {submitLabel}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="border border-[#2A2E3E] text-[#8B91A8] hover:text-[#E8EAF0]"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default InteractiveCardForm;
