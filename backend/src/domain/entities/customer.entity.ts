const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?\d{7,15}$/;

export class Customer {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public phone: string,
  ) {
    if (!name?.trim()) {
      throw new Error('Customer name is required');
    }
    if (!EMAIL_REGEX.test(email)) {
      throw new Error('Invalid email format');
    }
    if (!PHONE_REGEX.test(phone)) {
      throw new Error('Invalid phone format');
    }
  }
}