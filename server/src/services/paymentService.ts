import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia' as any,
});

export class PaymentService {
  static async createPaymentIntent(amount: number, currency: string = 'usd') {
    try {
      // In a real implementation, amount must be converted to cents (e.g., * 100)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        metadata: { integration_check: 'accept_a_payment' },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id
      };
    } catch (error: any) {
      console.error('Stripe error:', error.message);
      throw new Error('Failed to create payment intent');
    }
  }

  static async handleWebhook(sig: string, payload: Buffer) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
      if (!endpointSecret) throw new Error('Stripe webhook secret not configured');
      
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
      
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          // Update order status in DB
          console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return { received: true };
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      throw new Error(`Webhook Error: ${err.message}`);
    }
  }
}
