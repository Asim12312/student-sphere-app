const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    bannerImage: {
        type: String, 
        required: false,   // make optional (sometimes event may not have a banner)
        default: ""
    },
    ticketPrice: {
        type: Number,
        required: true
    },
    createdInClub: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    thumbnailURL:{
        type: String
    }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
