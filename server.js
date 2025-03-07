// Simple Express server to handle API requests
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.VITE_STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create payment intent endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;

    // Validate required fields
    if (!amount || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Return the client secret
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Create checkout session endpoint
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { paymentId, amount, currency, description, email, name } = req.body;

    // Validate required fields
    if (!paymentId || !amount || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get the payment from the database to verify it exists
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (fetchError || !payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: description || 'Support donation',
            },
            unit_amount: amount, // amount in smallest currency unit (e.g. cents)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://localhost:5174'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5174'}/payment/cancel`,
      customer_email: email || undefined,
      metadata: {
        payment_id: paymentId,
        name: name || undefined,
      },
    });

    // Update the payment with Stripe info
    await supabase
      .from('payments')
      .update({
        payment_type: 'stripe',
      })
      .eq('id', paymentId);

    // Return the session details
    res.json({
      id: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Payment info endpoint
app.post('/api/payment-info', async (req, res) => {
  try {
    const { paymentId, stripePaymentId } = req.body;

    // Validate required fields
    if (!paymentId || !stripePaymentId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update the payment with Stripe payment ID
    const { error } = await supabase
      .from('payments')
      .update({
        payment_type: 'stripe',
        external_reference: stripePaymentId
      })
      .eq('id', paymentId);

    if (error) {
      throw new Error(`Failed to update payment: ${error.message}`);
    }

    // Return success
    res.json({ success: true });
  } catch (error) {
    console.error('Error storing payment info:', error);
    res.status(500).json({
      error: error.message || 'Failed to store payment info',
    });
  }
});

// Stripe webhook endpoint
app.post('/api/stripe-webhook', async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const endpointSecret = process.env.VITE_STRIPE_WEBHOOK_SECRET;
  
  // Handle webhook verification
  if (!signature || !endpointSecret) {
    return res.status(400).send({ error: 'Webhook signature verification failed' });
  }

  let event;
  
  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      endpointSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send({ error: 'Webhook signature verification failed' });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      
      // Extract payment ID from metadata
      const paymentId = session.metadata?.payment_id;
      
      if (paymentId) {
        // Update payment status in your database
        const { error } = await supabase
          .from('payments')
          .update({ 
            status: 'completed',
          })
          .eq('id', paymentId);
          
        if (error) {
          console.error('Error updating payment status:', error);
        }
      }
      break;
    }
    case 'payment_intent.succeeded': {
      // Handle successful payment intent
      const paymentIntent = event.data.object;
      console.log(`Payment succeeded: ${paymentIntent.id}`);
      break;
    }
    case 'payment_intent.payment_failed': {
      // Handle failed payment intent
      const paymentIntent = event.data.object;
      console.log(`Payment failed: ${paymentIntent.id}`);
      break;
    }
    default:
      // Unexpected event type
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a successful response
  res.json({ received: true });
});

// Start the server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
}); 