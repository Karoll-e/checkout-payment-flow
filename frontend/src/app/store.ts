import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer, {
  type CheckoutState,
} from '../features/checkout/checkoutSlice';

const PERSIST_KEY = 'checkout-state';

function loadPersistedCheckout(): CheckoutState | undefined {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

export const store = configureStore({
  reducer: { checkout: checkoutReducer },
  preloadedState: {
    checkout: loadPersistedCheckout() as CheckoutState,
  },
});

store.subscribe(() => {
  try {
    localStorage.setItem(
      PERSIST_KEY,
      JSON.stringify(store.getState().checkout),
    );
  } catch {  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;