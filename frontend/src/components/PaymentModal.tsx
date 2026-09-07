import { useEffect, useState } from 'react';
import type { ProductDto } from '../services/api';
import { tokenizeCard } from '../services/wompi';
import { VisaLogo, MastercardLogo, AmexLogo } from './CardLogos';
import {
  detectCardBrand,
  formatCardNumber,
  isValidCardNumber,
  isValidCvc,
  isValidExpiry,
  onlyDigits,
} from '../utils/cardValidation';
import './PaymentModal.css';

interface PaymentModalProps {
  isOpen: boolean;
  product: ProductDto;
  quantity: number;
  onClose: () => void;
  onConfirm: (payload: {
    customer: { name: string; email: string; phone: string };
    delivery: { address: string; city: string };
    cardToken: string;
  }) => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolder: string;
}

const initialForm: FormState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  cardNumber: '',
  expMonth: '',
  expYear: '',
  cvc: '',
  cardHolder: '',
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function PaymentModal({
  isOpen,
  product,
  quantity,
  onClose,
  onConfirm,
}: PaymentModalProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const brand = detectCardBrand(form.cardNumber);

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};

    if (form.name.trim().length < 3) next.name = 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (onlyDigits(form.phone).length < 7) next.phone = 'Enter a valid phone number.';
    if (form.address.trim().length < 5) next.address = 'Enter a valid delivery address.';
    if (form.city.trim().length < 2) next.city = 'Enter a valid city.';

    if (!isValidCardNumber(form.cardNumber)) next.cardNumber = 'Enter a valid card number.';
    if (!isValidExpiry(form.expMonth, form.expYear)) next.expMonth = 'Invalid expiry date.';
    if (!isValidCvc(form.cvc, brand)) next.cvc = 'Invalid security code.';
    if (form.cardHolder.trim().length < 3) next.cardHolder = "Enter the cardholder's name.";

    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const cardToken = await tokenizeCard({
        number: onlyDigits(form.cardNumber),
        cvc: form.cvc,
        expMonth: form.expMonth.padStart(2, '0'),
        expYear: form.expYear,
        cardHolder: form.cardHolder,
      });

      onConfirm({
        customer: { name: form.name, email: form.email, phone: form.phone },
        delivery: { address: form.address, city: form.city },
        cardToken,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'The card could not be validated.');
    } finally {
      setSubmitting(false);
    }
  };

  const productAmount = product.price * quantity;

  return (
    <div className="payment-modal__overlay" onClick={onClose}>
      <div
        className="payment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="payment-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <h2 id="payment-modal-title" className="payment-modal__title">
          Pay with credit card
        </h2>
        <p className="payment-modal__subtitle">
          {product.name} &times; {quantity} —{' '}
          {productAmount.toLocaleString('en-US', { style: 'currency', currency: 'COP' })}
        </p>

        <form className="payment-modal__form" onSubmit={handleSubmit} noValidate>
          <fieldset className="payment-modal__fieldset">
            <legend>Contact information</legend>

            <label>
              Full name
              <input
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Jane Doe"
              />
              {errors.name && <span className="payment-modal__error">{errors.name}</span>}
            </label>

            <div className="">
              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="jane@example.com"
                />
                {errors.email && <span className="payment-modal__error">{errors.email}</span>}
              </label>
              <label>
                Phone
                <input
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="3001234567"
                />
                {errors.phone && <span className="payment-modal__error">{errors.phone}</span>}
              </label>
            </div>
          </fieldset>

          <fieldset className="payment-modal__fieldset">
            <legend>Delivery information</legend>

            <label>
              Address
              <input
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                placeholder="123 Main St"
              />
              {errors.address && <span className="payment-modal__error">{errors.address}</span>}
            </label>
            <label>
              City
              <input
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                placeholder="Bogotá"
              />
              {errors.city && <span className="payment-modal__error">{errors.city}</span>}
            </label>
          </fieldset>

          <fieldset className="payment-modal__fieldset">
            <legend>Card information</legend>

            <div className="payment-modal__brand-logos">
              <span className={brand === 'visa' ? 'is-active' : ''}>
                <VisaLogo />
              </span>
              <span className={brand === 'mastercard' ? 'is-active' : ''}>
                <MastercardLogo />
              </span>
              <span className={brand === 'amex' ? 'is-active' : ''}>
                <AmexLogo />
              </span>
            </div>

            <label>
              Card number
              <input
                inputMode="numeric"
                value={form.cardNumber}
                onChange={(e) => update('cardNumber', formatCardNumber(e.target.value))}
                placeholder="4242 4242 4242 4242"
                maxLength={23}
              />
              {errors.cardNumber && (
                <span className="payment-modal__error">{errors.cardNumber}</span>
              )}
            </label>

            <div className="">
              <label>
                Month
                <input
                  inputMode="numeric"
                  maxLength={2}
                  value={form.expMonth}
                  onChange={(e) => update('expMonth', onlyDigits(e.target.value))}
                  placeholder="12"
                />
              </label>
              <label>
                Year
                <input
                  inputMode="numeric"
                  maxLength={2}
                  value={form.expYear}
                  onChange={(e) => update('expYear', onlyDigits(e.target.value))}
                  placeholder="30"
                />
              </label>
              <label>
                CVC
                <input
                  inputMode="numeric"
                  maxLength={4}
                  value={form.cvc}
                  onChange={(e) => update('cvc', onlyDigits(e.target.value))}
                  placeholder="123"
                />
              </label>
            </div>
            {errors.expMonth && <span className="payment-modal__error">{errors.expMonth}</span>}
            {errors.cvc && <span className="payment-modal__error">{errors.cvc}</span>}

            <label>
              Cardholder name
              <input
                value={form.cardHolder}
                onChange={(e) => update('cardHolder', e.target.value)}
                placeholder="JANE DOE"
              />
              {errors.cardHolder && (
                <span className="payment-modal__error">{errors.cardHolder}</span>
              )}
            </label>
          </fieldset>

          {submitError && <p className="payment-modal__submit-error">{submitError}</p>}

          <button type="submit" className="payment-modal__submit" disabled={submitting}>
            {submitting ? 'Validating card...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
