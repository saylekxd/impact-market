// Simple Express server to handle Stripe API requests
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
let supabase;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  console.log('Supabase client initialized with', 
    supabaseKey === process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? 'service role key' : 'anon key');
  
  // Check if the database schema is as expected
  (async () => {
    try {
      // Try to fetch payments table structure
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('Error accessing payments table:', error);
      } else {
        // If we got data, check the structure
        if (payments && payments.length > 0) {
          const samplePayment = payments[0];
          console.log('Available columns in payments table:', Object.keys(samplePayment));
          
          // Check if external_reference exists in the columns
          if (!('external_reference' in samplePayment)) {
            console.warn('WARNING: external_reference column is missing from payments table');
            console.warn('Please apply the migration in supabase/migrations/20250212999999_add_external_reference.sql');
          }
        } else {
          console.log('Payments table exists but is empty - schema structure will be validated on first payment');
        }
      }
    } catch (err) {
      console.error('Error during schema check:', err);
    }
  })();
} else {
  console.warn('Supabase credentials missing, database updates will not work');
}

// In-memory rate limiting and deduplication
const requestCache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute

// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3001', 'https://www.impactmarket.pl'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature']
}));

// Middleware
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
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
      // Use specific payment methods instead of automatic detection
      payment_method_types: ['card', 'blik'],
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
    console.log('Received payment info request:', { 
      paymentId: req.body.paymentId,
      stripePaymentId: req.body.stripePaymentId,
      creator_id: req.body.creator_id,
      headers: req.headers
    });
    
    const { paymentId, stripePaymentId, creator_id } = req.body;
    
    // Validate required fields
    if (!paymentId || !stripePaymentId) {
      return res.status(400).json({ error: 'Missing required fields: paymentId and stripePaymentId are required' });
    }

    if (!creator_id) {
      return res.status(400).json({ error: 'Missing required field: creator_id is required' });
    }
    
    // Check if supabase is initialized
    if (!supabase) {
      return res.status(500).json({ 
        error: 'Database not available',
        message: 'Supabase client is not initialized'
      });
    }
    
    // Verify the payment status with Stripe before updating the database
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentId);
      console.log('Retrieved payment intent:', paymentIntent);
      
      // Only proceed if the payment is confirmed as successful by Stripe
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ 
          error: 'Payment not succeeded',
          message: `Payment status is ${paymentIntent.status}`
        });
      }
      
      console.log('Successfully verified payment with Stripe ID:', stripePaymentId);
      
      // First verify the payment exists and belongs to the creator
      const { data: payments, error: fetchError } = await supabase
        .from('payments')
        .select('id')
        .eq('id', paymentId)
        .eq('creator_id', creator_id);

      if (fetchError) {
        console.error('Error checking payment:', fetchError);
        return res.status(500).json({ 
          error: 'Failed to check payment record',
          message: fetchError.message
        });
      }

      if (!payments || payments.length === 0) {
        console.error('Payment not found or does not belong to creator:', { paymentId, creator_id });
        return res.status(404).json({
          error: 'Payment not found',
          message: 'Payment record not found or does not belong to the specified creator'
        });
      }

      // Update the payment
      const { data: updatedPayments, error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          external_reference: stripePaymentId,
          stripe_id: stripePaymentId,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency.toLowerCase()
        })
        .eq('id', paymentId)
        .eq('creator_id', creator_id)
        .select();

      if (updateError) {
        console.error('Error updating payment:', updateError);
        return res.status(500).json({ 
          error: 'Failed to update payment record',
          message: updateError.message
        });
      }

      if (!updatedPayments || updatedPayments.length === 0) {
        console.error('No payment was updated');
        return res.status(500).json({
          error: 'Failed to update payment',
          message: 'No payment was updated'
        });
      }

      return res.json({ 
        success: true,
        message: 'Payment processed and recorded successfully',
        payment: updatedPayments[0]
      });
    } catch (stripeError) {
      console.error('Stripe verification error:', stripeError);
      return res.status(500).json({ 
        error: 'Failed to verify payment with Stripe',
        message: stripeError.message
      });
    }
  } catch (error) {
    console.error('Error processing payment info:', error);
    return res.status(500).json({ 
      error: 'Failed to process payment info',
      message: error.message 
    });
  }
});

// Simple test endpoint that checks if Stripe is initialized
app.get('/api/test', async (req, res) => {
  try {
    // Check if Stripe is initialized
    if (!stripe) {
      return res.status(503).json({ 
        error: 'Payment service unavailable', 
        message: 'Stripe is not initialized'
      });
    }
    
    // Make a simple call to Stripe API to verify connectivity
    try {
      // Get Stripe account info to verify connection works
      const account = await stripe.accounts.retrieve();
      return res.json({ 
        message: 'API is working!',
        stripe_status: 'connected',
        account_id: account.id
      });
    } catch (stripeError) {
      console.error('Stripe API connectivity test failed:', stripeError);
      return res.status(503).json({ 
        error: 'Payment service unavailable', 
        message: 'Could not connect to Stripe API'
      });
    }
  } catch (error) {
    console.error('Test endpoint error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      message: error.message
    });
  }
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