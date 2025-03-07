# Stripe Integration Guide

This guide explains how to set up and configure Stripe payments in your application.

## 1. Create a Stripe Account

1. Go to [Stripe's website](https://stripe.com) and sign up for an account.
2. Complete the onboarding process to set up your business profile.

## 2. Obtain API Keys

1. In the Stripe Dashboard, navigate to **Developers** > **API keys**.
2. You'll see your **Publishable key** and **Secret key**. In test mode, they will be prefixed with `pk_test_` and `sk_test_` respectively.

## 3. Environment Variables Setup

Create a `.env` file in your project root (if it doesn't exist) and add the following variables:

```
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
VITE_STRIPE_SECRET_KEY=sk_test_your_secret_key
VITE_STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_key
```

Replace the placeholder values with your actual Stripe API keys.

## 4. Webhook Setup

Webhooks allow Stripe to notify your application when events happen in your account, such as successful payments.

1. In the Stripe Dashboard, go to **Developers** > **Webhooks**.
2. Click **Add endpoint**.
3. For local development, you can use tools like [Stripe CLI](https://stripe.com/docs/stripe-cli) for testing webhooks.
4. For production, enter your webhook URL: `https://your-domain.com/api/stripe-webhook`
5. Add the following events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
6. Once created, you'll receive a signing secret (starts with `whsec_`). Add this to your `.env` file as `VITE_STRIPE_WEBHOOK_SECRET`.

## 5. Database Configuration

We've added support for storing Stripe payment references in our database:

1. The `payments` table now includes an `external_reference` column that stores Stripe payment IDs.
2. This allows for cross-referencing between your application's payment records and Stripe payments.

## 6. Testing

1. Use Stripe's test cards to simulate payments:
   - Card number: `4242 4242 4242 4242`
   - Expiry date: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

2. For testing different scenarios (like declined payments), see [Stripe's testing documentation](https://stripe.com/docs/testing).

## 7. Going Live

When you're ready to accept real payments:

1. Complete the account verification process in the Stripe Dashboard.
2. Switch from test keys to live keys (they start with `pk_live_` and `sk_live_`).
3. Update your environment variables with the live keys.
4. Thoroughly test the checkout flow with real cards before announcing to users.

## Troubleshooting

- Check the browser console for JavaScript errors
- Verify your API keys are correctly set in the environment variables
- Look at Stripe Dashboard logs for payment processing issues
- If webhooks aren't working, check the Stripe Dashboard for delivery attempts and errors

For more information, see [Stripe's official documentation](https://stripe.com/docs/payments). 