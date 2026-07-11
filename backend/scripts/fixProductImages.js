const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');

const UPLOADS_DIR = path.resolve(__dirname, '../uploads');

// ── Image map: first matching keyword wins ────────────────────────────────────
const IMAGE_MAP = [
  {
    keywords: ['wh-1000xm5', 'wh1000', 'noise cancell', 'over-ear', 'headphone', 'headset', 'earphone', 'earbuds', 'in-ear', 'audio'],
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['mechanical keyboard', 'keychron', 'gaming keyboard', 'keyboard'],
    url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['stream deck', 'capture card', 'elgato'],
    url: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['webcam', 'c920', 'c922', 'c925', 'c930', 'logitech cam'],
    url: 'https://images.unsplash.com/photo-1587802274527-970cc09f7f3d?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['monitor', '4k display', 'usb-c display', 'lg 27', 'dell u', 'ips display', 'screen'],
    url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['usb hub', 'usb-c hub', 'usb dock', 'docking', 'anker hub', '655 usb'],
    url: 'https://images.unsplash.com/photo-1619953942547-233ac60f7b4c?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['power bank', 'portable charger', 'portable battery', 'battery pack'],
    url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['charger', 'usb-c cable', 'lightning cable', 'charging cable', 'braided cable', 'cable'],
    url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['apple watch', 'galaxy watch', 'smartwatch', 'smart watch', 'fitness tracker', 'band'],
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['gaming mouse', 'razer', 'corsair', 'steelseries', 'logitech g', 'hyperx'],
    url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['controller', 'gamepad', 'xbox', 'playstation', 'ps5', 'ps4', 'switch', 'gaming'],
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['router', 'wifi', 'mesh', 'ethernet switch', 'network switch', 'modem', 'networking'],
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['microphone', 'blue yeti', 'condenser mic', 'podcast mic'],
    url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['speaker', 'bluetooth speaker', 'soundbar', 'bose', 'sonos'],
    url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['laptop stand', 'monitor arm', 'desk mount', 'stand', 'mount'],
    url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['mouse pad', 'desk mat', 'mousepad'],
    url: 'https://images.unsplash.com/photo-1615750173703-a3d05e8d6c64?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['ssd', 'hard drive', 'external drive', 'storage', 'nvme', 'portable ssd'],
    url: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&w=600&q=80',
  },
];

// Category fallbacks when no keyword matches
const CATEGORY_FALLBACKS = {
  'chargers & cables':  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
  'power banks':        'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&q=80',
  'headphones & audio': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  'keyboards':          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
  'gaming accessories': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
  'smart watches':      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
  'pc accessories':     'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
  'networking':         'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
};

const GENERIC_FALLBACK =
  'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?auto=format&fit=crop&w=600&q=80';

// ── Helpers ───────────────────────────────────────────────────────────────────

function pickImage(product) {
  const searchText = `${product.name} ${product.description || ''}`.toLowerCase();

  for (const entry of IMAGE_MAP) {
    if (entry.keywords.some((kw) => searchText.includes(kw))) {
      return entry.url;
    }
  }

  const cat = (product.category || '').toLowerCase().trim();
  return CATEGORY_FALLBACKS[cat] || GENERIC_FALLBACK;
}

function isBroken(image) {
  if (!image || !image.trim()) return true;

  const normalized = image.trim().replace(/\\/g, '/');

  // External URL — check nothing, keep as-is
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return false;
  }

  // Local upload path — check if the file physically exists
  if (normalized.startsWith('/uploads/') || normalized.startsWith('uploads/')) {
    const filename = normalized.replace(/^\/?uploads\//, '');
    const filePath = path.join(UPLOADS_DIR, filename);
    return !fs.existsSync(filePath);
  }

  // Anything else (bare filename, wrong path, etc.) is broken
  return true;
}

// ── Main ──────────────────────────────────────────────────────────────────────

// Known-bad Unsplash photo IDs found in the DB (wrong hash after the hyphen)
const BROKEN_UNSPLASH_IDS = new Set([
  'photo-1527443224154-c4a573d5f5ea', // LG monitor  (correct: c4a3942d3acf)
  'photo-1587302186428-d1f07b65abc9', // Logitech webcam
  'photo-1625948515291-2a12a94ebdde', // Anker hub
]);

function isBrokenUnsplash(image) {
  if (!image) return false;
  return [...BROKEN_UNSPLASH_IDS].some((id) => image.includes(id));
}

async function run() {
  await connectDB();

  // --force flag replaces ALL products; default only fixes broken ones
  const force = process.argv.includes('--force');

  const products = await Product.find({});
  console.log(`\nFound ${products.length} products total. mode=${force ? 'FORCE' : 'auto'}\n`);

  let fixed = 0;
  let skipped = 0;

  for (const product of products) {
    const needsFix = force || isBroken(product.image) || isBrokenUnsplash(product.image);

    if (!needsFix) {
      console.log(`  SKIP  "${product.name}"`);
      skipped++;
      continue;
    }

    const newUrl = pickImage(product);
    product.image = newUrl;
    await product.save();
    console.log(`  FIXED "${product.name}"\n        → ${newUrl}`);
    fixed++;
  }

  console.log(`\n✓ Done. Fixed ${fixed} products, skipped ${skipped}.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
