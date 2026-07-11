import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Badge, Chip } from '@heroui/react';
import { getAdminOrders, getAdminProducts, getAdminUsers, getPendingProducts } from '../../services/adminService';
import { logout } from '../../redux/slices/authSlice';
import UserAvatar from '../UserAvatar';

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="5" rx="1" />
      <rect x="13" y="10" width="8" height="11" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
    </svg>
  ),
  analytics: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 17c3-5 6-5 9 0s6 5 9 0" />
      <path d="M3 7c3 5 6 5 9 0s6-5 9 0" />
    </svg>
  ),
  products: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 7h12l-1 12H7L6 7Z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  ),
  orders: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M14 19c0-2.3 1.7-4.2 4-4.7" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3.5" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6Z" />
    </svg>
  ),
  support: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 13a8 8 0 1 1 16 0" />
      <path d="M4 13v3a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2Zm16 0v3a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2Z" />
      <path d="M9 18a3 3 0 0 0 6 0" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4 20c1.8-3.3 4.4-5 8-5s6.2 1.7 8 5" />
    </svg>
  ),
};

const baseNavSections = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
      { to: '/admin/analytics', label: 'Analytics', icon: 'analytics' },
    ],
  },
  {
    label: 'MANAGE',
    items: [
      { to: '/admin/products', label: 'Products', icon: 'products' },
      { to: '/admin/product-requests', label: 'Product Requests', icon: 'products', pendingBadge: true },
      { to: '/admin/categories', label: 'Categories', icon: 'products' },
      { to: '/admin/orders', label: 'Orders', icon: 'orders', badge: true },
      { to: '/admin/users', label: 'Users', icon: 'users' },
      { to: '/admin/create-user', label: 'Create User', icon: 'users' },
    ],
  },
];

