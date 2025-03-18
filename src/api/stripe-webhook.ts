import Stripe from 'stripe';
import { supabase } from '../lib/supabase';

// Initialize Stripe with your secret key
const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || '');

// Your Stripe webhook secret
const endpointSecret = import.meta.env.VITE_STRIPE_WEBHOOK_SECRET;

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
    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature');
    
    // If no signature was found, return an error
    if (!signature || !endpointSecret) {
      return new Response(JSON.stringify({ error: 'Webhook signature verification failed' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Get the raw body as text
    const body = await req.text();
    
    // Verify the event
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(JSON.stringify({ error: 'Webhook signature verification failed' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extract payment ID from metadata
        const paymentId = session.metadata?.payment_id;
        
        if (paymentId) {
          // Update payment status in your database
          const { error } = await supabase
            .from('payments')
            .update({ 
              status: 'completed',
              stripe_session_id: session.id, // Ensure session ID is stored
              completed_at: new Date().toISOString(),
              payment_amount: session.amount_total,
              payment_currency: session.currency?.toUpperCase(),
              customer_email: session.customer_email || null,
              customer_name: session.metadata?.name || null
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
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment succeeded: ${paymentIntent.id}`);
        break;
      }
      case 'payment_intent.payment_failed': {
        // Handle failed payment intent
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${paymentIntent.id}`);
        break;
      }
      default:
        // Unexpected event type
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a successful response
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new Response(JSON.stringify({ error: 'Webhook handler failed' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 