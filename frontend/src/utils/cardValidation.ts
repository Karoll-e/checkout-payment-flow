import { detectCardBrand, type CardBrand } from './cardBrand';

export { detectCardBrand };
export type { CardBrand };

/** Removes any non-digit character. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** Groups digits in blocks of 4 for a nicer "0000 0000 0000 0000" display. */
export function formatCardNumber(value: string): string {
  return onlyDigits(value)
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

/** Luhn checksum — every real card number (and every valid fake test number) must pass it. */
export function isValidLuhn(cardNumber: string): boolean {
  const digits = onlyDigits(cardNumber);
  if (digits.length < 13) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function isValidCardNumber(cardNumber: string): boolean {
  const digits = onlyDigits(cardNumber);
  return digits.length >= 13 && digits.length <= 19 && isValidLuhn(digits);
}

export function isValidExpiry(month: string, year: string): boolean {
  const m = Number(month);
  let y = Number(year);
  if (!m || !y || m < 1 || m > 12) return false;

  if (year.length === 2) y += 2000;
  if (String(y).length !== 4) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (y < currentYear) return false;
  if (y === currentYear && m < currentMonth) return false;
  if (y > currentYear + 15) return false;

  return true;
}

export function isValidCvc(cvc: string, brand: CardBrand): boolean {
  const digits = onlyDigits(cvc);
  return brand === 'amex' ? digits.length === 4 : digits.length >= 3 && digits.length <= 4;
}
