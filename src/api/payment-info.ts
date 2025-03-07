import { supabase } from '../lib/supabase';

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
    const { paymentId, stripePaymentId } = body;

    // Validate required fields
    if (!paymentId || !stripePaymentId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Update the payment with Stripe payment ID
    const { error } = await supabase
      .from('payments')
      .update({
        payment_type: 'stripe',
        external_reference: stripePaymentId  // We'll store the Stripe payment ID in this column
      })
      .eq('id', paymentId);

    if (error) {
      throw new Error(`Failed to update payment: ${error.message}`);
    }

    // Return success
    return new Response(JSON.stringify({
      success: true
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error storing payment info:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Failed to store payment info',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 