const express = require('express');
const router = express.Router();
const Quiz = require('../../models/quizModel');
const { awardPoints } = require('../../utils/gamification');

// Create Quiz
router.post('/create', async (req, res) => {
    try {
        const { title, description, course, creator, timeLimit, questions } = req.body;

        // Basic validation
        if (!title || !creator || !questions || questions.length === 0) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const newQuiz = new Quiz({
            title,
            description,
            course,
            creator,
            timeLimit,
            questions // Expecting array of objects { questionText, options: [{ text, isCorrect }] }
        });

        await newQuiz.save();

        // Award Points
        await awardPoints(creator, 'CREATE_QUIZ');

        res.status(201).json({ success: true, quiz: newQuiz });
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ success: false, message: 'Failed to create quiz' });
    }
});

// Get All Quizzes
router.get('/', async (req, res) => {
    try {
        const { course, search } = req.query;
        let query = {};

        if (course && course !== 'All') {
            query.course = course;
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const quizzes = await Quiz.find(query)
            .populate('creator', 'username profilePicture')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, quizzes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch quizzes' });
    }
});

// Get Quiz Details (for taking the quiz - maybe hide correct answers?)
router.get('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('creator', 'username profilePicture');

        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

        // Transform to hide isCorrect if needed, but for simplicity sending all
        // In a real strict app, we should strip 'isCorrect' from options here
        const safeQuiz = quiz.toObject();
        safeQuiz.questions = safeQuiz.questions.map(q => ({
            ...q,
            options: q.options.map(o => ({ text: o.text, _id: o._id })) // Remove isCorrect
        }));

        res.status(200).json({ success: true, quiz: safeQuiz });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching quiz details' });
    }
});

// Submit Quiz Score
router.post('/submit/:id', async (req, res) => {
    try {
        const { userId, answers } = req.body; // answers: { questionId: optionId }

        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

        let score = 0;
        let results = [];

        quiz.questions.forEach(question => {
            const userOptionId = answers[question._id];

            // Find correct option
            const correctOption = question.options.find(o => o.isCorrect);
            const userSelectedOption = question.options.find(o => o._id.toString() === userOptionId);

            const isCorrect = correctOption._id.toString() === userOptionId;
            if (isCorrect) score++;

            results.push({
                questionId: question._id,
                isCorrect,
                correctOptionId: correctOption._id,
                userOptionId
            });
        });

        // Record attempt
        const attempt = {
            user: userId,
            score,
            totalQuestions: quiz.questions.length,
            completedAt: new Date()
        };
        quiz.attempts.push(attempt);
        await quiz.save();

        // Check for Ace (e.g., > 80%)
        const percentage = (score / quiz.questions.length) * 100;
        if (percentage >= 80) {
            await awardPoints(userId, 'ACE_QUIZ');
        }

        res.status(200).json({ success: true, score, total: quiz.questions.length, results });

    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ success: false, message: 'Error submitting quiz' });
    }
});

module.exports = router;
