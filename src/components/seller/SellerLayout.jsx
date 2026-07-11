import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { logout } from '../../redux/slices/authSlice';

const icons = {
  dashboard: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="5" rx="1" />
      <rect x="13" y="10" width="8" height="11" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" />
    </svg>
  ),
  products: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 7h12l-1 12H7L6 7Z" /><path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  ),
  add: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" />
    </svg>
  ),
  orders: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  ),
  inventory: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-6 9 6v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="M9 22V12h6v10" />
    </svg>
  ),
  bell: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7" /><path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  ),
  payment: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
    </svg>
  ),
  store: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-6 9 6v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
    </svg>
  ),
  logout: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

const navSections = [
  {
    label: 'OVERVIEW',
    items: [{ to: '/seller', label: 'Dashboard', icon: 'dashboard', end: true }],
  },
  {
    label: 'PRODUCTS',
    items: [
      { to: '/seller/products', label: 'My Products', icon: 'products' },
      { to: '/seller/products/new', label: 'Add Product', icon: 'add' },
    ],
  },
  {
    label: 'SALES',
    items: [{ to: '/seller/orders', label: 'Orders', icon: 'orders' }],
  },
  {
    label: 'STOCK',
    items: [{ to: '/seller/inventory', label: 'Inventory', icon: 'inventory' }],
  },
  {
    label: 'ACCOUNT',
    items: [
      { to: '/notifications', label: 'Notifications', icon: 'bell' },
      { to: '/seller/payment-settings', label: 'Payment Settings', icon: 'payment' },
    ],
  },
];

const SellerLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  return (
    <div className="flex min-h-screen bg-[#0A0B0F]">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-[#2A2E3E] bg-[#0D0F14]">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-[#2A2E3E] px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-syne text-xs font-bold text-white">
            SC
          </div>
          <div>
            <p className="font-syne text-sm font-bold text-[#E8EAF0]">SmartCart</p>
            <p className="text-[10px] text-[#555D78]">Seller Console</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="mb-1.5 px-2 text-[9px] font-bold uppercase tracking-widest text-[#3A3F55]">
                {section.label}
              </p>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className="relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                  style={({ isActive }) => ({
                    color: isActive ? '#C9CEFF' : '#8B91A8',
                    backgroundColor: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="seller-nav-indicator"
                          className="absolute left-0 top-1 h-[calc(100%-8px)] w-0.5 rounded-full bg-indigo-500"
                        />
                      )}
                      <span className={isActive ? 'text-indigo-400' : 'text-[#555D78]'}>
                        {icons[item.icon]}
                      </span>
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-[#2A2E3E] p-3">
          <div className="mb-3 flex items-center gap-2.5 rounded-lg bg-[#1C1F29] px-3 py-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
              {(userInfo?.name || 'S')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[#E8EAF0]">{userInfo?.name || 'Seller'}</p>
              <p className="text-[10px] uppercase tracking-wide text-[#555D78]">seller</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#2A2E3E] py-1.5 text-xs text-[#8B91A8] transition hover:border-[#3A3F55] hover:text-[#E8EAF0]"
            >
              {icons.store} Store
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 py-1.5 text-xs text-rose-300 transition hover:bg-rose-500/20"
            >
              {icons.logout} Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default SellerLayout;
