import { useEffect, useMemo, useState } from 'react';
import { Chart } from 'react-chartjs-2';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  BarElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { motion } from 'framer-motion';
import { Alert, Button, Chip, Spinner } from '@heroui/react';
import { getAdminAnalytics, getAdminOrders, getAdminUsers } from '../../services/adminService';
import { formatCurrency } from '../../utils/format';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Filler
);

const cardContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
};

const statusStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const statusCell = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

const orderStatusChip = {
  paid: { label: 'Paid', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  delivered: { label: 'Delivered', color: 'accent' },
  cancelled: { label: 'Cancelled', color: 'danger' },
  unpaid: { label: 'Unpaid', color: 'warning' },
};

const CountUp = ({ value = 0, prefix = '', suffix = '', decimals = 0 }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value || 0);
    const duration = 1000;
    const start = performance.now();
    let frameId = null;

    const easeOut = (t) => 1 - (1 - t) ** 3;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = easeOut(progress);
      setDisplay(target * eased);
      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
};

const iconSet = {
  wave: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 15c2.8-3.5 5.6-3.5 8.4 0 2.8 3.5 5.6 3.5 8.4 0" />
      <path d="M3 9c2.8 3.5 5.6 3.5 8.4 0 2.8-3.5 5.6-3.5 8.4 0" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  clipboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <path d="M9 4h6v3H9z" />
    </svg>
  ),
  people: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M14 19c0-2.3 1.7-4.2 4-4.7" />
    </svg>
  ),
};

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [analyticsData, ordersData, usersData] = await Promise.all([
          getAdminAnalytics(),
          getAdminOrders(),
          getAdminUsers(),
        ]);
        setAnalytics(analyticsData);
        setOrders(ordersData);
        setUsers(usersData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const revenueByDay = analytics?.revenueByDay || [];
  const ordersByStatus = analytics?.ordersByStatus || {
    paid: 0,
    unpaid: 0,
    delivered: 0,
    pending: 0,
  };
  const userRoleCounts = analytics?.userRoleCounts || {
    customer: 0,
    seller: 0,
    admin: 0,
    support: 0,
  };

  const totalUsers = users.length || Object.values(userRoleCounts).reduce((sum, item) => sum + Number(item || 0), 0);
  const totalOrders = orders.length;
  const paidOrders = Number(ordersByStatus.paid || 0);
  const pendingDelivery = Number(ordersByStatus.pending || 0);

  const chartData = useMemo(() => {
    const labels = revenueByDay.map((item) =>
      new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: '2-digit' })
    );
    const values = revenueByDay.map((item) => Number(item.revenue || 0));

    return {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Revenue',
          data: values,
          backgroundColor: 'rgba(99,102,241,0.25)',
          borderColor: 'rgba(99,102,241,0.8)',
          borderWidth: 1.5,
          borderRadius: 5,
        },
        {
          type: 'line',
          label: 'Trend',
          data: values,
          borderColor: '#818CF8',
          borderWidth: 1.5,
          tension: 0.4,
          fill: false,
          pointRadius: 2,
          pointHoverRadius: 3,
          pointBackgroundColor: '#818CF8',
        },
      ],
    };
  }, [revenueByDay]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1C1F29',
          borderColor: '#2A2E3E',
          borderWidth: 1,
          titleColor: '#E8EAF0',
          bodyColor: '#8B91A8',
          callbacks: {
            label: (ctx) => formatCurrency(ctx.parsed.y || 0),
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(42,46,62,0.6)' },
          ticks: { color: '#555D78' },
        },
        y: {
          grid: { color: 'rgba(42,46,62,0.6)' },
          ticks: {
            color: '#555D78',
            callback: (v) => `$${v}`,
          },
        },
      },
    }),
    []
  );

  const recentOrders = useMemo(() => orders.slice(0, 6), [orders]);

  const roleRows = [
    { label: 'Customers', key: 'customer', color: 'var(--accent)' },
    { label: 'Sellers', key: 'seller', color: 'var(--green)' },
    { label: 'Admins', key: 'admin', color: 'var(--amber)' },
    { label: 'Support', key: 'support', color: 'var(--blue)' },
  ];

  const getOrderStatus = (order) => {
    if (order.isDelivered) {
      return 'delivered';
    }
    if (order.isPaid) {
      return 'paid';
    }
    return 'pending';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="admin-analytics"
    >
      {loading && (
        <div className="flex items-center justify-center py-10">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content><Alert.Description>{error}</Alert.Description></Alert.Content>
        </Alert>
      )}

      {!loading && !error && (
        <>
          <motion.div variants={cardContainerVariants} initial="hidden" animate="visible" className="kpi-grid">
            <motion.article variants={cardVariants} className="kpi-card">
              <div className="kpi-accent" style={{ background: 'var(--accent)' }} />
              <p className="kpi-label">Total Revenue</p>
              <div className="kpi-value">$2,798</div>
              <div className="kpi-meta">
                <span className="kpi-pill green">+12.4%</span>
                <span className="kpi-sub">All tracked days</span>
              </div>
            </motion.article>

            <motion.article variants={cardVariants} className="kpi-card">
              <div className="kpi-accent" style={{ background: 'var(--green)' }} />
              <p className="kpi-label">Total Orders</p>
              <div className="kpi-value">
                <CountUp value={totalOrders} decimals={0} />
              </div>
              <div className="kpi-meta">
                <span className="kpi-pill amber">New today</span>
                <span className="kpi-sub">From analytics feed</span>
              </div>
            </motion.article>

            <motion.article variants={cardVariants} className="kpi-card">
              <div className="kpi-accent" style={{ background: 'var(--amber)' }} />
              <p className="kpi-label">Paid Orders</p>
              <div className="kpi-value">
                <CountUp value={paidOrders} decimals={0} />
              </div>
              <div className="kpi-meta">
                <span className="kpi-pill red">Needs attention</span>
                <span className="kpi-sub">Completed payments</span>
              </div>
            </motion.article>

            <motion.article variants={cardVariants} className="kpi-card">
              <div className="kpi-accent" style={{ background: 'var(--red)' }} />
              <p className="kpi-label">Pending Delivery</p>
              <div className="kpi-value">
                <CountUp value={pendingDelivery} decimals={0} />
              </div>
              <div className="kpi-meta">
                <span className="kpi-pill blue">Active</span>
                <span className="kpi-sub">Not delivered yet</span>
              </div>
            </motion.article>
          </motion.div>

          <div className="analytics-row analytics-row-top">
            <motion.section
              className="admin-panel"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <header className="panel-header">
                <h3>
                  <span className="panel-icon">{iconSet.wave}</span>
                  Revenue by Day
                </h3>
                <Button type="button" size="sm" variant="ghost" className="panel-link text-xs">
                  Export CSV
                </Button>
              </header>
              <div className="chart-wrap">
                <Chart type="bar" data={chartData} options={chartOptions} />
              </div>
            </motion.section>

            <section className="admin-panel">
              <header className="panel-header">
                <h3>
                  <span className="panel-icon">{iconSet.clock}</span>
                  Order Status
                </h3>
              </header>
              <motion.div variants={statusStagger} initial="hidden" animate="visible" className="status-grid">
                <motion.div variants={statusCell} className="status-cell">
                  <p>Paid</p>
                  <h4 className="status-green-text">{ordersByStatus.paid}</h4>
                </motion.div>
                <motion.div variants={statusCell} className="status-cell">
                  <p>Unpaid</p>
                  <h4 className="status-amber-text">{ordersByStatus.unpaid}</h4>
                </motion.div>
                <motion.div variants={statusCell} className="status-cell">
                  <p>Pending</p>
                  <h4 className="status-red-text">{ordersByStatus.pending}</h4>
                </motion.div>
                <motion.div variants={statusCell} className="status-cell">
                  <p>Delivered</p>
                  <h4 className="status-default-text">{ordersByStatus.delivered}</h4>
                </motion.div>
              </motion.div>
            </section>
          </div>

          <div className="analytics-row analytics-row-bottom">
            <section className="admin-panel">
              <header className="panel-header">
                <h3>
                  <span className="panel-icon">{iconSet.clipboard}</span>
                  Recent Orders
                </h3>
                <Button type="button" size="sm" variant="ghost" className="panel-link text-xs">
                  View all
                </Button>
              </header>
              <div className="orders-table-wrap">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => {
                      const status = getOrderStatus(order);
                      const chip = orderStatusChip[status] || { label: status, color: 'default' };
                      return (
                        <tr key={order._id}>
                          <td className="order-id">#{order._id.slice(-6)}</td>
                          <td>{order.user?.name || order.user?.email || 'Guest'}</td>
                          <td>{formatCurrency(order.totalPrice || 0)}</td>
                          <td>
                            <Chip size="sm" color={chip.color} variant="soft">{chip.label}</Chip>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="admin-panel">
              <header className="panel-header">
                <h3>
                  <span className="panel-icon">{iconSet.people}</span>
                  User Roles
                </h3>
              </header>
              <div className="roles-wrap">
                {roleRows.map((role) => {
                  const count = Number(userRoleCounts[role.key] || 0);
                  const width = totalUsers > 0 ? (count / totalUsers) * 100 : 0;
                  return (
                    <div key={role.key} className="role-row">
                      <div className="role-left">
                        <span className="role-dot" style={{ background: role.color }} />
                        <span className="role-name">{role.label}</span>
                        <div className="role-bar">
                          <div className="role-bar-fill" style={{ width: `${width}%`, background: role.color }} />
                        </div>
                      </div>
                      <span className="role-count">
                        <CountUp value={count} decimals={0} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default AdminAnalytics;
