import { createSlice } from '@reduxjs/toolkit';

const CART_STORAGE_KEY = 'smartcart_cart_items';

const loadCartItems = () => {
  try {
    if (typeof window === 'undefined') {
      return [];
    }

    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const persistCartItems = (items) => {
  try {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    // Ignore persistence errors to avoid breaking cart UX.
  }
};

const initialState = {
  items: loadCartItems(),
};

const getItemKey = (item) => item._id || item.id;

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const incomingItem = action.payload;
      const incomingKey = getItemKey(incomingItem);
      const existingItem = state.items.find((item) => getItemKey(item) === incomingKey);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...incomingItem, quantity: 1 });
      }

      persistCartItems(state.items);
    },
    incrementQuantity: (state, action) => {
      const item = state.items.find((cartItem) => getItemKey(cartItem) === action.payload);
      if (item) {
        item.quantity += 1;
        persistCartItems(state.items);
      }
    },
    decrementQuantity: (state, action) => {
      const item = state.items.find((cartItem) => getItemKey(cartItem) === action.payload);
      if (!item) {
        return;
      }

      if (item.quantity <= 1) {
        state.items = state.items.filter((cartItem) => getItemKey(cartItem) !== action.payload);
      } else {
        item.quantity -= 1;
      }

      persistCartItems(state.items);
    },
    removeFromCart: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((item) => getItemKey(item) !== id);
      persistCartItems(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      persistCartItems(state.items);
    },
  },
});

export const { addToCart, incrementQuantity, decrementQuantity, removeFromCart, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
