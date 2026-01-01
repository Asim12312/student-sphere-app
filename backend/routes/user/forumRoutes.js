const express = require('express');
const router = express.Router();
const Question = require('../../models/questionModel');

// Ask Question
router.post('/ask', async (req, res) => {
    try {
        const { title, description, author, tags } = req.body;

        let parsedTags = [];
        if (tags) {
            parsedTags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
        }

        const newQuestion = new Question({
            title,
            description,
            author,
            tags: parsedTags
        });

        await newQuestion.save();
        res.status(201).json({ success: true, question: newQuestion });
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({ success: false, message: 'Failed to post question' });
    }
});

// Get All Questions
router.get('/', async (req, res) => {
    try {
        const { tag, search, filter } = req.query; // filter: 'unanswered', 'solved'
        let query = {};

        if (tag) {
            query.tags = tag;
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        if (filter === 'solved') {
            query.isSolved = true;
        } else if (filter === 'unanswered') {
            query.answers = { $size: 0 };
        }

        const questions = await Question.find(query)
            .populate('author', 'username profilePicture')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, questions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch questions' });
    }
});

// Get Single Question
router.get('/:id', async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate('author', 'username profilePicture')
            .populate('answers.author', 'username profilePicture');

        if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

        // Increment views
        question.views += 1;
        await question.save();

        res.status(200).json({ success: true, question });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching question details' });
    }
});

// Answer Question
router.post('/answer/:id', async (req, res) => {
    try {
        const { userId, text } = req.body;
        const question = await Question.findById(req.params.id);

        if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

        const newAnswer = {
            author: userId,
            text,
            createdAt: new Date()
        };

        question.answers.push(newAnswer);
        await question.save();

        const populatedQuestion = await Question.findById(req.params.id).populate('answers.author', 'username profilePicture');
        const addedAnswer = populatedQuestion.answers[populatedQuestion.answers.length - 1];

        res.status(200).json({ success: true, answer: addedAnswer });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error answering question' });
    }
});

// Mark Answer as Accepted (Solved)
router.post('/accept/:id', async (req, res) => {
    try {
        const { userId, answerId } = req.body;
        const question = await Question.findById(req.params.id);

        if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

        // Check ownership
        if (question.author.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Mark specific answer as accepted
        let answerFound = false;
        question.answers.forEach(ans => {
            if (ans._id.toString() === answerId) {
                ans.isAccepted = true;
                answerFound = true;
            } else {
                ans.isAccepted = false; // Only one accepted answer usually
            }
        });

        if (answerFound) {
            question.isSolved = true;
            await question.save();
            res.status(200).json({ success: true, message: 'Answer accepted' });
        } else {
            res.status(404).json({ success: false, message: 'Answer not found' });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error accepting answer' });
    }
});

module.exports = router;
