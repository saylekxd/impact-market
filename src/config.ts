// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Default API configuration
export const DEFAULT_API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// API endpoints
export const API_ENDPOINTS = {
  createPaymentIntent: '/api/create-payment-intent',
  createCheckoutSession: '/api/create-checkout-session',
  paymentInfo: '/api/payment-info',
  test: '/api/test',
} as const; 