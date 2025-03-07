// Simple Express server to handle Stripe API requests
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// In-memory rate limiting and deduplication
const requestCache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rate limiting middleware
const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const path = req.path;
  const key = `${ip}:${path}`;
  
  const now = Date.now();
  if (requestCache.has(key)) {
    const lastRequest = requestCache.get(key);
    // Allow only one request per second per IP and path
    if (now - lastRequest < 1000) {
      return res.status(429).json({ 
        error: 'Too many requests, please try again later',
        message: 'Rate limit exceeded'
      });
    }
  }
  
  requestCache.set(key, now);
  
  // Clean up old cache entries periodically
  if (Math.random() < 0.1) { // 10% chance to clean up on each request
    const deleteBeforeTime = now - CACHE_TTL;
    for (const [cacheKey, timestamp] of requestCache.entries()) {
      if (timestamp < deleteBeforeTime) {
        requestCache.delete(cacheKey);
      }
    }
  }
  
  next();
};

// Initialize Stripe with proper error handling
let stripe;
try {
  const stripeSecretKey = process.env.VITE_STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    console.error('VITE_STRIPE_SECRET_KEY is not defined in environment variables');
    process.exit(1);
  }
  console.log('Initializing Stripe with key:', stripeSecretKey.substring(0, 8) + '...');
  stripe = require('stripe')(stripeSecretKey);
} catch (err) {
  console.error('Failed to initialize Stripe:', err);
  process.exit(1);
}

// Create payment intent endpoint with rate limiting
app.post('/api/create-payment-intent', rateLimiter, async (req, res) => {
  try {
    console.log('Creating payment intent with data:', req.body);
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

    console.log('Created payment intent:', paymentIntent.id);

    // Return the client secret
    return res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({ 
      error: 'Failed to create payment intent',
      message: error.message
    });
  }
});

// Create checkout session endpoint with rate limiting
app.post('/api/create-checkout-session', rateLimiter, async (req, res) => {
  try {
    console.log('Creating checkout session with data:', req.body);
    const { paymentId, amount, currency, description, email, name } = req.body;

    // Validate required fields
    if (!paymentId || !amount || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
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

    console.log('Created checkout session:', session.id);

    // Return the session details
    return res.json({
      id: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
});

// Payment info endpoint
app.post('/api/payment-info', rateLimiter, async (req, res) => {
  try {
    const { stripePaymentId } = req.body;
    
    // Validate required fields
    if (!stripePaymentId) {
      return res.status(400).json({ error: 'Missing stripePaymentId' });
    }
    
    console.log('Successfully processed payment with Stripe ID:', stripePaymentId);
    
    // In a real implementation, you would update the payment status in your database
    // await supabase.from('payments').update({ status: 'completed' }).eq('external_reference', stripePaymentId);
    
    return res.json({ 
      success: true,
      message: 'Payment processed successfully' 
    });
  } catch (error) {
    console.error('Error storing payment info:', error);
    return res.status(500).json({ 
      error: 'Failed to store payment info',
      message: error.message 
    });
  }
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Create a payment test page
app.get('/stripe-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'stripe-test.html'));
});

// Handle 404 errors for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.url}` });
});

// For non-API routes, try to serve index.html
app.use('*', (req, res) => {
  // Don't handle static files that are already handled by express.static
  if (req.url.match(/\.(html|css|js|png|jpg|jpeg|gif|svg)$/)) {
    return res.status(404).send('Not found');
  }
  
  // For all other routes, send the index.html file
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Stripe API server running on port ${PORT}`);
  console.log(`Test the API with: curl http://localhost:${PORT}/api/test`);
  console.log(`View the Stripe test page at: http://localhost:${PORT}/stripe-test`);
}); 