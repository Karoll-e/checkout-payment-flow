export class Delivery {
  constructor(
    public readonly id: string,
    public address: string,
    public city: string,
  ) {
    if (!address?.trim()) {
      throw new Error('Address is required');
    }
    if (!city?.trim()) {
      throw new Error('City is required');
    }
  }
}