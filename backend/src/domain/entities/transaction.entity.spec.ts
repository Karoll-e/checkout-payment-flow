import { Transaction, TransactionStatus } from './transaction.entity.js';

function buildPendingTransaction() {
  return new Transaction(
    'tx-1',
    'product-1',
    2,
    'customer-1',
    'delivery-1',
    100000,
    5000,
    10000,
  );
}

describe('Transaction', () => {
  it('se crea en estado PENDING por defecto', () => {
    const tx = buildPendingTransaction();
    expect(tx.status).toBe(TransactionStatus.PENDING);
    expect(tx.isPending).toBe(true);
  });

  it('calcula el total correctamente', () => {
    const tx = buildPendingTransaction();
    expect(tx.totalAmount).toBe(115000); // 100000 + 5000 + 10000
  });

  it('lanza error si quantity no es positiva', () => {
    expect(
      () => new Transaction('tx-1', 'p-1', 0, 'c-1', 'd-1', 100000, 5000, 10000),
    ).toThrow('Quantity must be positive');
  });

  it('lanza error si algún monto es negativo', () => {
    expect(
      () => new Transaction('tx-1', 'p-1', 1, 'c-1', 'd-1', -1, 5000, 10000),
    ).toThrow('Amounts cannot be negative');
  });

  it('markApproved cambia el estado y guarda el id de Wompi', () => {
    const tx = buildPendingTransaction();
    tx.markApproved('wompi-123');
    expect(tx.status).toBe(TransactionStatus.APPROVED);
    expect(tx.wompiTransactionId).toBe('wompi-123');
    expect(tx.isPending).toBe(false);
  });

  it('markDeclined cambia el estado y guarda el motivo', () => {
    const tx = buildPendingTransaction();
    tx.markDeclined('wompi-123', 'Fondos insuficientes');
    expect(tx.status).toBe(TransactionStatus.DECLINED);
    expect(tx.errorMessage).toBe('Fondos insuficientes');
  });

  it('markError cambia el estado y guarda el motivo', () => {
    const tx = buildPendingTransaction();
    tx.markError('Timeout al llamar a Wompi');
    expect(tx.status).toBe(TransactionStatus.ERROR);
    expect(tx.errorMessage).toBe('Timeout al llamar a Wompi');
  });

  it('no permite aprobar una transacción ya resuelta', () => {
    const tx = buildPendingTransaction();
    tx.markApproved('wompi-123');
    expect(() => tx.markApproved('wompi-456')).toThrow(
      'Cannot transition transaction from APPROVED: already resolved',
    );
  });

  it('no permite declinar una transacción ya aprobada', () => {
    const tx = buildPendingTransaction();
    tx.markApproved('wompi-123');
    expect(() => tx.markDeclined('wompi-456')).toThrow(
      'Cannot transition transaction from APPROVED: already resolved',
    );
  });
});