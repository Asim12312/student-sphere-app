const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const authenticate = require('../../middleware/jwtAuth');
const SellProduct = require('../../models/sellProduct');

// Create a checkout session for direct purchase
router.post('/create-checkout-session', authenticate, async (req, res) => {
  try {
    // Check if we're receiving items array or direct productId/quantity
    let lineItems = [];
    
    if (req.body.items && Array.isArray(req.body.items)) {
      // Process items array from frontend
      for (const item of req.body.items) {
        // Validate each item
        if (!item.productId || !item.quantity) {
          return res.status(400).json({ message: 'Each item must have productId and quantity' });
        }
        
        // Get product details from database if not provided
        let productData = item;
        
        if (!item.name || !item.price) {
          const product = await SellProduct.findById(item.productId);
          if (!product) {
            return res.status(404).json({ message: `Product not found: ${item.productId}` });
          }
          productData = {
            ...item,
            name: product.title,
            price: product.price,
            image: product.imageURL
          };
        }
        
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: productData.name,
              images: [productData.image],
            },
            unit_amount: Math.round(productData.price * 100), // Stripe requires amount in cents
          },
          quantity: parseInt(productData.quantity),
        });
      }
    } else {
      // Legacy support for direct productId/quantity
      const { productId, quantity } = req.body;
      
      // Validate input
      if (!productId || !quantity) {
        return res.status(400).json({ message: 'Product ID and quantity are required' });
      }

      // Get product details from database
      const product = await SellProduct.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.title,
            description: product.description,
            images: [product.imageURL],
          },
          unit_amount: Math.round(product.price * 100), // Stripe requires amount in cents
        },
        quantity: parseInt(quantity),
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_REDIRECT_URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_REDIRECT_URL || 'http://localhost:5173'}/payment-cancelled`,
    });

    // Return both the URL and the session ID for flexibility
    res.json({ 
      url: session.url,
      sessionId: session.id,
      // Include additional useful information
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Error creating checkout session', error: error.message });
  }
});

// Webhook to handle successful payments
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  // Verify webhook signature
  if (!sig) {
    console.error('Webhook Error: No Stripe signature found');
    return res.status(400).send('Webhook Error: No Stripe signature found');
  }
  
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Webhook Error: Stripe webhook secret is not configured');
    return res.status(500).send('Webhook Error: Configuration issue');
  }
  
  let event;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    console.log(`Webhook received: ${event.type}`);
    
    // Log the event for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.log('Webhook payload:', JSON.stringify(event, null, 2));
    }
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Fulfill the order
    console.log('Payment successful for session:', session.id);
    // Here you would update your database to mark the order as paid
  }

  res.json({received: true});
});

module.exports = router;