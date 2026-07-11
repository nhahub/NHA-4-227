import { useEffect, useMemo, useState } from 'react';
import { getAdminOrders, getAdminProducts, getAdminUsers } from '../../services/adminService';
import { formatCurrency } from '../../utils/format';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AdminTable from '../../components/admin/AdminTable';
import { Alert, Card, Chip, Spinner } from '@heroui/react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const isToday = (dateValue) => {
  const date = new Date(dateValue);
  const now = new Date();

  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        const [usersData, ordersData, productsData] = await Promise.all([
          getAdminUsers(),
          getAdminOrders(),
          getAdminProducts(),
        ]);

        setUsers(usersData);
        setOrders(ordersData);
        setProducts(productsData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalUsers = users.length;
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
  const ordersToday = orders.filter((order) => isToday(order.createdAt)).length;
  const newUsersToday = users.filter((user) => isToday(user.createdAt)).length;

  const topProducts = useMemo(() => {
    const frequency = {};

    orders.forEach((order) => {
      (order.orderItems || []).forEach((item) => {
        const productId = String(item.product || '');
        if (!productId) {
          return;
        }
        frequency[productId] = (frequency[productId] || 0) + Number(item.quantity || 0);
      });
    });

    const rankedFromOrders = Object.entries(frequency)
      .map(([productId, count]) => {
        const product = products.find((p) => String(p._id) === productId);
        if (!product) {
          return null;
        }

        return {
          ...product,
          soldCount: count,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 5);

    if (rankedFromOrders.length > 0) {
      return rankedFromOrders;
    }

    return [...products]
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, 5)
      .map((product) => ({ ...product, soldCount: null }));
  }, [orders, products]);

  const recentOrders = orders.slice(0, 5);

  const revenueByDay = useMemo(() => {
    const grouped = orders.reduce((acc, order) => {
      const dateKey = new Date(order.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
      });
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, revenue: 0, orders: 0 };
      }
      acc[dateKey].revenue += Number(order.totalPrice || 0);
      acc[dateKey].orders += 1;
      return acc;
    }, {});

    return Object.values(grouped).slice(-7);
  }, [orders]);

  const ordersByDay = useMemo(
    () =>
      revenueByDay.map((item) => ({
        date: item.date,
        orders: item.orders,
      })),
    [revenueByDay]
  );

  const userRoleData = useMemo(() => {
    const roleCounts = users.reduce(
      (acc, user) => {
        const role = String(user.role || 'customer');
        if (acc[role] !== undefined) {
          acc[role] += 1;
        }
        return acc;
      },
      { customer: 0, seller: 0, admin: 0, support: 0 }
    );

    return [
      { name: 'Customer', value: roleCounts.customer },
      { name: 'Seller', value: roleCounts.seller },
      { name: 'Admin', value: roleCounts.admin },
      { name: 'Support', value: roleCounts.support },
    ].filter((item) => item.value > 0);
  }, [users]);

  const pieColors = ['#818CF8', '#10B981', '#F59E0B', '#3B82F6'];

  const chartTooltipStyle = {
    backgroundColor: '#1C1F29',
    border: '1px solid #2A2E3E',
    borderRadius: '10px',
    color: '#E8EAF0',
    fontSize: '12px',
  };

  const getCustomerName = (order) => order.user?.name || order.user?.email || 'Guest';

  const getPaymentChip = (order) =>
    order.isPaid
      ? { label: 'Paid', color: 'success' }
      : { label: 'Unpaid', color: 'warning' };

  const getDeliveryChip = (order) => {
    if (order.status === 'cancelled') return { label: 'Cancelled', color: 'danger' };
    if (order.isDelivered || order.status === 'delivered') return { label: 'Delivered', color: 'success' };
    return { label: 'Pending', color: 'accent' };
  };

  const recentOrderColumns = [
    {
      key: 'id',
      label: 'Order ID',
      render: (row) => <span className="admin-id-chip">#{String(row._id || '').slice(0, 8)}...</span>,
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (row) => <span>{getCustomerName(row)}</span>,
    },
    {
      key: 'totalPrice',
      label: 'Total',
      render: (row) => <span className="font-semibold">{formatCurrency(row.totalPrice)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const payment = getPaymentChip(row);
        const delivery = getDeliveryChip(row);
        return (
          <div className="flex flex-wrap gap-2">
            <Chip size="sm" color={payment.color} variant="soft">{payment.label}</Chip>
            <Chip size="sm" color={delivery.color} variant="soft">{delivery.label}</Chip>
          </div>
        );
      },
    },
  ];

  return (
    <section className="space-y-5">
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard title="Total Users" value={totalUsers} subtitle="Registered accounts" accent="blue" />
            <AdminStatCard title="Total Products" value={totalProducts} subtitle="Catalog items" accent="teal" />
            <AdminStatCard title="Total Orders" value={totalOrders} subtitle="All-time orders" accent="violet" />
            <AdminStatCard
              title="Total Revenue"
              value={formatCurrency(totalRevenue)}
              subtitle="Gross sales"
              accent="emerald"
            />
            <AdminStatCard title="Orders Today" value={ordersToday} subtitle="Placed today" accent="amber" />
            <AdminStatCard title="New Users Today" value={newUsersToday} subtitle="New signups" accent="blue" />
            <article className="rounded-2xl border border-[var(--border)] bg-[var(--bg2)] p-5 shadow-sm">
              <p className="text-sm font-medium text-[var(--text2)]">System Status</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="status-pulse-wrap">
                  <div className="status-pulse-ring" />
                  <div className="status-pulse-dot" />
                </div>
                <span className="font-syne text-2xl font-bold text-[var(--green)]">Operational</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--text3)]">
                {['API', 'Database', 'Payments', 'CDN'].map((s) => (
                  <div key={s}>
                    {s}: <span className="text-[var(--green)]">Healthy</span>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <Card className="border border-[#2A2E3E] bg-[#1C1F29]">
              <Card.Content className="p-5">
                <h2 className="text-lg font-bold text-[#E8EAF0]">Revenue by Day</h2>
                <div className="mt-3 h-64">
                  {revenueByDay.length === 0 ? (
                    <div className="flex h-full items-center justify-center rounded-lg border border-[#2A2E3E] bg-[#14161C]">
                      <p className="text-sm text-[#8B91A8]">No revenue data available.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueByDay}>
                        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis
                          tick={{ fill: 'var(--text3)', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                          formatter={(value) => formatCurrency(Number(value || 0))}
                          contentStyle={chartTooltipStyle}
                          labelStyle={{ color: '#E8EAF0' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="var(--accent2)"
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: '#818CF8' }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card.Content>
            </Card>

            <Card className="border border-[#2A2E3E] bg-[#1C1F29]">
              <Card.Content className="p-5">
                <h2 className="text-lg font-bold text-[#E8EAF0]">Orders by Day</h2>
                <div className="mt-3 h-64">
                  {ordersByDay.length === 0 ? (
                    <div className="flex h-full items-center justify-center rounded-lg border border-[#2A2E3E] bg-[#14161C]">
                      <p className="text-sm text-[#8B91A8]">No orders data available.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ordersByDay}>
                        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: '#E8EAF0' }} />
                        <Bar dataKey="orders" fill="var(--blue)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card.Content>
            </Card>

            <Card className="border border-[#2A2E3E] bg-[#1C1F29]">
              <Card.Content className="p-5">
                <h2 className="text-lg font-bold text-[#E8EAF0]">User Roles Distribution</h2>
                <div className="mt-3 h-64">
                  {userRoleData.length === 0 ? (
                    <div className="flex h-full items-center justify-center rounded-lg border border-[#2A2E3E] bg-[#14161C]">
                      <p className="text-sm text-[#8B91A8]">No user role data available.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: '#E8EAF0' }} />
                        <Legend wrapperStyle={{ color: '#8B91A8', fontSize: '12px' }} />
                        <Pie
                          data={userRoleData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={82}
                          innerRadius={48}
                          paddingAngle={3}
                        >
                          {userRoleData.map((entry, index) => (
                            <Cell key={`${entry.name}-${index}`} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card.Content>
            </Card>
          </div>

          <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#E8EAF0]">Recent Orders</h2>
              <AdminTable columns={recentOrderColumns} data={recentOrders} emptyText="No recent orders" />
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#E8EAF0]">Top Products</h2>
              <Card className="border border-[#2A2E3E] bg-[#1C1F29]">
                <Card.Content className="space-y-2 p-4">
                  {topProducts.length === 0 && <p className="text-sm text-[#8B91A8]">No product data available.</p>}
                  {topProducts.map((product) => (
                    <div key={product._id} className="flex items-center justify-between rounded-lg bg-[#14161C] px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold text-[#E8EAF0]">{product.name}</p>
                        <p className="text-xs text-[#8B91A8]">{product.category}</p>
                      </div>
                      <div className="text-right">
                        {product.soldCount !== null ? (
                          <p className="text-sm font-semibold text-[#818CF8]">{product.soldCount} sold</p>
                        ) : (
                          <p className="text-sm font-semibold text-[#818CF8]">
                            {Number(product.rating || 0).toFixed(1)} stars
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </Card.Content>
              </Card>
            </section>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="border border-[#2A2E3E] bg-[#1C1F29]">
              <Card.Content className="p-5">
                <h2 className="text-lg font-bold text-[#E8EAF0]">Activity Feed</h2>
                <ul className="mt-3 space-y-2 text-sm text-[#8B91A8]">
                  {orders.slice(0, 4).map((order) => (
                    <li key={order._id} className="rounded-lg bg-[#14161C] px-3 py-2">
                      New order by <span className="font-medium text-[#E8EAF0]">{getCustomerName(order)}</span> - {formatCurrency(order.totalPrice)}
                    </li>
                  ))}
                  {orders.length === 0 && <li className="rounded-lg bg-[#14161C] px-3 py-2">No recent activity.</li>}
                </ul>
              </Card.Content>
            </Card>

            <Card className="border border-[#2A2E3E] bg-gradient-to-br from-[#1C1F29] to-[#14161C]">
              <Card.Content className="p-5">
                <h2 className="text-lg font-bold text-[#E8EAF0]">AI Insight</h2>
                <p className="mt-3 text-sm text-[#8B91A8]">
                  Sales performance is stable. Orders and product activity are increasing.
                </p>
              </Card.Content>
            </Card>
          </div>
        </>
      )}
    </section>
  );
};

export default AdminDashboard;
