const WOMPI_API_URL = import.meta.env.VITE_WOMPI_API_URL;
const WOMPI_PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY;

export interface TokenizeCardInput {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
}

export async function tokenizeCard(input: TokenizeCardInput): Promise<string> {
  const response = await fetch(`${WOMPI_API_URL}/tokens/cards`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WOMPI_PUBLIC_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      number: input.number,
      cvc: input.cvc,
      exp_month: input.expMonth,
      exp_year: input.expYear,
      card_holder: input.cardHolder,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.reason ?? 'No se pudo validar la tarjeta');
  }

  return data.data.id;
}