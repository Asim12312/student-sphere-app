const express = require('express');
const Cart = require('../../models/cart');
const router = express.Router();
const authenticate = require('../../middleware/jwtAuth');

// Add product to cart
router.post('/addToCart', authenticate, async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        if (!userId || !productId || !quantity) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingCartItem = await Cart.findOne({ userId, productId });
        if (existingCartItem) {
            existingCartItem.quantity += quantity;
            await existingCartItem.save();
            return res.status(200).json({ message: "Product quantity updated in cart" });
        }

        const newCartItem = new Cart({
            userId,
            productId,
            quantity
        });

        await newCartItem.save();
        res.status(201).json({ message: "Product added to cart successfully" });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get cart items for a user
router.get('/getCartItems/:userId', authenticate, async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const cartItems = await Cart.find({ userId }).populate('productId');
        if (cartItems.length === 0) {
            return res.status(404).json({ message: "No items found in cart" });
        }

        res.status(200).json(cartItems);
    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Remove product from cart
router.delete('/removeFromCart/:cartItemId', authenticate, async (req, res) => {
        try {
            const cartItemId = req.params.cartItemId;
            if (!cartItemId) {
                return res.status(400).json({ message: "Cart item ID is required" });
            }
    
            const deletedCartItem = await Cart.findByIdAndDelete(cartItemId);
            if (!deletedCartItem) {
                return res.status(404).json({ message: "Cart item not found" });
            }
    
            res.status(200).json({ message: "Product removed from cart successfully" });
        } catch (error) {
            console.error("Error removing from cart:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });

    module.exports = router;