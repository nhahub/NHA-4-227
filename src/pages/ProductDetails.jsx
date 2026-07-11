import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { Alert, Button, Card, Chip, Spinner } from '@heroui/react';
import { createProductReview, getProductById } from '../services/productService';
import { addToCart } from '../redux/slices/cartSlice';
import { formatCurrency } from '../utils/format';
import { resolveImageUrl } from '../utils/image';

const StarRating = ({ value = 0, interactive = false, onChange }) => {
  const [hovered, setHovered] = useState(0);
  const display = interactive ? (hovered || value) : value;
  const rounded = Math.round(Number(display || 0));

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type={interactive ? 'button' : undefined}
          className={interactive ? 'cursor-pointer focus:outline-none' : 'pointer-events-none'}
          onMouseEnter={() => interactive && setHovered(i + 1)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange?.(i + 1)}
        >
          <span className={`text-xl ${i < rounded ? 'text-amber-400' : 'text-[#2A2E3E]'}`}>★</span>
        </button>
      ))}
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-[#2A2E3E] last:border-b-0">
    <span className="text-sm text-[#555D78] flex-shrink-0">{label}</span>
    <span className="text-sm text-right text-[#C4C9DB] font-medium">{value}</span>
  </div>
);

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.auth.userInfo);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [addState, setAddState] = useState('idle');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getProductById(id);
      setProduct(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load product details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  const handleAddToCart = () => {
    if (!product) return;
    setAddState('adding');
    for (let i = 0; i < qty; i++) dispatch(addToCart(product));
    window.setTimeout(() => { setAddState('done'); window.setTimeout(() => setAddState('idle'), 1500); }, 500);
  };

  const productId = product?._id || product?.id || id;
  const currentUserId = userInfo?._id || userInfo?.id || '';
  const inStock = Number(product?.countInStock || 0) > 0;
  const maxQty = Math.min(Number(product?.countInStock || 1), 10);

  const hasReviewed = useMemo(() => {
    if (!product || !currentUserId) return false;
    return (product.reviews || []).some((r) => String(r.user) === String(currentUserId));
  }, [product, currentUserId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!productId) return;
    try {
      setReviewLoading(true);
      setReviewError('');
      setReviewSuccess('');
      await createProductReview(productId, { rating: Number(reviewRating), comment: reviewComment.trim() });
      setReviewSuccess('Review submitted — thank you!');
      setReviewComment('');
      setReviewRating(5);
      await fetchProduct();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Unable to load product</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert>
        <Link to="/products">
          <Button className="bg-indigo-600 text-white hover:bg-indigo-500">← Back to Products</Button>
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-3xl border border-[#2A2E3E] bg-[#14161C] p-10 text-center">
        <p className="font-syne text-2xl font-bold text-[#E8EAF0]">Product not found</p>
        <Link to="/products" className="mt-6 inline-block">
          <Button className="bg-indigo-600 text-white hover:bg-indigo-500">← Back to Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-xs text-[#555D78]">
        <Link to="/" className="hover:text-[#8B91A8] transition">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-[#8B91A8] transition">Electronics</Link>
        <span>/</span>
        <span className="text-[#8B91A8]">{product.category}</span>
        <span>/</span>
        <span className="truncate max-w-[200px] text-[#C4C9DB]">{product.name}</span>
      </nav>

      {/* ── Main section ─────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="grid gap-8 rounded-3xl border border-[#2A2E3E] bg-[#14161C] p-5 shadow-[0_16px_60px_rgba(0,0,0,0.5)] md:grid-cols-2 md:p-8"
      >
        {/* Image */}
        <div className="group relative overflow-hidden rounded-2xl border border-[#2A2E3E] bg-[#0E0F13]">
          <img
            src={resolveImageUrl(product.image)}
            alt={product.name}
            className="h-full max-h-[440px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {product.isFeatured && (
            <div className="absolute right-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-black">
              ★ TOP PICK
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-start space-y-5">
          {/* Category + brand */}
          <div className="flex flex-wrap items-center gap-2">
            <Chip size="sm" color="accent" variant="soft">{product.category}</Chip>
            {product.brand && (
              <span className="rounded-full border border-[#2A2E3E] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#555D78]">
                {product.brand}
              </span>
            )}
          </div>

          <h1 className="font-syne text-3xl font-bold leading-tight text-[#E8EAF0] sm:text-4xl">
            {product.name}
          </h1>

          {/* Rating row */}
          <div className="flex items-center gap-3">
            <StarRating value={product.rating} />
            <span className="text-sm font-semibold text-amber-400">
              {Number(product.rating || 0).toFixed(1)}
            </span>
            <span className="text-sm text-[#555D78]">
              ({Number(product.numReviews || 0).toLocaleString()} reviews)
            </span>
          </div>

          <p className="text-sm leading-relaxed text-[#8B91A8]">{product.description}</p>

          {/* Price block */}
          <div className="rounded-2xl border border-[#2A2E3E] bg-[#1C1F29] p-4">
            <p className="text-xs text-[#555D78] mb-1">Price</p>
            <p className="font-syne text-4xl font-extrabold text-[#E8EAF0]">
              {formatCurrency(product.price)}
            </p>
            <div className="mt-2 flex items-center gap-2">
              {inStock ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-xs font-medium text-green-400">
                    In Stock
                    {Number(product.countInStock) <= 5 && ` — Only ${product.countInStock} left`}
                  </span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  <span className="text-xs font-medium text-red-400">Out of Stock</span>
                </>
              )}
            </div>
          </div>

          {/* Qty + CTA — customers (and guests) only */}
          {inStock && (!userInfo || userInfo.role === 'customer') && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-xl border border-[#2A2E3E] bg-[#1C1F29] px-1">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-[#8B91A8] hover:text-[#E8EAF0] transition"
                >
                  −
                </button>
                <span className="w-7 text-center text-sm font-semibold text-[#E8EAF0]">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-[#8B91A8] hover:text-[#E8EAF0] transition"
                >
                  +
                </button>
              </div>

              <Button
                size="lg"
                onClick={handleAddToCart}
                isDisabled={addState === 'adding'}
                className="flex-1 bg-indigo-600 font-dm text-white hover:bg-indigo-500"
              >
                {addState === 'adding' ? <Spinner size="sm" className="text-white" /> :
                 addState === 'done' ? '✓ Added to Cart' :
                 `Add ${qty > 1 ? `${qty} ` : ''}to Cart`}
              </Button>
            </div>
          )}

          <Link to="/products">
            <Button variant="ghost" className="w-full border border-[#2A2E3E] text-[#8B91A8] hover:border-indigo-500/40 hover:text-[#E8EAF0]">
              ← Continue Shopping
            </Button>
          </Link>

          {/* Product details table */}
          <div className="rounded-2xl border border-[#2A2E3E] bg-[#1C1F29] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#555D78]">Product Details</p>
            {product.brand     && <InfoRow label="Brand"    value={product.brand} />}
            {product.category  && <InfoRow label="Category" value={product.category} />}
            <InfoRow label="Stock" value={inStock ? `${product.countInStock} units` : 'Out of Stock'} />
            <InfoRow label="Reviews" value={`${Number(product.numReviews || 0).toLocaleString()} ratings`} />
            <InfoRow label="Rating" value={`${Number(product.rating || 0).toFixed(1)} / 5.0`} />
          </div>
        </div>
      </motion.section>

      {/* ── Reviews ──────────────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-[#2A2E3E] bg-[#14161C] p-5 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-syne text-2xl font-bold text-[#E8EAF0]">
            Customer Reviews
          </h2>
          {(product.reviews || []).length > 0 && (
            <div className="text-right">
              <p className="font-syne text-2xl font-bold text-amber-400">
                {Number(product.rating || 0).toFixed(1)}
              </p>
              <StarRating value={product.rating} />
              <p className="text-xs text-[#555D78]">{product.numReviews} reviews</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {(product.reviews || []).length === 0 && (
            <div className="rounded-2xl border border-[#2A2E3E] bg-[#1C1F29] p-6 text-center">
              <p className="text-sm text-[#555D78]">No reviews yet — be the first to review this product.</p>
            </div>
          )}

          {(product.reviews || []).map((review) => (
            <Card key={review._id} className="border border-[#2A2E3E] bg-[#1C1F29]">
              <Card.Content className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
                      {(review.name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#E8EAF0]">{review.name}</p>
                      <p className="text-[10px] text-[#555D78]">Verified Purchase</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#555D78]">
                    {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="mt-2">
                  <StarRating value={review.rating} />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#C4C9DB]">{review.comment}</p>
              </Card.Content>
            </Card>
          ))}
        </div>

        {/* Write review form */}
        <Card className="mt-8 border border-[#2A2E3E] bg-[#1C1F29]">
          <Card.Content className="p-5">
            <h3 className="font-syne text-lg font-bold text-[#E8EAF0]">Write a Review</h3>

            {!userInfo && (
              <p className="mt-3 text-sm text-[#8B91A8]">
                <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
                  Sign in
                </Link>{' '}
                to leave a review.
              </p>
            )}

            {userInfo && userInfo.role !== 'customer' && (
              <p className="mt-3 text-sm text-[#555D78]">Only customers can review products.</p>
            )}

            {userInfo && userInfo.role === 'customer' && hasReviewed && (
              <p className="mt-3 text-sm text-green-400">✓ You've already reviewed this product.</p>
            )}

            {reviewError && (
              <Alert status="danger" className="mt-3">
                <Alert.Indicator />
                <Alert.Content><Alert.Description>{reviewError}</Alert.Description></Alert.Content>
              </Alert>
            )}
            {reviewSuccess && (
              <Alert status="success" className="mt-3">
                <Alert.Indicator />
                <Alert.Content><Alert.Description>{reviewSuccess}</Alert.Description></Alert.Content>
              </Alert>
            )}

            {userInfo && userInfo.role === 'customer' && !hasReviewed && (
              <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-[#8B91A8]">Your Rating</label>
                  <StarRating
                    value={reviewRating}
                    interactive
                    onChange={setReviewRating}
                  />
                </div>

                <div>
                  <label htmlFor="comment" className="mb-1 block text-sm text-[#8B91A8]">Your Review</label>
                  <textarea
                    id="comment"
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full rounded-xl border border-[#2A2E3E] bg-[#14161C] px-4 py-3 text-sm text-[#E8EAF0] focus:border-indigo-500 focus:outline-none transition"
                    placeholder="Share your experience with this product…"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  isLoading={reviewLoading}
                  className="bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  Submit Review
                </Button>
              </form>
            )}
          </Card.Content>
        </Card>
      </section>
    </div>
  );
};

export default ProductDetails;
