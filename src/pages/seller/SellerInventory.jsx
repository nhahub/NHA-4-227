import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Spinner } from '@heroui/react';
import { getMySellerProducts, updateSellerProduct } from '../../services/sellerService';
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

const stockClass = (stock) => {
  if (stock <= 0) return 'text-rose-400';
  if (stock <= 5) return 'text-amber-400';
  return 'text-emerald-400';
};

const inputClass =
  'w-20 rounded-lg border border-[#2A2E3E] bg-[#1C1F29] px-2.5 py-1.5 text-center text-sm text-[#E8EAF0] focus:border-indigo-500 focus:outline-none';

const SellerInventory = () => {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [stockEdit, setStockEdit] = useState({}); // id → string value
  const [savingId, setSavingId]   = useState('');
  const [filter, setFilter]       = useState('all');

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMySellerProducts();
      setProducts(data);
      const map = {};
      data.forEach((p) => { map[p._id] = String(p.countInStock ?? 0); });
      setStockEdit(map);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSaveStock = async (product) => {
    const newStock = parseInt(stockEdit[product._id] || '0', 10);
    if (Number.isNaN(newStock) || newStock < 0) {
      setError('Stock must be a non-negative number.');
      return;
    }
    if (newStock === product.countInStock) return;

    try {
      setSavingId(product._id);
      setError('');
      setSuccess('');
      await updateSellerProduct(product._id, { countInStock: newStock });
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, countInStock: newStock } : p))
      );
      setSuccess(`Stock updated for "${product.name}".`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stock.');
    } finally {
      setSavingId('');
    }
  };

  const lowStockCount = products.filter((p) => Number(p.countInStock) > 0 && Number(p.countInStock) <= 5).length;
  const outStockCount = products.filter((p) => Number(p.countInStock) <= 0).length;

  const filtered = products.filter((p) => {
    if (filter === 'low')  return Number(p.countInStock) > 0 && Number(p.countInStock) <= 5;
    if (filter === 'out')  return Number(p.countInStock) <= 0;
    return true;
  });

  return (
    <section className="space-y-5">
      {/* Header */}
      <Card className="border border-[#2A2E3E] bg-[#14161C]">
        <Card.Content className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <h1 className="font-syne text-2xl font-bold text-[#E8EAF0]">Inventory</h1>
            <p className="mt-1 text-sm text-[#8B91A8]">Manage stock levels for your products.</p>
          </div>
          <div className="flex gap-3 text-center">
            <div>
              <p className="font-syne text-xl font-bold text-amber-400">{lowStockCount}</p>
              <p className="text-xs text-[#555D78]">Low Stock</p>
            </div>
            <div className="border-l border-[#2A2E3E] pl-3">
              <p className="font-syne text-xl font-bold text-rose-400">{outStockCount}</p>
              <p className="text-xs text-[#555D78]">Out of Stock</p>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All Products' },
          { key: 'low', label: `Low Stock (${lowStockCount})` },
          { key: 'out', label: `Out of Stock (${outStockCount})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              filter === key
                ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300'
                : 'border-[#2A2E3E] text-[#8B91A8] hover:border-[#3A3F55] hover:text-[#E8EAF0]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content><Alert.Description>{error}</Alert.Description></Alert.Content>
        </Alert>
      )}
      {success && (
        <Alert status="success">
          <Alert.Indicator />
          <Alert.Content><Alert.Description>{success}</Alert.Description></Alert.Content>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-14">
          <Spinner size="lg" />
        </div>
      ) : (
        <Card className="border border-[#2A2E3E] bg-[#14161C]">
          <Card.Content className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-[#2A2E3E] bg-[#1C1F29] text-left text-xs uppercase tracking-wide text-[#8B91A8]">
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Stock Level</th>
                    <th className="px-4 py-3">Update Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td className="px-4 py-10 text-center text-sm text-[#8B91A8]" colSpan={6}>
                        No products match this filter.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((product) => {
                      const stock       = Number(product.countInStock ?? 0);
                      const editVal     = stockEdit[product._id] ?? String(stock);
                      const editNum     = parseInt(editVal, 10);
                      const isDirty     = !Number.isNaN(editNum) && editNum !== stock;

                      return (
                        <tr key={product._id} className="border-b border-[#2A2E3E] text-sm text-[#C4C9DB] hover:bg-[#1C1F29]">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={resolveImageUrl(product.image)}
                                alt={product.name}
                                className="h-9 w-9 rounded-md object-cover bg-[#1C1F29]"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                              <span className="font-medium text-[#E8EAF0]">{product.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#8B91A8]">{product.category}</td>
                          <td className="px-4 py-3">{formatCurrency(product.price)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[product.status || 'approved']}`}>
                              {STATUS_LABELS[product.status || 'approved']}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${stockClass(stock)}`}>{stock}</span>
                              {stock <= 0 && (
                                <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
                                  Out of Stock
                                </span>
                              )}
                              {stock > 0 && stock <= 5 && (
                                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                                  Low
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                value={editVal}
                                onChange={(e) =>
                                  setStockEdit((prev) => ({ ...prev, [product._id]: e.target.value }))
                                }
                                className={inputClass}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                isLoading={savingId === product._id}
                                isDisabled={!isDirty || !!savingId}
                                onClick={() => handleSaveStock(product)}
                                className={`text-xs ${isDirty ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border border-[#2A2E3E] text-[#555D78]'}`}
                              >
                                {isDirty ? 'Save' : 'Saved'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>
      )}
    </section>
  );
};

export default SellerInventory;
