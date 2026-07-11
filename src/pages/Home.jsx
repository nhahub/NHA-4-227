import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Chip, Skeleton } from '@heroui/react';
import { getProducts } from '../services/productService';
import { formatCurrency } from '../utils/format';
import { resolveImageUrl } from '../utils/image';

const CATEGORIES = [
  { label: 'Chargers & Cables', icon: '⚡', slug: 'Chargers & Cables' },
  { label: 'Power Banks',       icon: '🔋', slug: 'Power Banks' },
  { label: 'Headphones',        icon: '🎧', slug: 'Headphones & Audio' },
  { label: 'Keyboards',         icon: '⌨️', slug: 'Keyboards' },
  { label: 'Gaming',            icon: '🎮', slug: 'Gaming Accessories' },
  { label: 'Smart Watches',     icon: '⌚', slug: 'Smart Watches' },
  { label: 'PC Accessories',    icon: '🖥️', slug: 'PC Accessories' },
  { label: 'Networking',        icon: '📡', slug: 'Networking' },
];

const REVIEWS = [
  { initials: 'AK', name: 'Alex K.', text: 'Ordered the Anker 65W charger — arrived fast and charges my MacBook Pro like a dream. Will be a repeat customer.' },
  { initials: 'SR', name: 'Sara R.', text: 'Sony WH-1000XM5 arrived perfectly packaged. The noise cancellation is unreal. Huge upgrade from my old headphones.' },
  { initials: 'MO', name: 'Mohammed O.', text: 'The Keychron Q1 Pro is the best keyboard I\'ve ever typed on. Solid build, satisfying keystrokes, great value.' },
];

const STATS = [
  { value: '32+',  label: 'Electronics Products' },
  { value: '8',    label: 'Categories' },
  { value: '100%', label: 'Secure Checkout' },
  { value: '24h',  label: 'Support' },
];

