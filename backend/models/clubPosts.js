const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    imageURL: {
        type: String,
        required: false // Changed from true to false to allow text-only posts
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dislikedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            username: String,
            text: String,
            createdAt: { type: Date, default: Date.now }
        }
    ],
    created_at: {
        type: Date,
        default: Date.now
    },
    clubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
        required: true
    },
    thumbnailURL:{
        type: String

    },
    postsToShow: {
        type: Array,
        default: []
    }
})

const Post = mongoose.model('Post', PostSchema)
module.exports = Post
