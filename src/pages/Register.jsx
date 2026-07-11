import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Alert, Button } from '@heroui/react';
import { register } from '../services/authService';
import { clearAuthError, setCredentials } from '../redux/slices/authSlice';

const features = [
  { icon: '🚀', text: 'Fast and reliable delivery' },
  { icon: '🔒', text: 'Secure encrypted checkout' },
  { icon: '✨', text: 'Curated smart catalog' },
];

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    dispatch(clearAuthError());

    if (!formData.name || !formData.email || !formData.password) {
      setError('Name, email, and password are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const userData = await register(formData);
      dispatch(setCredentials(userData));
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-split-shell">
      {/* ── Left panel ── */}
      <div className="auth-left-panel">
        <div className="auth-orb-a" />
        <div className="auth-orb-b" />
        <div className="auth-grid-overlay" />

        <div className="auth-left-content">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 font-syne text-xl font-bold text-white shadow-lg shadow-indigo-500/30">
            SC
          </div>
          <h2 className="font-syne text-2xl font-bold text-[#E8EAF0]">Welcome to SmartCart</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#555D78]">
            Join thousands of smart shoppers. Start discovering curated products today.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {features.map((f) => (
              <div
                key={f.text}
                className="flex items-center gap-3 rounded-xl border border-[#2A2E3E] bg-[#1C1F29] px-4 py-3 text-left"
              >
                <span className="text-base">{f.icon}</span>
                <span className="text-sm text-[#8B91A8]">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-right-panel">
        <div className="auth-form-wrap">
          <h1 className="font-syne text-2xl font-bold text-[#E8EAF0]">Create Account</h1>
          <p className="mt-1 mb-7 text-sm text-[#555D78]">Join SmartCart today. It&apos;s free.</p>

          {error && (
            <Alert status="danger" className="mb-5">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div>
              <p className="mb-2 text-xs font-medium text-[#8B91A8]">I want to</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'customer', label: 'Shop', desc: 'Browse & buy products' },
                  { value: 'seller',   label: 'Sell', desc: 'List & manage products' },
                ].map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, role: value }))}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      formData.role === value
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                        : 'border-[#2A2E3E] bg-[#1C1F29] text-[#8B91A8] hover:border-[#3A3F55]'
                    }`}
                  >
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="mt-0.5 text-[11px] opacity-70">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-[#8B91A8]">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full rounded-xl border border-[#2A2E3E] bg-[#1C1F29] px-4 py-3 text-sm text-[#E8EAF0] placeholder-[#555D78] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-[#8B91A8]">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[#2A2E3E] bg-[#1C1F29] px-4 py-3 text-sm text-[#E8EAF0] placeholder-[#555D78] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-[#8B91A8]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Choose a strong password"
                className="w-full rounded-xl border border-[#2A2E3E] bg-[#1C1F29] px-4 py-3 text-sm text-[#E8EAF0] placeholder-[#555D78] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <Button
              type="submit"
              isLoading={isSubmitting}
              className="mt-2 w-full bg-indigo-600 font-syne font-semibold text-white hover:bg-indigo-500"
              size="lg"
            >
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#555D78]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
