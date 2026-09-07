import { useState } from 'react';
import { detectCardBrand } from '../utils/cardBrand';
import './CardForm.css';

export interface CardFormValues {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolder: string;
}

interface CardFormProps {
  onChange: (values: CardFormValues) => void;
}

export default function CardForm({ onChange }: CardFormProps) {
  const [values, setValues] = useState<CardFormValues>({
    number: '',
    expMonth: '',
    expYear: '',
    cvc: '',
    cardHolder: '',
  });

  const brand = detectCardBrand(values.number);

  const update = (field: keyof CardFormValues, value: string) => {
    const updated = { ...values, [field]: value };
    setValues(updated);
    onChange(updated);
  };

  return (
    <fieldset className="card-form">
      <legend>Datos de la tarjeta</legend>

      <label>
        Número de tarjeta
        <div className="card-form__number-wrapper">
          <input
            type="text"
            inputMode="numeric"
            maxLength={19}
            placeholder="4242 4242 4242 4242"
            value={values.number}
            onChange={(e) => update('number', e.target.value)}
          />
          {brand !== 'unknown' && (
            <span className={`card-form__brand card-form__brand--${brand}`}>
              {brand === 'visa' ? 'VISA' : 'Mastercard'}
            </span>
          )}
        </div>
      </label>

      <div className="card-form__row">
        <label>
          Mes exp.
          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            placeholder="12"
            value={values.expMonth}
            onChange={(e) => update('expMonth', e.target.value)}
          />
        </label>
        <label>
          Año exp.
          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            placeholder="30"
            value={values.expYear}
            onChange={(e) => update('expYear', e.target.value)}
          />
        </label>
        <label>
          CVC
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            placeholder="123"
            value={values.cvc}
            onChange={(e) => update('cvc', e.target.value)}
          />
        </label>
      </div>

      <label>
        Nombre del titular
        <input
          type="text"
          placeholder="Karoll Escalante"
          value={values.cardHolder}
          onChange={(e) => update('cardHolder', e.target.value)}
        />
      </label>
    </fieldset>
  );
}