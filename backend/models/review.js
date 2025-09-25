const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sellProduct',
        required:true
    },
    
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }   
})
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;