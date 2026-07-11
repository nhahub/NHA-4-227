import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button, Skeleton } from '@heroui/react';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../services/productService';
import { getCategories as getCategoryList } from '../services/categoryService';
import { addToCart } from '../redux/slices/cartSlice';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc',label: 'Price: High → Low' },
  { value: 'rating_desc',label: 'Top Rated' },
];

const Products = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const cartItems = useSelector((state) => state.cart.items);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoadFailed, setCategoriesLoadFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [animatedItemCount, setAnimatedItemCount] = useState(0);
  const [cartHovered, setCartHovered] = useState(false);
  const [cartPop, setCartPop] = useState(false);

  const [countRef, countInView] = useInView({ triggerOnce: true, threshold: 0.4 });
  const firstCartRender = useRef(true);
  const { ref: gridRef, inView: gridInView } = useInView({ triggerOnce: true, threshold: 0.05 });

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategoryList();
        const names = (Array.isArray(data) ? data : [])
          .map((item) => (typeof item === 'string' ? item : item.name))
          .filter(Boolean);
        setCategories(Array.from(new Set(names)));
        setCategoriesLoadFailed(false);
      } catch {
        setCategories([]);
        setCategoriesLoadFailed(true);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!categoriesLoadFailed) return;
    const fallback = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    setCategories(fallback);
  }, [products, categoriesLoadFailed]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        const params = {};
        if (debouncedSearch) params.search = debouncedSearch;
        if (category) params.category = category;
        if (minPrice !== '') params.minPrice = minPrice;
        if (maxPrice !== '') params.maxPrice = maxPrice;
        if (sortBy) params.sort = sortBy;
        const data = await getProducts(params);
        setProducts(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [debouncedSearch, category, minPrice, maxPrice, sortBy]);

  const handleAddToCart = (product) => {
    const key = product._id || product.id;
    setAddingId(key);
    dispatch(addToCart(product));
    window.setTimeout(() => setAddingId(null), 450);
  };

  const resetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
  };

  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0), [cartItems]);

  useEffect(() => {
    if (firstCartRender.current) { firstCartRender.current = false; return; }
    setCartPop(true);
    const id = window.setTimeout(() => setCartPop(false), 500);
    return () => window.clearTimeout(id);
  }, [cartCount]);

  useEffect(() => {
    if (!countInView) return;
    const target = products.length;
    const start = performance.now();
    let fid = null;
    const tick = (now) => {
      const t = Math.min((now - start) / 800, 1);
      setAnimatedItemCount(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) fid = window.requestAnimationFrame(tick);
    };
    fid = window.requestAnimationFrame(tick);
    return () => { if (fid) window.cancelAnimationFrame(fid); };
  }, [countInView, products.length]);

  const inputCls = 'rounded-xl border border-[#2A2E3E] bg-[#1C1F29] px-3 py-2 text-sm text-[#E8EAF0] placeholder:text-[#555D78] focus:border-indigo-500 focus:outline-none transition';

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative isolate space-y-7 rounded-3xl bg-[#0E0F13] p-5 text-[#E8EAF0] sm:p-8"
    >
      <div className="smartcart-ambient-orb" aria-hidden="true" />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <h1 className="font-syne text-3xl font-bold tracking-tight text-[#E8EAF0] sm:text-4xl">
            Electronics Store
          </h1>
          <p className="mt-1 text-sm text-[#555D78]">
            Chargers · Cables · Audio · Keyboards · Gaming · Smart Watches · PC Gear
          </p>
        </div>
        {!loading && !error && (
          <motion.div
            ref={countRef}
            className="rounded-full border border-[#2A2E3E] bg-[#14161C] px-4 py-1.5 text-xs font-semibold text-[#8B91A8]"
          >
            {animatedItemCount} products
          </motion.div>
        )}
      </motion.div>

      {/* ── Filter bar ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.35, ease: 'easeOut' }}
        className="relative z-10 flex flex-wrap gap-2.5 rounded-2xl border border-[#2A2E3E] bg-[#14161C]/80 p-3 backdrop-blur"
      >
        {/* Search */}
        <div className="relative min-w-[180px] flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555D78]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search electronics…"
            className={`${inputCls} pl-9 w-full`}
          />
        </div>

        {/* Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`${inputCls} min-w-[150px]`}
        >
          <option value="">All Categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        {/* Price range */}
        <input
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="Min $"
          min="0"
          className={`${inputCls} w-24`}
        />
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Max $"
          min="0"
          className={`${inputCls} w-24`}
        />

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={`${inputCls} min-w-[160px]`}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Reset */}
        <Button
          variant="ghost"
          onClick={resetFilters}
          className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 text-sm font-semibold text-indigo-300 hover:bg-indigo-500/20 transition"
        >
          Reset
        </Button>
      </motion.div>

      {/* ── Skeletons ──────────────────────────────────────────────────── */}
      {loading && (
        <div className="relative z-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-[#2A2E3E] bg-[#1C1F29]">
              <Skeleton className="h-48 w-full" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-3 w-14 rounded" />
                <Skeleton className="h-5 w-4/5 rounded" />
                <Skeleton className="h-4 w-2/3 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {error && (
        <div className="relative z-10">
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content><Alert.Description>{error}</Alert.Description></Alert.Content>
          </Alert>
        </div>
      )}

      {/* ── Grid ───────────────────────────────────────────────────────── */}
      {!loading && !error && (
        <motion.div
          ref={gridRef}
          variants={containerVariants}
          initial="hidden"
          animate={gridInView ? 'visible' : 'hidden'}
          className="relative z-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {products.map((product) => {
            const key = product._id || product.id;
            return (
              <ProductCard
                key={key}
                product={product}
                onAddToCart={handleAddToCart}
                isAdding={addingId === key}
                variants={cardVariants}
              />
            );
          })}
        </motion.div>
      )}

      {/* ── Empty ──────────────────────────────────────────────────────── */}
      {!loading && !error && products.length === 0 && (
        <div className="relative z-10 rounded-2xl border border-[#2A2E3E] bg-[#14161C] p-10 text-center">
          <svg className="mx-auto mb-4 h-12 w-12 text-[#2A2E3E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-syne text-lg font-bold text-[#8B91A8]">No products found</p>
          <p className="mt-1 text-sm text-[#555D78]">Try different filters or reset to browse all electronics.</p>
          <Button onClick={resetFilters} className="mt-4 bg-indigo-600 text-white hover:bg-indigo-500">
            Reset Filters
          </Button>
        </div>
      )}

      {/* ── Floating cart pill ─────────────────────────────────────────── */}
      <motion.div
        animate={cartPop ? { scale: [1, 1.35, 0.9, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.5 }}
        onHoverStart={() => setCartHovered(true)}
        onHoverEnd={() => setCartHovered(false)}
        className="fixed bottom-7 right-7 z-[999]"
      >
        <Link to="/cart" aria-label="View cart">
          <motion.div
            layout
            className="flex h-[52px] items-center gap-2 overflow-hidden rounded-full bg-indigo-600 px-4 text-white shadow-[0_12px_40px_rgba(99,102,241,0.5)]"
            animate={{ width: cartHovered ? 148 : 52 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={cartCount}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold"
              >
                {cartCount}
              </motion.span>
            </AnimatePresence>
            <motion.span
              animate={{ opacity: cartHovered ? 1 : 0, x: cartHovered ? 0 : -6 }}
              transition={{ duration: 0.18 }}
              className="whitespace-nowrap text-sm font-semibold"
            >
              View Cart
            </motion.span>
          </motion.div>
        </Link>
      </motion.div>
    </motion.section>
  );
};

export default Products;