const StarRow = ({ rating = 0 }) => (
  <span className="text-amber-400 text-sm">
    {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
  </span>
);

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const featured = useMemo(() => products.filter((p) => p.isFeatured).slice(0, 4), [products]);
  const displayFeatured = featured.length > 0 ? featured : products.slice(0, 4);

  return (
    <section className="relative space-y-10 rounded-3xl bg-[#0E0F13] p-5 text-[#E8EAF0] sm:p-8">
      <div className="home-glow" aria-hidden="true" />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative z-10 grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            <span className="text-xs font-semibold text-indigo-300 tracking-wide">Premium Electronics Store</span>
          </div>

          <h1 className="font-syne text-4xl font-bold leading-tight text-[#E8EAF0] sm:text-5xl">
            Tech That Fits<br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Your Life.
            </span>
          </h1>

          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[#8B91A8]">
            Chargers, cables, headphones, keyboards, smartwatches, gaming gear and more — curated, priced fairly, delivered fast.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/products">
              <Button size="lg" className="bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/25">
                Shop Electronics
              </Button>
            </Link>
            <Link to="/products">
              <Button size="lg" variant="outline" className="border-[#2A2E3E] text-[#C4C9DB] hover:bg-[#1C1F29]">
                View All Deals
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap gap-4">
            {['Free Returns', 'Secure Payments', 'Genuine Products'].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5 text-xs text-[#8B91A8]">
                <svg className="h-3.5 w-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {badge}
              </div>
            ))}
          </div>
        </div>

        {/* Hero card */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10"
        >
          <div className="relative overflow-hidden rounded-3xl border border-[#2A2E3E] bg-gradient-to-br from-[#1C1F29] to-[#14161C] p-6 shadow-2xl shadow-black/50">
            {/* Glow */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-600/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-600/15 blur-3xl" />

            <div className="relative space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">This Week's Top Pick</p>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-syne text-xl font-bold text-[#E8EAF0]">Sony WH-1000XM5</p>
                  <p className="mt-1 text-sm text-[#8B91A8]">Industry-leading noise cancellation</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-amber-400 text-sm">★★★★★</span>
                    <span className="text-xs text-[#555D78]">5,890 reviews</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-syne text-2xl font-bold text-[#E8EAF0]">$349</p>
                  <p className="text-xs text-green-400">In stock</p>
                </div>
              </div>
              <Link to="/products">
                <button type="button" className="mt-2 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500">
                  Shop Now →
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Category grid ─────────────────────────────────────────────────── */}
      <div className="relative z-10">
        <h2 className="mb-4 font-syne text-xl font-bold text-[#E8EAF0]">Shop by Category</h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat.slug)}`)}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-[#2A2E3E] bg-[#1C1F29] px-2 py-4 text-center transition hover:border-indigo-500/60 hover:bg-[#242838] hover:shadow-[0_4px_20px_rgba(99,102,241,0.15)]"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-[10px] font-semibold leading-tight text-[#8B91A8]">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Featured products ─────────────────────────────────────────────── */}
      <section className="relative z-10">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="font-syne text-2xl font-bold text-[#E8EAF0]">Featured Products</h2>
            <p className="mt-0.5 text-sm text-[#555D78]">Hand-picked top electronics</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition">
            View all →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(loading ? Array.from({ length: 4 }) : displayFeatured).map((product, index) => (
            <motion.div
              key={product?._id || `sk-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ delay: index * 0.07, duration: 0.3 }}
            >
              {loading ? (
                <div className="overflow-hidden rounded-2xl border border-[#2A2E3E] bg-[#1C1F29]">
                  <Skeleton className="h-44 w-full" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-5 w-3/4 rounded" />
                    <Skeleton className="h-4 w-1/3 rounded" />
                  </div>
                </div>
              ) : (
                <Link to={`/product/${product._id}`} className="block h-full">
                  <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#2A2E3E] bg-[#1C1F29] transition-all hover:border-indigo-500/60 hover:shadow-[0_8px_32px_rgba(99,102,241,0.15)]">
                    <div className="relative h-44 overflow-hidden bg-[#13151d]">
                      <img
                        src={resolveImageUrl(product.image)}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      {product.isFeatured && (
                        <div className="absolute right-2 top-2 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-black">
                          ★ TOP PICK
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#555D78]">{product.brand}</p>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-[#E8EAF0] group-hover:text-white">
                        {product.name}
                      </p>
                      <StarRow rating={product.rating} />
                      <p className="mt-auto pt-3 font-syne text-lg font-bold text-[#E8EAF0]">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                  </div>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Deal banner ──────────────────────────────────────────────────── */}
      <div className="relative z-10 overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/60 to-purple-950/40 p-7">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-600/10 to-transparent" />
        <Chip color="accent" variant="soft" size="sm" className="mb-3">Limited Time</Chip>
        <h3 className="font-syne text-2xl font-bold text-[#E8EAF0]">Up to 30% off Gaming Accessories</h3>
        <p className="mt-1 text-sm text-[#8B91A8]">Razer, SteelSeries, Corsair and more — explore deals on controllers, mice and headsets.</p>
        <Link to="/products?category=Gaming+Accessories" className="mt-4 inline-block">
          <Button className="bg-indigo-600 text-white hover:bg-indigo-500">Shop Gaming Deals</Button>
        </Link>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[#2A2E3E] bg-[#14161C] p-4 text-center">
            <p className="font-syne text-2xl font-bold text-indigo-400">{stat.value}</p>
            <p className="mt-1 text-xs text-[#555D78]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Reviews ──────────────────────────────────────────────────────── */}
      <section className="relative z-10">
        <h2 className="mb-4 font-syne text-xl font-bold text-[#E8EAF0]">What Customers Say</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {REVIEWS.map((review) => (
            <Card key={review.initials} className="border border-[#2A2E3E] bg-[#1C1F29]">
              <Card.Content className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
                    {review.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#E8EAF0]">{review.name}</p>
                    <p className="text-[10px] text-[#555D78]">Verified buyer</p>
                  </div>
                </div>
                <p className="text-amber-400 text-sm mb-2">★★★★★</p>
                <p className="text-sm leading-relaxed text-[#8B91A8]">{review.text}</p>
              </Card.Content>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Newsletter ───────────────────────────────────────────────────── */}
      <Card className="relative z-10 border border-indigo-500/20 bg-indigo-950/30">
        <Card.Content className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h3 className="font-syne text-xl font-bold text-[#E8EAF0]">Get the best electronics deals</h3>
              <p className="mt-1 text-sm text-[#8B91A8]">
                Weekly drops on chargers, audio gear, gaming and more.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="h-10 min-w-[200px] flex-1 rounded-xl border border-[#2A2E3E] bg-[#1C1F29] px-4 text-sm text-[#E8EAF0] outline-none placeholder-[#555D78] focus:border-indigo-500 transition"
              />
              <Button className="bg-indigo-600 text-white hover:bg-indigo-500">Subscribe</Button>
            </div>
          </div>
        </Card.Content>
      </Card>
    </section>
  );
};

export default Home;
