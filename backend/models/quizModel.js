const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    course: {
        type: String
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timeLimit: {
        type: Number, // in minutes
        default: 10
    },
    questions: [{
        questionText: {
            type: String,
            required: true
        },
        image: String, // Optional URL
        options: [{
            text: String,
            isCorrect: Boolean
        }]
    }],
    attempts: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        score: Number,
        totalQuestions: Number,
        completedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
