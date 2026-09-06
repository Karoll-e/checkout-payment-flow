import { Delivery } from './delivery.entity.js';

describe('Delivery', () => {
  it('crea una entrega válida', () => {
    const delivery = new Delivery('1', 'Calle 123', 'Cartagena');
    expect(delivery.city).toBe('Cartagena');
  });

  it('lanza error si la dirección está vacía', () => {
    expect(() => new Delivery('1', '', 'Cartagena')).toThrow('Address is required');
  });

  it('lanza error si la ciudad está vacía', () => {
    expect(() => new Delivery('1', 'Calle 123', '')).toThrow('City is required');
  });
});