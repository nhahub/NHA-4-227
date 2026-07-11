import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Alert, Card, Spinner } from '@heroui/react';
import { getProductById } from '../../services/productService';
import { updateSellerProduct, submitProductForReview } from '../../services/sellerService';
import ProductForm from '../../components/admin/ProductForm';

const SellerEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.auth.userInfo);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    brand: '',
    countInStock: '',
  });
  const [productStatus, setProductStatus] = useState('approved');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const product = await getProductById(id);

        const ownerId = String(product.seller || '');
        const currentSellerId = String(userInfo?._id || userInfo?.id || '');
        if (!ownerId || ownerId !== currentSellerId) {
          setForbidden(true);
          return;
        }

        setForm({
          name: product.name || '',
          description: product.description || '',
          price: String(product.price ?? ''),
          image: product.image || '',
          category: product.category || '',
          brand: product.brand || '',
          countInStock: String(product.countInStock ?? 0),
        });
        setProductStatus(product.status || 'approved');
        setRejectionReason(product.rejectionReason || '');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, userInfo]);

  const onSubmit = async (productPayload) => {
    try {
      setSaving(true);
      setError('');
      // For drafts: "Submit for Review" sends submitForReview flag
      // For rejected/needs_changes: any edit auto-resubmits (backend handles it)
      if (productStatus === 'draft') {
        await submitProductForReview(id, productPayload);
      } else {
        await updateSellerProduct(id, productPayload);
      }
      navigate('/seller/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product.');
    } finally {
      setSaving(false);
    }
  };

  const onSaveDraft = async (productPayload) => {
    try {
      setSaving(true);
      setError('');
      await updateSellerProduct(id, productPayload);
      navigate('/seller/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save draft.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (forbidden) {
    return (
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description>
            You can only edit products that belong to your seller account.
          </Alert.Description>
        </Alert.Content>
      </Alert>
    );
  }

  const statusBanner = {
    draft: {
      status: 'warning',
      text: 'This product is saved as a draft and is not visible in the store. Update the details then click "Submit for Review" to send it for admin approval.',
    },
    pending: {
      status: 'warning',
      text: 'This product is pending admin review. It will not appear in the store until approved.',
    },
    rejected: {
      status: 'danger',
      text: `Your product was rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''} Edit the details below and save to resubmit for review.`,
    },
    needs_changes: {
      status: 'warning',
      text: `Admin requested changes.${rejectionReason ? ` Note: ${rejectionReason}` : ''} Update the product and save to resubmit.`,
    },
    suspended: {
      status: 'danger',
      text: 'This product has been suspended and is not visible in the store. Contact support for assistance.',
    },
  }[productStatus];

  return (
    <section className="space-y-4">
      <Card className="border border-[#2A2E3E] bg-[#14161C]">
        <Card.Content className="p-5">
          <h1 className="font-syne text-2xl font-bold text-[#E8EAF0]">Edit Product</h1>
          <p className="mt-1 text-sm text-[#8B91A8]">Update details for your product.</p>
        </Card.Content>
      </Card>

      {statusBanner && (
        <Alert status={statusBanner.status}>
          <Alert.Indicator />
          <Alert.Content><Alert.Description>{statusBanner.text}</Alert.Description></Alert.Content>
        </Alert>
      )}

      {error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content><Alert.Description>{error}</Alert.Description></Alert.Content>
        </Alert>
      )}

      <Card className="border border-[#2A2E3E] bg-[#14161C]">
        <Card.Content className="p-5">
          <ProductForm
            initialValues={form}
            onSubmit={onSubmit}
            onSubmitDraft={productStatus === 'draft' ? onSaveDraft : undefined}
            submitText={
              productStatus === 'draft' ? 'Submit for Review' :
              ['rejected', 'needs_changes'].includes(productStatus) ? 'Save & Resubmit' :
              'Save Changes'
            }
            submitting={saving}
            externalError={error}
            onCancel={() => navigate('/seller/products')}
          />
        </Card.Content>
      </Card>
    </section>
  );
};

export default SellerEditProduct;
