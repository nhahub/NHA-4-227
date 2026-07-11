import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Card, Spinner } from '@heroui/react';
import { deleteSellerProduct, getMySellerProducts } from '../../services/sellerService';
import { formatCurrency } from '../../utils/format';
import { resolveImageUrl } from '../../utils/image';

const STATUS_STYLES = {
  draft:         'bg-[#1C1F29] text-[#8B91A8] border-[#2A2E3E]',
  approved:      'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  pending:       'bg-amber-500/15 text-amber-400 border-amber-500/30',
  rejected:      'bg-rose-500/15 text-rose-400 border-rose-500/30',
  needs_changes: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  suspended:     'bg-[#2A2E3E] text-[#8B91A8] border-[#3A3F55]',
};

const STATUS_LABELS = {
  draft:         'Draft',
  approved:      'Approved',
  pending:       'Pending Review',
  rejected:      'Rejected',
  needs_changes: 'Changes Needed',
  suspended:     'Suspended',
};

const StatusBadge = ({ status }) => {
  const key = status || 'approved';
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[key] || STATUS_STYLES.suspended}`}>
      {STATUS_LABELS[key] || key}
    </span>
  );
};

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMySellerProducts();
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      setError('');
      setSuccess('');
      await deleteSellerProduct(id);
      setSuccess('Product deleted successfully.');
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <section className="space-y-4">
      <Card className="border border-[#2A2E3E] bg-[#14161C]">
        <Card.Content className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h1 className="font-syne text-2xl font-bold text-[#E8EAF0]">My Products</h1>
            <p className="mt-1 text-sm text-[#8B91A8]">Only products owned by your seller account.</p>
          </div>
          <Link to="/seller/products/new">
            <Button className="border border-[#6366F1]/40 bg-[#6366F1]/15 text-[#C9CEFF] hover:bg-[#6366F1]/25" variant="ghost">
              Create Product
            </Button>
          </Link>
        </Card.Content>
      </Card>

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

      {success && (
        <Alert status="success">
          <Alert.Indicator />
          <Alert.Content><Alert.Description>{success}</Alert.Description></Alert.Content>
        </Alert>
      )}

      {!loading && !error && (
        <Card className="border border-[#2A2E3E] bg-[#14161C]">
          <Card.Content className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-[#2A2E3E] bg-[#1C1F29] text-left text-xs uppercase tracking-wide text-[#8B91A8]">
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-sm text-[#8B91A8]" colSpan={6}>
                        No seller products found.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product._id} className="border-b border-[#2A2E3E] text-sm text-[#C4C9DB] hover:bg-[#1C1F29]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={resolveImageUrl(product.image)}
                              alt={product.name}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                            <span className="font-medium text-[#E8EAF0]">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{product.category}</td>
                        <td className="px-4 py-3">{formatCurrency(product.price)}</td>
                        <td className="px-4 py-3">{Number(product.countInStock || 0)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={product.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link to={`/seller/products/edit/${product._id}`}>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="border border-[#6366F1]/30 bg-[#6366F1]/10 text-xs text-[#C9CEFF] hover:bg-[#6366F1]/20"
                              >
                                Edit
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              isDisabled={deletingId === product._id}
                              isLoading={deletingId === product._id}
                              onClick={() => handleDelete(product._id)}
                              className="border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 hover:bg-rose-500/20"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
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

export default SellerProducts;
