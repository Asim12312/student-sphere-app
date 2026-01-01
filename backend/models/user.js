const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },

    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    profilePicture: {
        type: String,
        default: 'https://www.gravatar.com/avatar/'

    },
    stripeAccountId: {
        type: String,
        default: null
    },
    joinedClubs: {
        type: Array,
        default: []
    },
    reputationPoints: {
        type: Number,
        default: 0
    },
    badges: {
        type: [String],
        default: []
    }

})
const User = mongoose.model('User', userSchema)
module.exports = User