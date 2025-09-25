import { loadStripe } from '@stripe/stripe-js';

// Initialize with a promise that will resolve to the Stripe instance
let stripePromise;

// Function to initialize Stripe with the publishable key from the backend
const getStripe = async () => {
  if (!stripePromise) {
    try {
      // Fetch the publishable key from the backend
      const response = await fetch('http://localhost:3000/stripe/config');
      const { publishableKey } = await response.json();
      
      if (!publishableKey) {
        console.error('Stripe publishable key not found');
        return null;
      }
      
      // Initialize Stripe with the publishable key
      stripePromise = loadStripe(publishableKey);
    } catch (error) {
      console.error('Error loading Stripe:', error);
      // Fallback to a default key for development (should be removed in production)
      stripePromise = loadStripe('pk_test_51RppO6IZW5RejvrXvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    }
  }
  return stripePromise;
};

export default getStripe;