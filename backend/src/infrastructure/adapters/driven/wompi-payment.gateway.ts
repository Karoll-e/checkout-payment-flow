import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import type {
  PaymentGatewayPort,
  CardPaymentRequest,
  PaymentResult,
} from '../../../domain/ports/payment-gateway.port.js';

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 10;

@Injectable()
export class WompiPaymentGateway implements PaymentGatewayPort {
  private readonly baseUrl = process.env.WOMPI_API_URL!;
  private readonly publicKey = process.env.WOMPI_PUBLIC_KEY!;
  private readonly privateKey = process.env.WOMPI_PRIVATE_KEY!;
  private readonly integritySecret = process.env.WOMPI_INTEGRITY_SECRET!;

  async charge(request: CardPaymentRequest): Promise<PaymentResult> {
    try {
      const acceptanceToken = await this.getAcceptanceToken();
      const signature = this.buildIntegritySignature(
        request.reference,
        request.amountInCents,
        request.currency,
      );

      const createResponse = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.privateKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          acceptance_token: acceptanceToken,
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

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        return {
          externalId: '',
          status: 'ERROR',
          message: createData?.error?.reason ?? 'Wompi request failed',
        };
      }

      const wompiId = createData.data.id;

      return await this.pollUntilResolved(wompiId);
    } catch (error) {
        return {
        externalId: '',
        status: 'ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
  };
}
  }

  private async pollUntilResolved(wompiId: string): Promise<PaymentResult> {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      await this.sleep(POLL_INTERVAL_MS);

      const response = await fetch(`${this.baseUrl}/transactions/${wompiId}`, {
        headers: { Authorization: `Bearer ${this.privateKey}` },
      });
      const data = await response.json();
      const status = data.data.status;

      if (status === 'APPROVED') {
        return { externalId: wompiId, status: 'APPROVED' };
      }
      if (status === 'DECLINED' || status === 'ERROR' || status === 'VOIDED') {
        return {
          externalId: wompiId,
          status: status === 'APPROVED' ? 'APPROVED' : 'DECLINED',
          message: data.data.status_message,
        };
      }
      // sigue en PENDING, reintenta
    }

    return {
      externalId: wompiId,
      status: 'ERROR',
      message: 'Payment confirmation timed out',
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async getAcceptanceToken(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/merchants/${this.publicKey}`);
    const data = await response.json();
    return data.data.presigned_acceptance.acceptance_token;
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