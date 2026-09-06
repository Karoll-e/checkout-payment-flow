import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type TransactionStatus = 'IDLE' | 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

interface SelectedProduct {
  id: string;
  name: string;
  price: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

interface DeliveryInfo {
  address: string;
  city: string;
}

export interface CheckoutState {
  selectedProduct: SelectedProduct | null;
  quantity: number;
  customer: CustomerInfo | null;
  delivery: DeliveryInfo | null;
  deliveryFee: number;
  transactionId: string | null;
  transactionStatus: TransactionStatus;
  errorMessage: string | null;
}

const initialState: CheckoutState = {
  selectedProduct: null,
  quantity: 1,
  customer: null,
  delivery: null,
  deliveryFee: 10000, // valor fijo por ahora, según acordamos
  transactionId: null,
  transactionStatus: 'IDLE',
  errorMessage: null,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    selectProduct: (
      state,
      action: PayloadAction<{ product: SelectedProduct; quantity: number }>,
    ) => {
      state.selectedProduct = action.payload.product;
      state.quantity = action.payload.quantity;
    },
    setCustomerAndDelivery: (
      state,
      action: PayloadAction<{ customer: CustomerInfo; delivery: DeliveryInfo }>,
    ) => {
      state.customer = action.payload.customer;
      state.delivery = action.payload.delivery;
    },
    transactionCreated: (state, action: PayloadAction<{ transactionId: string }>) => {
      state.transactionId = action.payload.transactionId;
      state.transactionStatus = 'PENDING';
    },
    transactionResolved: (
      state,
      action: PayloadAction<{ status: TransactionStatus; errorMessage?: string }>,
    ) => {
      state.transactionStatus = action.payload.status;
      state.errorMessage = action.payload.errorMessage ?? null;
    },
    resetCheckout: () => initialState,
  },
});

export const {
  selectProduct,
  setCustomerAndDelivery,
  transactionCreated,
  transactionResolved,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;