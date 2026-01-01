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
    },
    // Social Profile Fields
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    bio: {
        type: String,
        maxlength: 500,
        default: ''
    },
    coverPhoto: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    birthdate: {
        type: Date
    },
    privacy: {
        profileVisibility: {
            type: String,
            enum: ['public', 'private'],
            default: 'public'
        },
        messagePermission: {
            type: String,
            enum: ['everyone', 'followers'],
            default: 'everyone'
        }
    }
})
const User = mongoose.model('User', userSchema)
module.exports = User