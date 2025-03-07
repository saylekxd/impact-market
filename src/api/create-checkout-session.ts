import Stripe from 'stripe';
import { supabase } from '../lib/supabase';

// Initialize Stripe with your secret key
const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || '');

export default async function handler(req: Request): Promise<Response> {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    // Parse request body
    const body = await req.json();
    const { paymentId, amount, currency, description, email, name } = body;

    // Validate required fields
    if (!paymentId || !amount || !currency) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Get the payment from the database to verify it exists
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (fetchError || !payment) {
      return new Response(JSON.stringify({ error: 'Payment not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
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
      success_url: `${req.headers.get('origin') || ''}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin') || ''}/payment/cancel`,
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
    return new Response(JSON.stringify({
      id: session.id,
      url: session.url,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(JSON.stringify({
      error: 'Failed to create checkout session',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 