import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Card } from '@heroui/react';
import { createSellerProduct } from '../../services/sellerService';
import ProductForm from '../../components/admin/ProductForm';

const SellerCreateProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (payload) => {
    try {
      setLoading(true);
      setError('');
      await createSellerProduct(payload); // status='pending' (submit for review)
      navigate('/seller/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product.');
    } finally {
      setLoading(false);
    }
  };

  const handleDraft = async (payload) => {
    try {
      setLoading(true);
      setError('');
      await createSellerProduct({ ...payload, saveAsDraft: true });
      navigate('/seller/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save draft.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <Card className="border border-[#2A2E3E] bg-[#14161C]">
        <Card.Content className="p-5">
          <h1 className="font-syne text-2xl font-bold text-[#E8EAF0]">Add New Product</h1>
          <p className="mt-1 text-sm text-[#8B91A8]">
            Submit for review to list in the store, or save as draft to continue later.
          </p>
        </Card.Content>
      </Card>

      {error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content><Alert.Description>{error}</Alert.Description></Alert.Content>
        </Alert>
      )}

      <Card className="border border-[#2A2E3E] bg-[#14161C]">
        <Card.Content className="p-5">
          <ProductForm
            onSubmit={handleSubmit}
            onSubmitDraft={handleDraft}
            submitting={loading}
            externalError={error}
            onCancel={() => navigate('/seller/products')}
          />
        </Card.Content>
      </Card>
    </section>
  );
};

export default SellerCreateProduct;
