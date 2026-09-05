export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  ERROR = 'ERROR',
}

export class Transaction {
  private _status: TransactionStatus;
  private _wompiTransactionId?: string;
  private _errorMessage?: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly customerId: string,
    public readonly deliveryId: string,
    public readonly productAmount: number,
    public readonly baseFee: number,
    public readonly deliveryFee: number,
    status: TransactionStatus = TransactionStatus.PENDING,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    if (productAmount < 0 || baseFee < 0 || deliveryFee < 0) {
      throw new Error('Amounts cannot be negative');
    }
    this._status = status;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }

  get status(): TransactionStatus {
    return this._status;
  }

  get wompiTransactionId(): string | undefined {
    return this._wompiTransactionId;
  }

  get errorMessage(): string | undefined {
    return this._errorMessage;
  }

  get totalAmount(): number {
    return this.productAmount + this.baseFee + this.deliveryFee;
  }

  get isPending(): boolean {
    return this._status === TransactionStatus.PENDING;
  }

  markApproved(wompiTransactionId: string): void {
    this.assertIsPending();
    this._status = TransactionStatus.APPROVED;
    this._wompiTransactionId = wompiTransactionId;
    this.updatedAt = new Date();
  }

  markDeclined(wompiTransactionId: string, reason?: string): void {
    this.assertIsPending();
    this._status = TransactionStatus.DECLINED;
    this._wompiTransactionId = wompiTransactionId;
    this._errorMessage = reason;
    this.updatedAt = new Date();
  }

  markError(reason: string): void {
    this.assertIsPending();
    this._status = TransactionStatus.ERROR;
    this._errorMessage = reason;
    this.updatedAt = new Date();
  }

  private assertIsPending(): void {
    if (this._status !== TransactionStatus.PENDING) {
      throw new Error(
        `Cannot transition transaction from ${this._status}: already resolved`,
      );
    }
  }
}