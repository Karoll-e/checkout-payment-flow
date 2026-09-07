import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { transactionsApi } from '../services/api';
import './StatusPage.css';

type TransactionStatus = 'IDLE' | 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export default function StatusPage() {
  const { selectedProduct, quantity, customer, delivery, deliveryFee, transactionId, transactionStatus, errorMessage } = useAppSelector(
    (s) => s.checkout,
  );
  const navigate = useNavigate();

  const [polledStatus, setPolledStatus] = useState<TransactionStatus | null>(null);
  const [polledMessage, setPolledMessage] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // Use Redux state as source of truth initially; polling updates override it
  const status = polledStatus ?? transactionStatus;
  const message = polledMessage ?? errorMessage;

  useEffect(() => {
    if (!transactionId || transactionStatus !== 'PENDING') return;

    let cancelled = false;
    const poll = async () => {
      setChecking(true);
      try {
        const tx = await transactionsApi.getById(transactionId);
        if (!cancelled) {
          setPolledStatus(tx.status);
          setPolledMessage(tx.errorMessage ?? null);
        }
      } catch {
        if (!cancelled) {
          setPolledStatus('ERROR');
          setPolledMessage('Could not fetch transaction status.');
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [transactionId, transactionStatus]);

  if (!selectedProduct || !customer || !delivery) {
    navigate('/');
    return null;
  }

  const productAmount = selectedProduct.price * quantity;
  const baseFee = 5000;
  const total = productAmount + baseFee + (deliveryFee ?? 0);

  const isFinal = status !== 'IDLE' && status !== 'PENDING' && !checking;
  const isSuccess = status === 'APPROVED';
  const isFailure = status === 'DECLINED' || status === 'ERROR';

  return (
    <section className="status-page">
      <div className="status-page__content">
        <div className={`status-page__icon status-page__icon--${isSuccess ? 'success' : isFailure ? 'failure' : 'pending'}`}>
          {isSuccess && <span aria-hidden="true">✓</span>}
          {isFailure && <span aria-hidden="true">✕</span>}
          {(status === 'PENDING' || checking) && (
            <span className="status-page__spinner" aria-hidden="true" />
          )}
        </div>

        <h1 className="status-page__title">
          {status === 'PENDING' || checking
            ? 'Processing your payment...'
            : isSuccess
            ? 'Payment approved!'
            : 'Payment declined'}
        </h1>

        <p className="status-page__subtitle">
          {status === 'PENDING' || checking
            ? 'We are confirming your payment with Wompi. This usually takes a few seconds.'
            : isSuccess
            ? 'Your order has been confirmed and is being prepared for shipment.'
            : message || 'There was an issue processing your payment. Please try again.'}
        </p>

        <div className="status-page__details">
          <div className="status-page__detail-row">
            <span className="status-page__detail-label">Order total</span>
            <span className="status-page__detail-value">
              {total.toLocaleString('en-US', { style: 'currency', currency: 'COP' })}
            </span>
          </div>
          <div className="status-page__detail-row">
            <span className="status-page__detail-label">Transaction ID</span>
            <span className="status-page__detail-value status-page__detail-value--mono">
              {transactionId?.slice(0, 12)}...
            </span>
          </div>
          <div className="status-page__detail-row">
            <span className="status-page__detail-label">Status</span>
            <span className={`status-page__detail-value status-page__badge status-page__badge--${status.toLowerCase()}`}>
              {status}
            </span>
          </div>
        </div>

        {customer && (
          <div className="status-page__section">
            <h2 className="status-page__section-title">Shipping to</h2>
            <p className="status-page__address">
              {customer.name}<br />
              {delivery.address}<br />
              {delivery.city}
            </p>
          </div>
        )}

        {isFinal && (
          <div className="status-page__actions">
            <button
              type="button"
              className="status-page__button status-page__button--primary"
              onClick={() => navigate('/')}
            >
              {isSuccess ? 'Back to shop' : 'Try again'}
            </button>
          </div>
        )}
      </div>

      <p className="status-page__footer">
        <span className="status-page__globe" aria-hidden="true">
          &#127760;
        </span>
        Play more anywhere
      </p>
    </section>
  );
}