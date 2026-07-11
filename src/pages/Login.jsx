import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Alert, Button, Card } from '@heroui/react';
import { login } from '../services/authService';
import { clearAuthError, setCredentials } from '../redux/slices/authSlice';

const features = [
  { icon: '🚀', text: 'Fast and reliable delivery' },
  { icon: '🔒', text: 'Secure encrypted checkout' },
  { icon: '✨', text: 'Curated smart catalog' },
];

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
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

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const userData = await login(formData);
      dispatch(setCredentials(userData));
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
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
            Your premium shopping destination. Discover curated products and seamless checkout.
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
          <h1 className="font-syne text-2xl font-bold text-[#E8EAF0]">Sign In</h1>
          <p className="mt-1 mb-7 text-sm text-[#555D78]">Access your SmartCart account.</p>

          {error && (
            <Alert status="danger" className="mb-5">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#2A2E3E] bg-[#1C1F29] px-4 py-3 text-sm text-[#E8EAF0] placeholder-[#555D78] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <Button
              type="submit"
              isLoading={isSubmitting}
              className="mt-2 w-full bg-indigo-600 font-syne font-semibold text-white hover:bg-indigo-500"
              size="lg"
            >
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#555D78]">
            New here?{' '}
            <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
