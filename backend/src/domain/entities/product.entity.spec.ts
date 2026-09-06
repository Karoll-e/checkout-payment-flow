import { Product } from './product.entity.js';

describe('Product', () => {
  it('crea un producto válido', () => {
    const product = new Product('1', 'Mouse', 'Mouse gamer', 50000, 10);
    expect(product.stock).toBe(10);
    expect(product.hasStock()).toBe(true);
  });

  it('lanza error si el precio es negativo', () => {
    expect(() => new Product('1', 'Mouse', 'desc', -100, 10)).toThrow(
      'Price cannot be negative',
    );
  });

  it('lanza error si el stock inicial es negativo', () => {
    expect(() => new Product('1', 'Mouse', 'desc', 100, -5)).toThrow(
      'Stock cannot be negative',
    );
  });

  it('descuenta stock correctamente', () => {
    const product = new Product('1', 'Mouse', 'desc', 50000, 10);
    product.decreaseStock(3);
    expect(product.stock).toBe(7);
  });

  it('lanza error al descontar más stock del disponible', () => {
    const product = new Product('1', 'Mouse', 'desc', 50000, 2);
    expect(() => product.decreaseStock(5)).toThrow('Insufficient stock');
  });

  it('lanza error al descontar una cantidad no positiva', () => {
    const product = new Product('1', 'Mouse', 'desc', 50000, 10);
    expect(() => product.decreaseStock(0)).toThrow(
      'Quantity to decrease must be positive',
    );
    expect(() => product.decreaseStock(-1)).toThrow(
      'Quantity to decrease must be positive',
    );
  });

  it('hasStock devuelve false si no alcanza para la cantidad pedida', () => {
    const product = new Product('1', 'Mouse', 'desc', 50000, 2);
    expect(product.hasStock(5)).toBe(false);
  });

  it('hasStock devuelve true cuando el stock es exactamente igual a la cantidad pedida', () => {
  const product = new Product('1', 'Mouse', 'desc', 50000, 5);
  expect(product.hasStock(5)).toBe(true);
  });
});