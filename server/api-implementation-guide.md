# BLIK Payment Implementation Guide for Server

This guide explains how to update your server-side code to support BLIK payments through Stripe.

## Update the Payment Intent Creation API

Your current implementation at `/api/create-payment-intent` should be updated to support BLIK. Here's an example implementation using Node.js and Express:

```javascript
// Example using Express.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    
    // Create a PaymentIntent with the order amount and currency
    // Add payment_method_types to include 'blik'
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      // Add BLIK to the payment method types
      payment_method_types: ['card', 'blik'],
      // Enable automatic payment methods is an alternative
      // automatic_payment_methods: { enabled: true },
    });

    // Send publishable key and PaymentIntent details to client
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## Setup Steps in Stripe Dashboard

1. Log in to your Stripe Dashboard: https://dashboard.stripe.com/
2. Go to "Settings" → "Payment methods"
3. Enable "BLIK" in the list of payment methods
4. Make sure your account is properly configured for Polish payments (PLN currency)

## Testing BLIK Payments

For testing BLIK payments, use the following test codes:

- For successful payments: `123456`
- For payments that require authentication: `234567`
- For failed payments: `345678`

## Additional Configuration

If you need to customize which payment methods appear for users, you can do this in two ways:

1. Client-side - Using the `paymentMethodOrder` option in the PaymentElement
2. Server-side - By controlling the payment_method_types or using a payment method configuration

## Payment Flow for BLIK

1. Customer enters a BLIK code
2. The code is sent to their bank's mobile app for confirmation
3. Customer approves the payment in their banking app
4. Stripe processes the payment and confirms the result

## Important Notes

- BLIK is only available for Polish customers and in PLN currency
- Always handle payment confirmation status properly
- Some BLIK payments may require additional actions by the customer
- Make sure to properly update your payment success/failure handling logic 