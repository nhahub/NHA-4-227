import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Card, Chip, Spinner } from '@heroui/react';
import { getMySellerProducts, getSellerOrders } from '../../services/sellerService';
import { formatCurrency } from '../../utils/format';
import { resolveImageUrl } from '../../utils/image';

const STATUS_STYLES = {
  approved:      'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  pending:       'bg-amber-500/15 text-amber-400 border-amber-500/30',
  draft:         'bg-[#2A2E3E] text-[#8B91A8] border-[#3A3F55]',
  rejected:      'bg-rose-500/15 text-rose-400 border-rose-500/30',
  needs_changes: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  suspended:     'bg-[#2A2E3E] text-[#555D78] border-[#2A2E3E]',
};
const STATUS_LABELS = {
  approved: 'Approved', pending: 'Pending', draft: 'Draft',
  rejected: 'Rejected', needs_changes: 'Changes Needed', suspended: 'Suspended',
};

const FULFILL_STYLES = {
  pending:       'bg-[#2A2E3E] text-[#8B91A8]',
  preparing:     'bg-amber-500/15 text-amber-400',
  ready_to_ship: 'bg-indigo-500/15 text-indigo-400',
  shipped:       'bg-emerald-500/15 text-emerald-400',
};
const FULFILL_LABELS = {
  pending: 'Pending', preparing: 'Preparing', ready_to_ship: 'Ready to Ship', shipped: 'Shipped',
};

