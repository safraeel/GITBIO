import { Request, Response } from 'express';
import { createCheckoutSession } from '../services/stripe.service';
import Stripe from 'stripe';
import { User, SubscriptionTier } from '../models/User';
import { winstonLogger } from '../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_fallback', {
  apiVersion: '2023-10-16' as any
});

export const checkout = async (req: any, res: Response) => {
  try {
    const { priceId } = req.body;
    const user = req.user;

    // In a real app we'd first create a customer on Stripe if they don't have one
    let customerId = user.stripeCustomerId;
    if (!customerId) {
        const customer = await stripe.customers.create({ email: user.email });
        customerId = customer.id;
        user.stripeCustomerId = customerId;
        await user.save();
    }

    const session = await createCheckoutSession(customerId, priceId);
    res.json({ success: true, url: session.url });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Checkout failed' });
  }
};

export const webhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_fallback');
  } catch (err: any) {
    winstonLogger.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as any;
      const customerId = session.customer;
      
      // Upgrade user
      await User.findOneAndUpdate(
        { stripeCustomerId: customerId },
        { subscriptionTier: SubscriptionTier.PRO } 
      );
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
};
