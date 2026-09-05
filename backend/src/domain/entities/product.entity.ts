export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public price: number,
    private _stock: number,
    public imageUrl?: string,
  ) {
    if (price < 0) {
      throw new Error('Price cannot be negative');
    }
    if (_stock < 0) {
      throw new Error('Stock cannot be negative');
    }
  }

  get stock(): number {
    return this._stock;
  }

  hasStock(quantity = 1): boolean {
    return this._stock >= quantity;
  }

  decreaseStock(quantity = 1): void {
    if (quantity <= 0) {
      throw new Error('Quantity to decrease must be positive');
    }
    if (quantity > this._stock) {
      throw new Error('Insufficient stock');
    }
    this._stock -= quantity;
  }
}