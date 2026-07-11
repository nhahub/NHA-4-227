import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Spinner } from '@heroui/react';
import { getPendingProducts, updateAdminProductStatus } from '../../services/adminService';
import { resolveImageUrl } from '../../utils/image';
import { formatCurrency } from '../../utils/format';

const STATUS_STYLES = {
  pending:       'bg-amber-500/15 text-amber-400 border-amber-500/30',
  needs_changes: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
};

const AdminProductRequests = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionId, setActionId] = useState('');

  // Reject / needs-changes modal state
  const [modal, setModal] = useState(null); // { id, action: 'rejected'|'needs_changes' }
  const [modalReason, setModalReason] = useState('');
  const [modalSaving, setModalSaving] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [pending, needsChanges] = await Promise.all([
        getPendingProducts('pending'),
        getPendingProducts('needs_changes'),
      ]);
      setProducts([...pending, ...needsChanges]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load product requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleApprove = async (id) => {
    try {
      setActionId(id);
      setError('');
      setSuccess('');
      await updateAdminProductStatus(id, { status: 'approved' });
      setSuccess('Product approved and is now live in the store.');
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve product.');
    } finally {
      setActionId('');
    }
  };

  const openModal = (id, action) => {
    setModal({ id, action });
    setModalReason('');
  };

  const closeModal = () => {
    setModal(null);
    setModalReason('');
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!modal) return;
    try {
      setModalSaving(true);
      setError('');
      setSuccess('');
      await updateAdminProductStatus(modal.id, { status: modal.action, rejectionReason: modalReason.trim() });
      setSuccess(modal.action === 'rejected' ? 'Product rejected. Seller has been notified.' : 'Changes requested. Seller has been notified.');
      closeModal();
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    } finally {
      setModalSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <Card className="border border-[#2A2E3E] bg-[#14161C]">
        <Card.Content className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h1 className="font-syne text-2xl font-bold text-[#E8EAF0]">Product Requests</h1>
            <p className="mt-1 text-sm text-[#8B91A8]">Review products submitted by sellers for approval.</p>
          </div>
          <Button
            variant="ghost"
            className="border border-[#2A2E3E] text-[#8B91A8] hover:bg-[#1C1F29]"
            onClick={fetchProducts}
          >
            Refresh
          </Button>
        </Card.Content>
      </Card>

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
                    <th className="px-4 py-3">Seller</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td className="px-4 py-10 text-center text-sm text-[#8B91A8]" colSpan={6}>
                        No pending product requests.
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
                              className="h-10 w-10 rounded-md object-cover bg-[#1C1F29]"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <div>
                              <p className="font-medium text-[#E8EAF0]">{product.name}</p>
                              <p className="text-[11px] text-[#555D78]">{product.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{product.category}</td>
                        <td className="px-4 py-3">{formatCurrency(product.price)}</td>
                        <td className="px-4 py-3 text-[#8B91A8]">
                          {product.seller?.name || product.seller?.email || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[product.status] || 'bg-[#2A2E3E] text-[#8B91A8] border-[#3A3F55]'}`}>
                            {product.status === 'needs_changes' ? 'Changes Needed' : 'Pending Review'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              isLoading={actionId === product._id}
                              isDisabled={!!actionId || modalSaving}
                              onClick={() => handleApprove(product._id)}
                              className="border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 hover:bg-emerald-500/20"
                              variant="ghost"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              isDisabled={!!actionId || modalSaving}
                              onClick={() => openModal(product._id, 'needs_changes')}
                              className="border border-orange-500/30 bg-orange-500/10 text-xs text-orange-300 hover:bg-orange-500/20"
                              variant="ghost"
                            >
                              Request Changes
                            </Button>
                            <Button
                              size="sm"
                              isDisabled={!!actionId || modalSaving}
                              onClick={() => openModal(product._id, 'rejected')}
                              className="border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 hover:bg-rose-500/20"
                              variant="ghost"
                            >
                              Reject
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

      {/* Reject / Request-changes modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md border border-[#2A2E3E] bg-[#14161C] shadow-2xl">
            <Card.Header className="border-b border-[#2A2E3E] px-5 py-4">
              <Card.Title className="font-syne text-lg font-bold text-[#E8EAF0]">
                {modal.action === 'rejected' ? 'Reject Product' : 'Request Changes'}
              </Card.Title>
            </Card.Header>
            <form onSubmit={handleModalSubmit}>
              <Card.Content className="px-5 py-4 space-y-3">
                <label className="block text-sm text-[#8B91A8]">
                  {modal.action === 'rejected' ? 'Rejection reason (shown to seller)' : 'What changes are needed?'}
                </label>
                <textarea
                  rows={4}
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  className="w-full rounded-xl border border-[#2A2E3E] bg-[#1C1F29] px-4 py-3 text-sm text-[#E8EAF0] focus:border-indigo-500 focus:outline-none transition"
                  placeholder="Describe the issue…"
                  required
                />
              </Card.Content>
              <Card.Footer className="flex justify-end gap-3 border-t border-[#2A2E3E] px-5 py-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="border border-[#2A2E3E] text-[#8B91A8] hover:bg-[#1C1F29]"
                  onClick={closeModal}
                  isDisabled={modalSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={modalSaving}
                  className={modal.action === 'rejected'
                    ? 'bg-rose-600 text-white hover:bg-rose-500'
                    : 'bg-orange-600 text-white hover:bg-orange-500'}
                >
                  {modal.action === 'rejected' ? 'Reject Product' : 'Send Request'}
                </Button>
              </Card.Footer>
            </form>
          </Card>
        </div>
      )}
    </section>
  );
};

export default AdminProductRequests;
