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
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    originalTrend: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trend',
        default: null
    },
    isRepost: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Trend = mongoose.model('Trend', trendSchema);
module.exports = Trend;
