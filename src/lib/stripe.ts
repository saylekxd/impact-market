import { loadStripe } from '@stripe/stripe-js';

// Load Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Define API response types
interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

interface CheckoutSessionResponse {
  id: string;
  url: string;
}

interface TestResponse {
  message: string;
}

// Add a custom API fetch function with proper error handling
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    // Check if the response is ok
    if (!response.ok) {
      // Try to parse error message if available
      try {
        const errorData = await response.json() as { message?: string; error?: string };
        throw new Error(errorData.message || errorData.error || `API error: ${response.status}`);
      } catch {
        // If can't parse JSON, use status text
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    }
    
    // Parse response as JSON
    return await response.json() as T;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}

/**
 * Create a payment intent through the backend API
 */
export async function createPaymentIntent(amount: number, currency: string = 'PLN'): Promise<{
  clientSecret: string | null;
  error?: string;
}> {
  try {
    console.log('Creating payment intent:', { amount, currency });
    
    const data = await apiFetch<PaymentIntentResponse>('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
      }),
    });
    
    if (!data.clientSecret) {
      throw new Error('No client secret returned from API');
    }
    
    console.log('Payment intent created successfully');
    return {
      clientSecret: data.clientSecret,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      clientSecret: null,
      error: errorMessage,
    };
  }
}

/**
 * Create a checkout session through the backend API
 */
export async function createCheckoutSession(
  paymentId: string,
  amount: number,
  currency: string = 'PLN',
  email?: string,
  name?: string,
  description?: string
): Promise<{
  sessionId?: string;
  sessionUrl?: string;
  error?: string;
}> {
  try {
    const data = await apiFetch<CheckoutSessionResponse>('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId,
        amount,
        currency,
        email,
        name,
        description,
      }),
    });
    
    return {
      sessionId: data.id,
      sessionUrl: data.url,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      error: errorMessage,
    };
  }
}

// Utility function to test API connection
export async function testApiConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const data = await apiFetch<TestResponse>('/api/test');
    return { success: true, message: data.message || 'API connection successful' };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error connecting to API'
    };
  }
}

// Export the pre-loaded Stripe instance
export { stripePromise }; 