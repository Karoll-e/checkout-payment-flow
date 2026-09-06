import { Customer } from './customer.entity.js';

describe('Customer', () => {
  it('crea un customer válido', () => {
    const customer = new Customer('1', 'Karoll', 'karoll@test.com', '+573001234567');
    expect(customer.name).toBe('Karoll');
  });

  it('lanza error si el nombre está vacío', () => {
    expect(() => new Customer('1', '', 'karoll@test.com', '+573001234567')).toThrow(
      'Customer name is required',
    );
  });

  it('lanza error si el nombre es solo espacios', () => {
    expect(() => new Customer('1', '   ', 'karoll@test.com', '+573001234567')).toThrow(
      'Customer name is required',
    );
  });

  it('lanza error con email inválido', () => {
    expect(() => new Customer('1', 'Karoll', 'no-es-un-email', '+573001234567')).toThrow(
      'Invalid email format',
    );
  });

  it('lanza error con teléfono inválido', () => {
    expect(() => new Customer('1', 'Karoll', 'karoll@test.com', 'abc123')).toThrow(
      'Invalid phone format',
    );
  });
});