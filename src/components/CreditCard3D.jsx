import { useEffect } from 'react';

/* Injected once into <head> — pure CSS for 3D mechanics & gradients */
const CARD_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');

.cc3d-scene {
  width: 100%; max-width: 380px; height: 230px;
  perspective: 1200px; margin: 0 auto; position: relative;
}
.cc3d-flipper {
  position: relative; width: 100%; height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1);
}
.cc3d-flipper.cc3d-flipped { transform: rotateY(180deg); }
.cc3d-face {
  position: absolute; inset: 0; border-radius: 18px;
  backface-visibility: hidden; -webkit-backface-visibility: hidden;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07),
              inset 0 1px 0 rgba(255,255,255,0.12);
}
.cc3d-back-face { transform: rotateY(180deg); }
.cc3d-bg {
  position: absolute; inset: 0; border-radius: 18px;
  background: linear-gradient(135deg, #0d1b3e 0%, #1a1060 42%, #0d0826 100%);
  z-index: 0;
}
.cc3d-glow {
  position: absolute; inset: 0; border-radius: 18px; z-index: 1;
  background:
    radial-gradient(ellipse at 28% 38%, rgba(99,102,241,0.38) 0%, transparent 58%),
    radial-gradient(ellipse at 82% 72%, rgba(139,92,246,0.22) 0%, transparent 50%);
}
.cc3d-shine {
  position: absolute; inset: 0; border-radius: 18px; z-index: 2;
  background:
    linear-gradient(108deg, transparent 22%, rgba(255,255,255,0.045) 42%, transparent 62%),
    linear-gradient(198deg, transparent 22%, rgba(255,255,255,0.03)  42%, transparent 62%);
}
.cc3d-front-content {
  position: absolute; inset: 0; z-index: 3;
  padding: 22px 26px 20px;
  display: flex; flex-direction: column; justify-content: space-between;
}
.cc3d-chip {
  width: 42px; height: 32px; border-radius: 6px; flex-shrink: 0;
  background: linear-gradient(135deg,#d4a843 0%,#f5d47a 35%,#c8992e 65%,#e8c455 100%);
  position: relative; box-shadow: 0 2px 6px rgba(0,0,0,0.4); overflow: hidden;
}
.cc3d-chip::before {
  content: ''; position: absolute; inset: 0;
  background:
    repeating-linear-gradient(0deg,  transparent, transparent 7px, rgba(0,0,0,0.18) 7px, rgba(0,0,0,0.18) 8px),
    repeating-linear-gradient(90deg, transparent, transparent 7px, rgba(0,0,0,0.18) 7px, rgba(0,0,0,0.18) 8px);
}
.cc3d-chip::after {
  content: ''; position: absolute; left: 50%; top: 50%;
  transform: translate(-50%,-50%);
  width: 14px; height: 14px; border-radius: 2px;
  border: 1.5px solid rgba(0,0,0,0.25);
  background: linear-gradient(135deg, rgba(255,255,255,0.3), transparent);
}
.cc3d-number {
  font-family: 'Space Mono', monospace;
  font-size: 20px; letter-spacing: 3px;
  color: rgba(255,255,255,0.92);
  text-shadow: 0 1px 3px rgba(0,0,0,0.4);
  display: flex; gap: 14px;
}
.cc3d-number span { min-width: 52px; }
.cc3d-label {
  font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
  color: rgba(255,255,255,0.38); font-weight: 600; font-family: sans-serif;
}
.cc3d-holder {
  font-size: 14px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
  color: rgba(255,255,255,0.9); max-width: 200px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.cc3d-expiry {
  font-family: 'Space Mono', monospace; font-size: 13px; color: rgba(255,255,255,0.9);
}
.cc3d-brand {
  font-family: 'Times New Roman', serif; font-size: 26px; font-weight: 900;
  font-style: italic; color: #fff; letter-spacing: -2px;
  text-shadow: 0 2px 6px rgba(0,0,0,0.3); line-height: 1; padding-bottom: 2px;
}
.cc3d-back-content {
  position: absolute; inset: 0; z-index: 3; display: flex; flex-direction: column;
}
.cc3d-mag { width: 100%; height: 44px; background: linear-gradient(180deg,#1a1a1a,#333,#111); margin-top: 28px; }
.cc3d-sig-area { display: flex; align-items: center; margin: 14px 22px 0; gap: 10px; }
.cc3d-sig-strip {
  flex: 1; height: 36px; border-radius: 3px;
  background: repeating-linear-gradient(
    -55deg,
    #e8e8e8 0px,#e8e8e8 6px, #fff 6px,#fff 12px,
    #f5c5c5 12px,#f5c5c5 18px, #fff 18px,#fff 24px
  );
  display: flex; align-items: center; padding: 0 10px;
  font-size: 11px; color: rgba(0,0,0,0.28); font-style: italic;
}
.cc3d-cvv-box {
  background: #fff; border-radius: 4px; padding: 6px 14px;
  min-width: 56px; text-align: center;
  font-family: 'Space Mono', monospace; font-size: 15px; color: #111;
  letter-spacing: 3px;
}
.cc3d-cvv-hint {
  font-size: 9px; color: rgba(255,255,255,0.35); letter-spacing: 2px;
  text-align: right; margin: 4px 22px 0; text-transform: uppercase;
  font-family: sans-serif;
}
.cc3d-back-brand {
  position: absolute; bottom: 14px; left: 22px;
  font-family: 'Times New Roman', serif; font-size: 18px;
  font-weight: 900; font-style: italic; color: rgba(255,255,255,0.45); letter-spacing: -1px;
}
.cc3d-back-bank {
  position: absolute; bottom: 16px; right: 22px;
  font-size: 9px; letter-spacing: 3px; text-transform: uppercase;
  color: rgba(255,255,255,0.28); font-family: sans-serif;
}
`;

let cssInjected = false;
function injectCSS() {
  if (cssInjected || document.getElementById('cc3d-styles')) { cssInjected = true; return; }
  const style = document.createElement('style');
  style.id = 'cc3d-styles';
  style.textContent = CARD_CSS;
  document.head.appendChild(style);
  cssInjected = true;
}

const formatGroups = (raw = '') => {
  const digits = raw.replace(/\D/g, '');
  const groups = [];
  for (let i = 0; i < 4; i++) {
    const chunk = digits.slice(i * 4, i * 4 + 4);
    groups.push(chunk ? chunk.padEnd(4, '•') : '••••');
  }
  return groups;
};

export const detectBrand = (rawNumber = '') => {
  const n = rawNumber.replace(/\D/g, '');
  if (/^4/.test(n)) return 'VISA';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'MC';
  if (/^3[47]/.test(n)) return 'AMEX';
  if (/^6(?:011|5)/.test(n)) return 'DISC';
  return 'VISA';
};

const BrandLogo = ({ brand }) => {
  if (brand === 'MC') return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#eb001b', opacity: 0.9 }} />
      <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#f79e1b', opacity: 0.9, marginLeft: -13 }} />
    </div>
  );
  if (brand === 'AMEX') return (
    <span style={{ fontFamily: 'sans-serif', fontSize: 13, fontWeight: 900, color: '#fff', letterSpacing: 1, opacity: 0.85 }}>AMEX</span>
  );
  if (brand === 'DISC') return (
    <span style={{ fontFamily: 'sans-serif', fontSize: 12, fontWeight: 900, color: '#f76f20', letterSpacing: 1 }}>DISCOVER</span>
  );
  return <span className="cc3d-brand">VISA</span>;
};

/**
 * CreditCard3D
 * Props:
 *   cardNumber  – raw digits string (live input value)
 *   cardName    – string
 *   expiry      – "MM/YY"
 *   cvv         – raw digits string (used for back display)
 *   flipped     – boolean
 *   mini        – boolean (smaller variant for display-only)
 */
const CreditCard3D = ({
  cardNumber = '',
  cardName = '',
  expiry = '',
  cvv = '',
  flipped = false,
  mini = false,
}) => {
  useEffect(() => { injectCSS(); }, []);

  const groups  = formatGroups(cardNumber);
  const brand   = detectBrand(cardNumber);
  const nameStr = cardName.trim().toUpperCase() || 'FULL NAME';
  const expiryStr = expiry || 'MM/YY';
  const cvvDots = cvv ? '•'.repeat(Math.min(cvv.length, 4)) : '•••';

  const sceneStyle = mini
    ? { maxWidth: 320, height: 195 }
    : {};

  return (
    <div className="cc3d-scene" style={sceneStyle}>
      <div className={`cc3d-flipper${flipped ? ' cc3d-flipped' : ''}`}>

        {/* ── FRONT ── */}
        <div className="cc3d-face">
          <div className="cc3d-bg" />
          <div className="cc3d-glow" />
          <div className="cc3d-shine" />
          <div className="cc3d-front-content">
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>
                SmartCard
              </span>
              {/* Contactless */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2">
                <path d="M1.5 8.5a15 15 0 0 1 21 0"/>
                <path d="M5 12.5a10 10 0 0 1 14 0"/>
                <path d="M8.5 16.5a5 5 0 0 1 7 0"/>
                <circle cx="12" cy="20" r="1" fill="rgba(255,255,255,0.45)" stroke="none"/>
              </svg>
            </div>

            {/* Chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="cc3d-chip" />
            </div>

            {/* Number */}
            <div className="cc3d-number">
              {groups.map((g, i) => <span key={i}>{g}</span>)}
            </div>

            {/* Bottom row */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <div className="cc3d-label">Card Holder</div>
                <div className="cc3d-holder">{nameStr}</div>
              </div>
              <div>
                <div className="cc3d-label">Expires</div>
                <div className="cc3d-expiry">{expiryStr}</div>
              </div>
              <BrandLogo brand={brand} />
            </div>
          </div>
        </div>

        {/* ── BACK ── */}
        <div className="cc3d-face cc3d-back-face">
          <div className="cc3d-bg" />
          <div className="cc3d-glow" />
          <div className="cc3d-shine" />
          <div className="cc3d-back-content">
            <div className="cc3d-mag" />
            <div className="cc3d-sig-area">
              <div className="cc3d-sig-strip">Authorized Signature</div>
              <div className="cc3d-cvv-box">{cvvDots}</div>
            </div>
            <div className="cc3d-cvv-hint">CVV</div>
            <div className="cc3d-back-brand">
              <BrandLogo brand={brand} />
            </div>
            <div className="cc3d-back-bank">SmartCard Bank</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreditCard3D;
