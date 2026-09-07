export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown';

export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = cardNumber.replace(/\s/g, '');

  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';

  return 'unknown';
}