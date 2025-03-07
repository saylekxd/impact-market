# Stripe Payment Integration Guide

This guide explains how to set up and use Stripe payments in your application.

## 1. Sign Up for Stripe

1. Go to [Stripe's website](https://stripe.com) and sign up for an account.
2. After creating an account, navigate to the Stripe Dashboard.

## 2. Get Your API Keys

1. In the Stripe Dashboard, click on "Developers" in the left sidebar.
2. Select "API keys".
3. You'll see two types of keys:
   - **Publishable Key**: Used for client-side code
   - **Secret Key**: Used for server-side code (keep this secret!)

## 3. Configure Environment Variables

1. Copy the `.env.example` file to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Stripe API keys in the `.env` file:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   VITE_STRIPE_SECRET_KEY=sk_test_your_secret_key
   ```

3. During development, you can use the test keys. For production, use the live keys.

## 4. Set Up Webhooks

1. In the Stripe Dashboard, go to "Developers" > "Webhooks".
2. Click "Add endpoint".
3. For local development, you can use tools like [Stripe CLI](https://stripe.com/docs/stripe-cli) or [ngrok](https://ngrok.com/) to test webhooks.
4. For production, add your webhook URL: `https://your-domain.com/api/stripe-webhook`.
5. Select events to listen for, at minimum:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
6. After creating the webhook, you'll get a "Signing Secret". Add this to your `.env` file:
   ```
   VITE_STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

## 5. Testing Payments

1. For testing, use Stripe's test card numbers:
   - **Card Number**: 4242 4242 4242 4242
   - **Expiry**: Any future date
   - **CVC**: Any 3 digits
   - **ZIP**: Any 5 digits

2. More test cards are available in the [Stripe testing documentation](https://stripe.com/docs/testing).

## API Reference

### Client-Side Integration

The application uses `@stripe/react-stripe-js` and `@stripe/stripe-js` for client-side integration. Key components:

- `StripeProvider`: Wraps application components with Stripe context
- `StripePaymentForm`: Handles card input and payment submission

### Server-Side Integration

API endpoints for server-side Stripe operations:

- `/api/create-checkout-session`: Creates a Stripe Checkout session
- `/api/create-payment-intent`: Creates a PaymentIntent for direct card processing
- `/api/check-session-status`: Checks the status of a Checkout session
- `/api/stripe-webhook`: Handles Stripe webhook events

## Troubleshooting

- Check browser console for errors
- Verify correct API keys are being used
- For webhook issues, check Stripe Dashboard > Developers > Webhooks > "Recent events"

For more information, refer to [Stripe's official documentation](https://stripe.com/docs). 