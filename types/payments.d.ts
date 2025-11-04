// Apple Pay types
declare global {
  interface Window {
    ApplePaySession?: typeof ApplePaySession;
    Stripe?: (publishableKey: string) => StripeInstance;
  }

  const ApplePaySession: {
    new (version: number, request: any): ApplePaySessionInstance;
    canMakePayments(): boolean;
    STATUS_SUCCESS: number;
    STATUS_FAILURE: number;
  };
}

interface ApplePaySessionInstance {
  begin(): void;
  abort(): void;
  completeMerchantValidation(merchantSession: any): void;
  completePayment(status: number): void;
  onvalidatemerchant: ((event: any) => void) | null;
  onpaymentauthorized: ((event: any) => void) | null;
  oncancel: (() => void) | null;
}

// Stripe types
interface StripeInstance {
  elements(): StripeElements;
  createPaymentMethod(options: {
    type: 'card';
    card: StripeCardElement;
    billing_details?: {
      name?: string;
      email?: string;
    };
  }): Promise<{
    paymentMethod?: any;
    error?: { message: string };
  }>;
}

interface StripeElements {
  create(type: 'card' | 'cardNumber' | 'cardExpiry' | 'cardCvc', options?: {
    style?: {
      base?: {
        fontSize?: string;
        color?: string;
        backgroundColor?: string;
        '::placeholder'?: {
          color?: string;
        };
      };
    };
    disableLink?: boolean;
  }): StripeCardElement;
}

interface StripeCardElement {
  mount(selector: string): void;
  unmount(): void;
}

export {};