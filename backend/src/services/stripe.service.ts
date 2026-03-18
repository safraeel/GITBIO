import Stripe from 'stripe';
import { winstonLogger } from '../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_fallback', {
  apiVersion: '2023-10-16' as any // Use a recent valid api version
});

export const createCheckoutSession = async (customerId: string, priceId: string) => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,
    });

    return session;
  } catch (err) {
    winstonLogger.error('Error creating Stripe checkout session:', err);
    throw err;
  }
};
