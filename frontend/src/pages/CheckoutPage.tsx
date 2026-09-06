import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { setCustomerAndDelivery } from '../features/checkout/checkoutSlice';
import { tokenizeCard } from '../services/wompi';
import CardForm, { type CardFormValues } from '../components/CardForm';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const selectedProduct = useAppSelector((s) => s.checkout.selectedProduct);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [cardValues, setCardValues] = useState<CardFormValues | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!selectedProduct) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cardValues) {
      setError('Completa los datos de la tarjeta.');
      return;
    }

    setSubmitting(true);
    try {
      const cardToken = await tokenizeCard({
        number: cardValues.number.replace(/\s/g, ''),
        cvc: cardValues.cvc,
        expMonth: cardValues.expMonth,
        expYear: cardValues.expYear,
        cardHolder: cardValues.cardHolder,
      });

      dispatch(
        setCustomerAndDelivery({
          customer: { name, email, phone },
          delivery: { address, city },
        }),
      );

      navigate('/summary', { state: { cardToken } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo procesar la tarjeta');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1>Datos de pago y entrega</h1>

      <form onSubmit={handleSubmit} className="checkout-page__form">
        <fieldset>
          <legend>Tus datos</legend>
          <label>
            Nombre completo
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Teléfono
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </label>
        </fieldset>

        <fieldset>
          <legend>Dirección de entrega</legend>
          <label>
            Dirección
            <input value={address} onChange={(e) => setAddress(e.target.value)} required />
          </label>
          <label>
            Ciudad
            <input value={city} onChange={(e) => setCity(e.target.value)} required />
          </label>
        </fieldset>

        <CardForm onChange={setCardValues} />

        {error && <p className="checkout-page__error">{error}</p>}

        <button type="submit" disabled={submitting} className="checkout-page__submit">
          {submitting ? 'Validando tarjeta...' : 'Continuar'}
        </button>
      </form>
    </div>
  );
}