export interface CardPaymentRequest {
  cardToken: string;
  amountInCents: number;
  currency: string;
  customerEmail: string;
  reference: string;
}

export interface PaymentResult {
  externalId: string;
  status: 'APPROVED' | 'DECLINED' | 'ERROR';
  message?: string;
}

export interface PaymentGatewayPort {
  charge(request: CardPaymentRequest): Promise<PaymentResult>;
}