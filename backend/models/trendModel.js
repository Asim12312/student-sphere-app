const mongoose = require('mongoose');

const trendSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        maxlength: 280 // Twitter style limit
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hashtags: [{
        type: String,
        index: true
    }],
    mediaURL: {
        type: String,
        default: ''
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Trend = mongoose.model('Trend', trendSchema);
module.exports = Trend;
