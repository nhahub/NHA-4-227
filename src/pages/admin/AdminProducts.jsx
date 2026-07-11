import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Chip } from '@heroui/react';
import AdminBadge from '../../components/admin/AdminBadge';
import ProductForm from '../../components/admin/ProductForm';
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProduct,
} from '../../services/adminService';
import { formatCurrency } from '../../utils/format';
import { resolveImageUrl } from '../../utils/image';

const initialProduct = {
  name: '',
  description: '',
  price: '',
  image: '',
  category: '',
  brand: '',
  countInStock: '',
  isFeatured: false,
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminProducts();
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

  const stockBadge = (stock) => {
    if (stock <= 0) return <AdminBadge variant="danger">Out of Stock</AdminBadge>;
    if (stock <= 10) return <AdminBadge variant="warning">Low Stock</AdminBadge>;
    return <AdminBadge variant="success">In Stock</AdminBadge>;
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormError('');
  };

  const handleSubmitProduct = async (productPayload) => {
    try {
      setSubmitting(true);
      setFormError('');
      setSuccess('');
      setError('');

      if (editingProduct?._id) {
        await updateAdminProduct(editingProduct._id, productPayload);
        setSuccess('Product updated successfully.');
      } else {
        await createAdminProduct(productPayload);
        setSuccess('Product created successfully.');
      }

      closeModal();
      await fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(`Delete "${product.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      setDeletingId(product._id);
      setError('');
      setSuccess('');
      await deleteAdminProduct(product._id);
      setSuccess('Product deleted successfully.');
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeletingId('');
    }
  };

  const modalInitialValues = useMemo(() => {
    if (!editingProduct) return initialProduct;

    return {
      name: editingProduct.name || '',
      description: editingProduct.description || '',
      price: editingProduct.price ?? '',
      image: editingProduct.image || '',
      category: editingProduct.category || '',
      brand: editingProduct.brand || '',
      countInStock: editingProduct.countInStock ?? '',
      isFeatured: Boolean(editingProduct.isFeatured),
    };
  }, [editingProduct]);

  return (
    <section className="space-y-4">
      <div className="admin-panel flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h2 className="text-lg font-bold text-[var(--text)]">Products</h2>
          <p className="text-sm text-[var(--text2)]">Manage all products, stock, and merchandising.</p>
        </div>
        <Button
          onClick={openCreateModal}
          className="border border-indigo-500/35 bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25"
          variant="ghost"
        >
          Add Product
        </Button>
      </div>

      {loading && <div className="admin-panel p-5 text-sm text-[var(--text2)]">Loading products...</div>}

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
        <div className="admin-table-wrapper">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="whitespace-nowrap text-xs uppercase text-[var(--text3)]">Product</th>
                  <th className="whitespace-nowrap text-xs uppercase text-[var(--text3)]">Category</th>
                  <th className="whitespace-nowrap text-xs uppercase text-[var(--text3)]">Price</th>
                  <th className="whitespace-nowrap text-xs uppercase text-[var(--text3)]">Stock</th>
                  <th className="whitespace-nowrap text-xs uppercase text-[var(--text3)]">Featured</th>
                  <th className="whitespace-nowrap text-xs uppercase text-[var(--text3)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-5 text-center text-sm text-[var(--text2)]">
                      No products available
                    </td>
                  </tr>
                ) : (
                  products.map((row, index) => (
                    <tr key={row._id || row.id || index}>
                      <td>
                        <div className="flex items-center gap-3">
                          <img
                            src={resolveImageUrl(row.image)}
                            alt={row.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                          <span className="font-medium text-[var(--text)]">{row.name}</span>
                        </div>
                      </td>
                      <td className="text-[var(--text2)]">{row.category}</td>
                      <td className="font-semibold text-[var(--text)]">{formatCurrency(row.price)}</td>
                      <td>{stockBadge(Number(row.countInStock || 0))}</td>
                      <td>
                        {row.isFeatured ? (
                          <AdminBadge variant="info">Featured</AdminBadge>
                        ) : (
                          <span className="text-xs text-[var(--text3)]">No</span>
                        )}
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditModal(row)}
                            className="border border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-300 hover:bg-indigo-500/20"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            isDisabled={deletingId === row._id}
                            isLoading={deletingId === row._id}
                            onClick={() => handleDelete(row)}
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
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/65 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#2A2E3E] bg-[#14161C] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#E8EAF0]">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={closeModal}
                className="border border-[#2A2E3E] text-xs text-[#8B91A8] hover:text-[#E8EAF0]"
              >
                Close
              </Button>
            </div>

            <ProductForm
              initialValues={modalInitialValues}
              onSubmit={handleSubmitProduct}
              submitText={editingProduct ? 'Save Changes' : 'Create Product'}
              submitting={submitting}
              externalError={formError}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminProducts;
