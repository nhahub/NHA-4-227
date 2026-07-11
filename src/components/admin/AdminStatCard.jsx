import { Card } from '@heroui/react';

const accentMap = {
  blue:    'from-blue-500/10',
  teal:    'from-teal-500/10',
  emerald: 'from-emerald-500/10',
  violet:  'from-violet-500/10',
  amber:   'from-amber-500/10',
  slate:   'from-slate-500/10',
};

const textMap = {
  blue:    'text-blue-400',
  teal:    'text-teal-400',
  emerald: 'text-emerald-400',
  violet:  'text-violet-400',
  amber:   'text-amber-400',
  slate:   'text-slate-400',
};

const AdminStatCard = ({ title, value, subtitle, accent = 'blue' }) => (
  <Card
    className={`rounded-2xl border border-[var(--border)] bg-gradient-to-br ${accentMap[accent] ?? accentMap.blue} to-[var(--bg2)] p-5 shadow-sm`}
    variant="transparent"
  >
    <p className="text-sm font-medium text-[var(--text2)]">{title}</p>
    <h3 className={`mt-2 font-syne text-2xl font-bold ${textMap[accent] ?? textMap.blue}`}>
      {value}
    </h3>
    {subtitle && <p className="mt-1 text-xs text-[var(--text3)]">{subtitle}</p>}
  </Card>
);

export default AdminStatCard;
