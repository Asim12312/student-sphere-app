const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Can also represent a Club if needed, but usually initiated by a user
        required: true
    },
    type: {
        type: String,
        enum: ['JOIN_REQUEST', 'REQUEST_APPROVED', 'REQUEST_REJECTED', 'EVENT_REQUEST', 'EVENT_APPROVED', 'EVENT_REJECTED', 'OTHER'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedId: { // Could be Club ID, Event ID, etc.
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'relatedModel'
    },
    relatedModel: {
        type: String,
        enum: ['Club', 'Event', 'Post'],
        default: 'Club'
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
