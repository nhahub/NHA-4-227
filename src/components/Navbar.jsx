import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Badge, Button, Chip } from '@heroui/react';
import { logout } from '../redux/slices/authSlice';
import NotificationBell from './NotificationBell';
import UserAvatar from './UserAvatar';

const ShoppingCartIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const navItemClass = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 text-[13px] font-medium transition ${
    isActive
      ? 'bg-indigo-600 text-white'
      : 'text-[#8B91A8] hover:bg-[#1C1F29] hover:text-[#E8EAF0]'
  }`;

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartCount = useSelector((state) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0)
  );
  const userInfo = useSelector((state) => state.auth.userInfo);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-[100] border-b border-[#2A2E3E] bg-[#0E0F13]/95 backdrop-blur-xl">
      <div className="flex h-14 w-full items-center justify-between gap-3 px-6">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 font-syne text-xs font-bold text-white">
            SC
          </span>
          <span className="font-syne text-sm font-bold text-[#E8EAF0]">SmartCart</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={navItemClass}>Home</NavLink>
          <NavLink to="/products" className={navItemClass}>Products</NavLink>

          {/* Cart — guests and customers only */}
          {(!userInfo || userInfo.role === 'customer') && (
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                `relative inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition ${
                  isActive
                    ? 'border-indigo-500/60 bg-indigo-600/20 text-indigo-300'
                    : 'border-[#2A2E3E] bg-[#1C1F29] text-[#8B91A8] hover:text-[#E8EAF0]'
                }`
              }
            >
              <ShoppingCartIcon />
              Cart
              {cartCount > 0 && (
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </NavLink>
          )}

          {userInfo ? (
            <>
              <NotificationBell />

              {/* User name chip */}
              <Chip
                size="sm"
                variant="secondary"
                className="hidden sm:inline-flex cursor-default select-none"
              >
                {userInfo.name}
              </Chip>

              <NavLink to="/profile" className={navItemClass}>Profile</NavLink>

              {/* My Orders — customers only */}
              {userInfo.role === 'customer' && (
                <NavLink to="/my-orders" className={navItemClass}>My Orders</NavLink>
              )}

              {userInfo.role === 'customer' && (
                <NavLink to="/support" className={navItemClass}>Support</NavLink>
              )}

              {userInfo.role === 'admin' && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `rounded-lg border px-3 py-1.5 text-[13px] font-medium transition ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-indigo-500/25 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
                    }`
                  }
                >
                  Admin
                </NavLink>
              )}

              {userInfo.role === 'seller' && (
                <NavLink to="/seller" className={navItemClass}>Seller</NavLink>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-[#8B91A8] transition hover:bg-[#1C1F29] hover:text-rose-400"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navItemClass}>Login</NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `rounded-lg border px-3 py-1.5 text-[13px] font-medium transition ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
                  }`
                }
              >
                Sign Up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
