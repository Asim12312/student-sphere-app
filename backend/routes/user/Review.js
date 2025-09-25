const express = require('express');
const Review = require('../../models/review');
const authenticate = require('../../middleware/jwtAuth');
const router = express.Router();

// Add a review
router.post('/addReview', authenticate, async (req, res) => {
    try {
        const { userId, productId, comment } = req.body;
        if (!userId || !productId || !comment) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newReview = new Review({
            userId: userId,       
            productId: productId, 
            comment: comment
        });

        await newReview.save();
        res.status(201).json({ message: "Review added successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get reviews for a specific product
router.get('/getReviews/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }
        const reviews = await Review.find({ productId: productId }).populate('userId', 'username role');
        if (reviews.length === 0) {
            return res.status(404).json({ message: "No reviews found for this product" });
        }
        res.status(200).json(reviews);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

// Delete a review
router.delete('/:revirewId', authenticate, async (req, res) => {
    try {
        const reviewId = req.params.revirewId;
        if (!reviewId) {
            return res.status(400).json({ message: "Review ID is required" });
        }

        const deletedReview = await Review.findByIdAndDelete(reviewId);
        if (!deletedReview) {
            return res.status(404).json({ message: "Review not found" });
        }

        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});



module.exports = router;
