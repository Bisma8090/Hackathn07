import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  note: string;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  orderType: 'Dine In' | 'To Go' | 'Delivery';
  discount: number;
  tableNo: string;
  customerName: string;
  paymentMethod: 'Cash' | 'Credit Card' | 'Paypal';
}

const initialState: CartState = {
  items: [],
  orderType: 'Dine In',
  discount: 0,
  tableNo: '',
  customerName: '',
  paymentMethod: 'Cash',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<Omit<CartItem, 'quantity' | 'note'>>) {
      const existing = state.items.find(
        (i) => i.productId === action.payload.productId,
      );
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1, note: '' });
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    updateQuantity(
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) {
      const item = state.items.find(
        (i) => i.productId === action.payload.productId,
      );
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(
            (i) => i.productId !== action.payload.productId,
          );
        } else {
          item.quantity = action.payload.quantity;
        }
      }
    },
    updateNote(
      state,
      action: PayloadAction<{ productId: string; note: string }>,
    ) {
      const item = state.items.find(
        (i) => i.productId === action.payload.productId,
      );
      if (item) item.note = action.payload.note;
    },
    setOrderType(state, action: PayloadAction<CartState['orderType']>) {
      state.orderType = action.payload;
    },
    setDiscount(state, action: PayloadAction<number>) {
      state.discount = action.payload;
    },
    setTableNo(state, action: PayloadAction<string>) {
      state.tableNo = action.payload;
    },
    setCustomerName(state, action: PayloadAction<string>) {
      state.customerName = action.payload;
    },
    setPaymentMethod(state, action: PayloadAction<CartState['paymentMethod']>) {
      state.paymentMethod = action.payload;
    },
    clearCart(state) {
      state.items = [];
      state.discount = 0;
      state.tableNo = '';
      state.customerName = '';
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  updateNote,
  setOrderType,
  setDiscount,
  setTableNo,
  setCustomerName,
  setPaymentMethod,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

export const selectCartSubtotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export const selectCartTotal = (state: { cart: CartState }) =>
  selectCartSubtotal(state) - state.cart.discount;
