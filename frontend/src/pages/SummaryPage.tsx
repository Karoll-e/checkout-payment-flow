import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { transactionsApi } from '../services/api';
import { transactionCreated, transactionResolved } from '../features/checkout/checkoutSlice';
import './SummaryPage.css';

export default function SummaryPage() {
  const { selectedProduct, quantity, customer, delivery, deliveryFee } = useAppSelector(
    (s) => s.checkout,
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const cardToken = (location.state as { cardToken?: string } | null)?.cardToken;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!selectedProduct || !customer || !delivery) {
    navigate('/');
    return null;
  }

  if (!cardToken) {
    // The token was lost (e.g. a refresh on this screen) — restart the flow.
    navigate('/');
    return null;
  }

  const productAmount = selectedProduct.price * quantity;
  const baseFee = 5000;
  const total = productAmount + baseFee + (deliveryFee ?? 0);

  const handlePay = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const transaction = await transactionsApi.create({
        productId: selectedProduct.id,
        quantity,
        customer,
        delivery,
        deliveryFee,
      });
      dispatch(transactionCreated({ transactionId: transaction.id }));

      const confirmed = await transactionsApi.confirm(transaction.id, cardToken);
      dispatch(
        transactionResolved({
          status: confirmed.status,
          errorMessage: confirmed.errorMessage,
        }),
      );

      navigate('/status');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { reason?: string } } } };
      const wompiReason = axiosErr.response?.data?.error?.reason;
      setError(wompiReason ?? 'Could not process payment. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <section className="summary-page">
      <div className="summary-page__content">
        <h1 className="summary-page__title">Order summary</h1>

        <div className="summary-page__details">
          <div className="summary-page__row">
            <span className="summary-page__label">{selectedProduct.name} x{quantity}</span>
            <span className="summary-page__value">
              {productAmount.toLocaleString('en-US', { style: 'currency', currency: 'COP' })}
            </span>
          </div>
          <div className="summary-page__row">
            <span className="summary-page__label">Base fee</span>
            <span className="summary-page__value">
              {baseFee.toLocaleString('en-US', { style: 'currency', currency: 'COP' })}
            </span>
          </div>
          <div className="summary-page__row">
            <span className="summary-page__label">Shipping</span>
            <span className="summary-page__value">
              {(deliveryFee ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'COP' })}
            </span>
          </div>
          <div className="summary-page__row summary-page__row--total">
            <span className="summary-page__label">Total</span>
            <span className="summary-page__value">
              {total.toLocaleString('en-US', { style: 'currency', currency: 'COP' })}
            </span>
          </div>
        </div>

        {error && <p className="summary-page__error">{error}</p>}

        <button
          type="button"
          onClick={handlePay}
          disabled={submitting}
          className="summary-page__pay-button"
        >
          {submitting ? 'Processing payment...' : 'Pay now'}
        </button>
      </div>

      <p className="summary-page__footer">
        <span className="summary-page__globe" aria-hidden="true">
          &#127760;
        </span>
        Play more anywhere
      </p>
    </section>
  );
}