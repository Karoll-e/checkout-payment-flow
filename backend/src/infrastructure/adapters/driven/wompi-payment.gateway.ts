import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import {
  PaymentGatewayPort,
  CardPaymentRequest,
  PaymentResult,
} from '../../../domain/ports/payment-gateway.port.js';

@Injectable()
export class WompiPaymentGateway implements PaymentGatewayPort {
  private readonly baseUrl = process.env.WOMPI_API_URL!;
  private readonly privateKey = process.env.WOMPI_PRIVATE_KEY!;
  private readonly integritySecret = process.env.WOMPI_INTEGRITY_SECRET!;

  async charge(request: CardPaymentRequest): Promise<PaymentResult> {
    try {
      const signature = this.buildIntegritySignature(
        request.reference,
        request.amountInCents,
        request.currency,
      );

      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.privateKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount_in_cents: request.amountInCents,
          currency: request.currency,
          customer_email: request.customerEmail,
          payment_method: {
            type: 'CARD',
            token: request.cardToken,
            installments: 1,
          },
          reference: request.reference,
          signature,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          externalId: '',
          status: 'ERROR',
          message: data?.error?.reason ?? 'Wompi request failed',
        };
      }

      const wompiStatus = data.data.status; // 'APPROVED' | 'DECLINED' | 'PENDING' | 'ERROR'

      return {
        externalId: data.data.id,
        status: wompiStatus === 'APPROVED' ? 'APPROVED' : 'DECLINED',
        message: data.data.status_message,
      };
    } catch (error) {
      return {
        externalId: '',
        status: 'ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private buildIntegritySignature(
    reference: string,
    amountInCents: number,
    currency: string,
  ): string {
    const raw = `${reference}${amountInCents}${currency}${this.integritySecret}`;
    return createHash('sha256').update(raw).digest('hex');
  }
}