const pageTitleMap = {
  '/admin': { title: 'Dashboard', subtitle: 'Overview / Metrics' },
  '/admin/analytics': { title: 'Analytics', subtitle: 'Overview / Analytics' },
  '/admin/products': { title: 'Products', subtitle: 'Manage / Catalog' },
  '/admin/product-requests': { title: 'Product Requests', subtitle: 'Manage / Approvals' },
  '/admin/categories': { title: 'Categories', subtitle: 'Manage / Categories' },
  '/admin/orders': { title: 'Orders', subtitle: 'Manage / Orders' },
  '/admin/users': { title: 'Users', subtitle: 'Manage / Users' },
  '/admin/create-user': { title: 'Create User', subtitle: 'Manage / Users / Create' },
  '/admin/settings': { title: 'Settings', subtitle: 'System / Configuration' },
  '/admin/support': { title: 'Support Tickets', subtitle: 'System / Support Desk' },
};

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [liveDate, setLiveDate] = useState(new Date());
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const topbarMenusRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const [orderData, userData, productData, pendingData, changesData] = await Promise.all([
          getAdminOrders(),
          getAdminUsers(),
          getAdminProducts(),
          getPendingProducts('pending'),
          getPendingProducts('needs_changes'),
        ]);
        setOrders(orderData);
        setUsers(userData);
        setProducts(productData);
        setPendingCount(pendingData.length + changesData.length);
      } catch {
        setOrders([]); setUsers([]); setProducts([]); setPendingCount(0);
      }
    })();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setLiveDate(new Date()), 60000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) { setSearchResults([]); return; }

    const results = [
      ...orders
        .filter((o) =>
          String(o._id).toLowerCase().includes(q) ||
          String(o.user?.name || o.user?.email || '').toLowerCase().includes(q)
        )
        .map((o) => ({
          type: 'Order',
          label: `#${String(o._id).slice(0, 8)} – ${o.user?.name || o.user?.email || 'Guest'}`,
          path: '/admin/orders',
        })),
      ...users
        .filter((u) =>
          String(u.name).toLowerCase().includes(q) ||
          String(u.email).toLowerCase().includes(q)
        )
        .map((u) => ({ type: 'User', label: `${u.name} – ${u.email}`, path: '/admin/users' })),
      ...products
        .filter((p) => String(p.name).toLowerCase().includes(q))
        .map((p) => ({ type: 'Product', label: p.name, path: '/admin/products' })),
    ].slice(0, 8);

    setSearchResults(results);
    setShowResults(true);
  }, [searchQuery, orders, users, products]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (topbarMenusRef.current && !topbarMenusRef.current.contains(e.target)) {
        setShowNotifs(false);
        setShowProfile(false);
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const pageMeta = useMemo(
    () => pageTitleMap[location.pathname] || { title: 'Admin', subtitle: 'Control Center' },
    [location.pathname]
  );

  const navSections = useMemo(() => {
    if (userInfo?.role === 'support') {
      return [{ label: 'SYSTEM', items: [{ to: '/admin/support', label: 'Support Tickets', icon: 'support' }] }];
    }
    return [
      ...baseNavSections,
      {
        label: 'SYSTEM',
        items: [
          { to: '/admin/settings', label: 'Settings', icon: 'settings' },
          { to: '/admin/support', label: 'Support Tickets', icon: 'support' },
        ],
      },
    ];
  }, [userInfo?.role]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="admin-shell admin-layout">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-logo-wrap">
          <div className="admin-logo-badge">SC</div>
          <div>
            <p className="admin-logo-title">SmartCart</p>
            <p className="admin-logo-sub">Admin Console</p>
          </div>
        </div>

        <div className="admin-nav-wrap">
          {navSections.map((section) => (
            <div key={section.label} className="admin-nav-section">
              <p className="admin-nav-label">{section.label}</p>
              <div className="admin-nav-list">
                {section.items.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.end} className="admin-nav-link">
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div layoutId="admin-nav-indicator" className="admin-nav-indicator" />
                        )}
                        <span className="admin-nav-icon">{icons[item.icon]}</span>
                        <span className="admin-nav-text">{item.label}</span>
                        {item.badge && orders.length > 0 && (
                          <span className="admin-nav-badge">{orders.length}</span>
                        )}
                        {item.pendingBadge && pendingCount > 0 && (
                          <span className="admin-nav-badge">{pendingCount}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="admin-sidebar-footer">
          <UserAvatar user={userInfo} size="sm" />
          <div>
            <p className="admin-user-name">{userInfo?.name || 'Admin'}</p>
            <p className="admin-user-role capitalize">{userInfo?.role || 'admin'}</p>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <p className="admin-page-title">{pageMeta.title}</p>
            <p className="admin-page-subtitle">{pageMeta.subtitle}</p>
          </div>

          <div className="admin-topbar-right" ref={topbarMenusRef}>
            {/* Search */}
            <div className="admin-search">
              <span className="admin-search-icon">{icons.search}</span>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onFocus={() => setShowResults(searchResults.length > 0)}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {showResults && searchResults.length > 0 && (
              <div className="admin-dropdown admin-search-dropdown">
                {searchResults.map((result, i) => (
                  <button
                    key={`${result.type}-${i}`}
                    type="button"
                    className="admin-dropdown-row"
                    onClick={() => { navigate(result.path); setShowResults(false); setSearchQuery(''); }}
                  >
                    <span className="admin-search-type">{result.type}</span>
                    <span>{result.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Notifications */}
            <button
              type="button"
              className="admin-icon-btn"
              onClick={() => { setShowNotifs((p) => !p); setShowProfile(false); setShowResults(false); }}
            >
              {icons.bell}
              {orders.length > 0 && <span className="admin-dot" />}
            </button>

            {showNotifs && (
              <div className="admin-dropdown admin-notif-dropdown">
                <div className="admin-dropdown-header">Notifications</div>
                {orders.slice(0, 6).map((order) => (
                  <button key={order._id} type="button" className="admin-dropdown-row">
                    <span className="admin-notif-dot" />
                    <span className="admin-notif-text">
                      <span>New order by <strong>{order.user?.name || order.user?.email || 'Guest'}</strong></span>
                      <span className="admin-notif-sub">
                        ${Number(order.totalPrice || 0).toFixed(2)} – {order.isPaid ? 'paid' : 'unpaid'}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Profile */}
            <button
              type="button"
              className="admin-icon-btn"
              onClick={() => { setShowProfile((p) => !p); setShowNotifs(false); setShowResults(false); }}
            >
              {icons.user}
            </button>

            {showProfile && (
              <div className="admin-dropdown admin-profile-dropdown">
                <div className="admin-profile-header">
                  <UserAvatar user={userInfo} size="sm" />
                  <div>
                    <div className="admin-profile-name">{userInfo?.name}</div>
                    <div className="admin-profile-role capitalize">{userInfo?.role}</div>
                  </div>
                </div>
                {[
                  { label: 'View Profile', path: '/profile' },
                  { label: 'My Orders', path: '/my-orders' },
                  { label: 'Settings', path: '/admin/settings' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="admin-dropdown-row"
                    onClick={() => { navigate(item.path); setShowProfile(false); }}
                  >
                    {item.label}
                  </button>
                ))}
                <button type="button" className="admin-dropdown-row logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}

            <p className="admin-live-date">
              {liveDate.toLocaleString(undefined, {
                year: 'numeric', month: 'short', day: '2-digit',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
