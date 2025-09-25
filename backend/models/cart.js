const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'sellProduct',
        required: true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    quantity: {
        type: Number,
        default: 1,
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }

})

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;