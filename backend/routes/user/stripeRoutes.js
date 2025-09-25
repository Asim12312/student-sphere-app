const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../../models/user');

// Middleware to verify user exists
const verifyUser = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('User verification error:', err);
    res.status(500).json({ message: 'Error verifying user', error: err.message });
  }
};

// Check if a Stripe account is fully onboarded
const checkAccountStatus = async (accountId) => {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    // Check if the account has completed the onboarding process
    // This checks if charges_enabled is true, which means the account can accept payments
    return {
      isOnboarded: account.charges_enabled,
      accountDetails: account
    };
  } catch (error) {
    console.error('Error checking account status:', error);
    return { isOnboarded: false, error: error.message };
  }
};

router.post('/create-account', verifyUser, async (req, res) => {
  try {
    const user = req.user;
    
    // Check if user already has a Stripe account
    if (user.stripeAccountId) {
      // Verify if the account is fully onboarded
      const { isOnboarded, accountDetails, error } = await checkAccountStatus(user.stripeAccountId);
      
      if (error) {
        // If there's an error retrieving the account, create a new one
        console.log('Error retrieving Stripe account, creating new one:', error);
      } else if (isOnboarded) {
        // If account is fully onboarded, return success
        return res.status(200).json({ 
          message: 'User already has a fully onboarded Stripe account.',
          onboarded: true
        });
      } else {
        // If account exists but not fully onboarded, create a new account link
        const accountLink = await stripe.accountLinks.create({
          account: user.stripeAccountId,
          refresh_url: `${process.env.FRONTEND_REDIRECT_URL}/onboarding-complete?refresh=true`,
          return_url: `${process.env.FRONTEND_REDIRECT_URL}/onboarding-complete?success=true`,
          type: 'account_onboarding',
        });
        
        return res.json({ 
          url: accountLink.url,
          message: 'Continue Stripe account setup'
        });
      }
    }

    // Create a new Stripe Express account
    const account = await stripe.accounts.create({ 
      type: 'express',
      business_type: 'individual',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Update user with Stripe account ID
    await User.findByIdAndUpdate(user._id, {
      stripeAccountId: account.id
    });
    
    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_REDIRECT_URL}/onboarding-complete?refresh=true`,
      return_url: `${process.env.FRONTEND_REDIRECT_URL}/onboarding-complete?success=true`,
      type: 'account_onboarding',
    });

    // Send link to frontend
    res.json({ 
      url: accountLink.url,
      message: 'Stripe account created. Please complete onboarding.'
    });
  } catch (err) {
    console.error('Stripe account creation error:', err);
    res.status(500).json({ 
      message: 'Error creating Stripe account', 
      error: err.message 
    });
  }
});

// Endpoint to get the Stripe publishable key
router.get('/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

// Endpoint to check if a user's Stripe account is fully onboarded
router.get('/account-status/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.stripeAccountId) {
      return res.json({ onboarded: false, message: 'User has no Stripe account' });
    }
    
    const { isOnboarded, accountDetails, error } = await checkAccountStatus(user.stripeAccountId);
    
    if (error) {
      return res.status(500).json({ message: 'Error checking Stripe account', error });
    }
    
    return res.json({ 
      onboarded: isOnboarded,
      accountDetails: isOnboarded ? {
        id: accountDetails.id,
        charges_enabled: accountDetails.charges_enabled,
        payouts_enabled: accountDetails.payouts_enabled,
        requirements: accountDetails.requirements
      } : null
    });
  } catch (err) {
    console.error('Account status check error:', err);
    res.status(500).json({ message: 'Error checking account status', error: err.message });
  }
});

module.exports = router;