const StatCard = ({ label, value, sub, tone = 'default' }) => {
  const tones = {
    default: 'border-[#2A2E3E]',
    emerald: 'border-emerald-500/20',
    amber:   'border-amber-500/20',
    rose:    'border-rose-500/20',
    indigo:  'border-indigo-500/20',
  };
  const vals = {
    default: 'text-[#E8EAF0]',
    emerald: 'text-emerald-400',
    amber:   'text-amber-400',
    rose:    'text-rose-400',
    indigo:  'text-indigo-400',
  };
  return (
    <Card className={`border bg-[#14161C] ${tones[tone]}`}>
      <Card.Content className="p-5">
        <p className="text-xs text-[#8B91A8]">{label}</p>
        <p className={`mt-2 font-syne text-3xl font-bold ${vals[tone]}`}>{value}</p>
        {sub && <p className="mt-1 text-xs text-[#555D78]">{sub}</p>}
      </Card.Content>
    </Card>
  );
};

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [prodData, orderData] = await Promise.all([
          getMySellerProducts(),
          getSellerOrders(),
        ]);
        setProducts(prodData);
        setOrders(orderData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const productStats = useMemo(() => ({
    total:    products.length,
    draft:    products.filter((p) => p.status === 'draft').length,
    pending:  products.filter((p) => p.status === 'pending').length,
    approved: products.filter((p) => p.status === 'approved' || !p.status).length,
    rejected: products.filter((p) => ['rejected', 'needs_changes'].includes(p.status)).length,
    lowStock: products.filter((p) => Number(p.countInStock) > 0 && Number(p.countInStock) <= 5).length,
    outStock: products.filter((p) => Number(p.countInStock) <= 0).length,
  }), [products]);

  const orderStats = useMemo(() => {
    const total   = orders.length;
    const revenue = orders.reduce((sum, o) => {
      const myItems = o.orderItems || [];
      return sum + myItems.reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 0), 0);
    }, 0);
    const avgOrder = total ? revenue / total : 0;
    return { total, revenue, avgOrder };
  }, [orders]);

  const recentProducts = useMemo(
    () => [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [products]
  );
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-syne text-2xl font-bold text-[#E8EAF0]">Seller Dashboard</h1>
          <p className="mt-1 text-sm text-[#8B91A8]">Overview of your store, products and sales.</p>
        </div>
        <Link to="/seller/products/new">
          <Button className="bg-indigo-600 text-white hover:bg-indigo-500" size="sm">
            + Add Product
          </Button>
        </Link>
      </div>

      {error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content><Alert.Description>{error}</Alert.Description></Alert.Content>
        </Alert>
      )}

      {/* Product stats */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#555D78]">Products</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Products"   value={productStats.total}    tone="default" />
          <StatCard label="Approved (Live)"  value={productStats.approved} tone="emerald" sub="Visible in store" />
          <StatCard label="Pending Review"   value={productStats.pending}  tone="amber"   sub="Awaiting admin" />
          <StatCard label="Needs Attention"  value={productStats.rejected} tone="rose"    sub="Rejected or changes needed" />
        </div>
      </div>

      {/* Sales stats */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#555D78]">Sales</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Orders"     value={orderStats.total}                  tone="indigo" />
          <StatCard label="Total Revenue"    value={formatCurrency(orderStats.revenue)} tone="emerald" />
          <StatCard label="Avg Order Value"  value={formatCurrency(orderStats.avgOrder)} tone="default" />
        </div>
      </div>

      {/* Stock alerts */}
      {(productStats.lowStock > 0 || productStats.outStock > 0) && (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              {productStats.lowStock > 0 && `${productStats.lowStock} product(s) have low stock (≤5 units). `}
              {productStats.outStock > 0 && `${productStats.outStock} product(s) are out of stock.`}
              {' '}
              <Link to="/seller/inventory" className="font-semibold underline">Manage inventory →</Link>
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {/* Recent products + orders */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Recent products */}
        <Card className="border border-[#2A2E3E] bg-[#14161C]">
          <Card.Header className="flex items-center justify-between border-b border-[#2A2E3E] px-5 py-4">
            <Card.Title className="text-sm font-semibold text-[#E8EAF0]">Recent Products</Card.Title>
            <Link to="/seller/products" className="text-xs text-indigo-400 hover:text-indigo-300">
              View all →
            </Link>
          </Card.Header>
          <Card.Content className="p-0">
            {recentProducts.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[#555D78]">No products yet.</p>
            ) : (
              <div className="divide-y divide-[#2A2E3E]">
                {recentProducts.map((p) => (
                  <div key={p._id} className="flex items-center gap-3 px-5 py-3">
                    <img
                      src={resolveImageUrl(p.image)}
                      alt={p.name}
                      className="h-9 w-9 rounded-md object-cover bg-[#1C1F29]"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#E8EAF0]">{p.name}</p>
                      <p className="text-xs text-[#555D78]">{formatCurrency(p.price)}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[p.status || 'approved']}`}>
                      {STATUS_LABELS[p.status || 'approved']}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Recent orders */}
        <Card className="border border-[#2A2E3E] bg-[#14161C]">
          <Card.Header className="flex items-center justify-between border-b border-[#2A2E3E] px-5 py-4">
            <Card.Title className="text-sm font-semibold text-[#E8EAF0]">Recent Orders</Card.Title>
            <Link to="/seller/orders" className="text-xs text-indigo-400 hover:text-indigo-300">
              View all →
            </Link>
          </Card.Header>
          <Card.Content className="p-0">
            {recentOrders.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[#555D78]">No orders yet.</p>
            ) : (
              <div className="divide-y divide-[#2A2E3E]">
                {recentOrders.map((o) => {
                  const myRevenue = (o.orderItems || []).reduce(
                    (s, i) => s + Number(i.price || 0) * Number(i.quantity || 0), 0
                  );
                  return (
                    <div key={o._id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#E8EAF0]">
                          #{String(o._id).slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-[#555D78]">
                          {o.user?.name || o.user?.email || 'Customer'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-indigo-400">{formatCurrency(myRevenue)}</p>
                        <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${FULFILL_STYLES[o.fulfillmentStatus || 'pending']}`}>
                          {FULFILL_LABELS[o.fulfillmentStatus || 'pending']}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    </section>
  );
};

export default SellerDashboard;
