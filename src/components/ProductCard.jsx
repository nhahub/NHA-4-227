import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button, Spinner } from '@heroui/react';
import { resolveImageUrl } from '../utils/image';

const StarRating = ({ value = 0, count = 0 }) => {
  const rounded = Math.round(Number(value || 0) * 2) / 2;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.floor(rounded);
          const half = !filled && i < rounded;
          return (
            <svg key={i} className="h-3.5 w-3.5" viewBox="0 0 20 20">
              {half ? (
                <>
                  <defs>
                    <linearGradient id={`half-${i}`} x1="0" x2="1" y1="0" y2="0">
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="50%" stopColor="#374151" />
                    </linearGradient>
                  </defs>
                  <path fill={`url(#half-${i})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </>
              ) : (
                <path fill={filled ? '#f59e0b' : '#374151'} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              )}
            </svg>
          );
        })}
      </div>
      {count > 0 && (
        <span className="text-[11px] text-[#8B91A8]">
          ({count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count})
        </span>
      )}
    </div>
  );
};

const ProductCard = ({ product, onAddToCart, isAdding = false, variants }) => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const canAddToCart = !userInfo || userInfo.role === 'customer';
  const productId = product._id || product.id;
  const [addState, setAddState] = useState('idle');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!isAdding) return;
    setAddState('loading');
    const t1 = window.setTimeout(() => setAddState('success'), 600);
    const t2 = window.setTimeout(() => setAddState('idle'), 1800);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [isAdding]);

  const handleAdd = (e) => {
    e.stopPropagation();
    if (addState === 'loading') return;
    onAddToCart(product);
  };

  const inStock = Number(product.countInStock || 0) > 0;
  const lowStock = inStock && Number(product.countInStock) <= 5;

  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className="card-wrapper h-full cursor-pointer"
      onClick={() => navigate(`/product/${productId}`)}
    >
      <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#2A2E3E] bg-[#1C1F29] transition-all duration-200 hover:border-indigo-500/60 hover:shadow-[0_0_0_1px_rgba(99,102,241,0.35),0_16px_48px_rgba(0,0,0,0.5)]">

        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-[#13151d] flex items-center justify-center">
          {!imgError ? (
            <img
              src={resolveImageUrl(product.image)}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#2A2E3E]">
              <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#1c1f29] to-transparent" />

          {/* Category badge */}
          <div className="absolute left-2.5 top-2.5 rounded-full border border-[#2A2E3E] bg-[#0e0f13]/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#818CF8] backdrop-blur-sm">
            {product.category}
          </div>

          {/* Featured badge */}
          {product.isFeatured && (
            <div className="absolute right-2.5 top-2.5 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-black backdrop-blur-sm">
              ★ TOP PICK
            </div>
          )}

          {/* Quick add hover button — customers only */}
          {canAddToCart && (
            <div className="quick-add-overlay absolute inset-x-3 bottom-3 flex justify-center opacity-0 transition-opacity duration-200">
              <button
                type="button"
                onClick={handleAdd}
                className="w-full rounded-xl bg-indigo-600 py-1.5 text-xs font-semibold text-white shadow-lg hover:bg-indigo-500 active:scale-95"
              >
                + Quick Add to Cart
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-1.5 p-3.5">
          {/* Brand */}
          {product.brand && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#555D78]">
              {product.brand}
            </p>
          )}

          {/* Name */}
          <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-[#E8EAF0] group-hover:text-white">
            {product.name}
          </p>

          {/* Description */}
          <p className="mt-0.5 line-clamp-2 flex-1 text-[11px] leading-relaxed text-[#555D78]">
            {product.description}
          </p>

          {/* Rating */}
          {Number(product.numReviews || 0) > 0 && (
            <StarRating value={product.rating} count={product.numReviews} />
          )}

          {/* Stock */}
          {lowStock && (
            <p className="text-[11px] font-medium text-red-400">
              Only {product.countInStock} left in stock!
            </p>
          )}
          {!inStock && (
            <p className="text-[11px] font-medium text-[#555D78]">Out of stock</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-[#2A2E3E] px-3.5 py-3">
          <div>
            <span className="font-syne text-lg font-bold text-[#E8EAF0]">
              ${Number(product.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 border border-[#2A2E3E] px-3 text-xs text-[#8B91A8] hover:border-[#353A50] hover:text-[#E8EAF0]"
              onClick={() => navigate(`/product/${productId}`)}
            >
              Details
            </Button>

            {canAddToCart && (
              <Button
                size="sm"
                className="h-8 min-w-[58px] bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-500"
                onClick={handleAdd}
                isDisabled={addState === 'loading' || !inStock}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {addState === 'idle' && (
                    <motion.span key="idle" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }}>
                      Add
                    </motion.span>
                  )}
                  {addState === 'loading' && (
                    <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Spinner size="sm" className="text-white" />
                    </motion.span>
                  )}
                  {addState === 'success' && (
                    <motion.span key="ok" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: [1, 1.2, 1] }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                      ✓
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
