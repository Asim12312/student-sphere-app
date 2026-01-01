const User = require('../models/user');

const POINTS = {
    CREATE_BLOG: 10,
    SOLVE_QUESTION: 20,
    ACE_QUIZ: 15,
    CREATE_QUIZ: 10,
    ASK_QUESTION: 5
};

const BADGES = {
    'Blogger': { count: 5, action: 'CREATE_BLOG', name: 'Wordsmith ✍️' },
    'Solver': { count: 3, action: 'SOLVE_QUESTION', name: 'Problem Solver 🧩' },
    'QuizMaster': { count: 3, action: 'ACE_QUIZ', name: 'Smarty Pants 🤓' }
};

const awardPoints = async (userId, actionType) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        // Add points
        const pointsToAdd = POINTS[actionType] || 0;
        user.reputationPoints += pointsToAdd;

        // Check for Badges (Simple logic: based on total points or specific counters could be better, 
        // but for now let's just use point thresholds or we'd need to track action counts)

        // Revised Badge Logic: Just strictly point based for simplicity in V1
        // 50 Points -> Bronze
        // 100 Points -> Silver
        // 500 Points -> Gold

        if (user.reputationPoints >= 50 && !user.badges.includes('Bronze Scholar 🥉')) {
            user.badges.push('Bronze Scholar 🥉');
        }
        if (user.reputationPoints >= 100 && !user.badges.includes('Silver Scholar 🥈')) {
            user.badges.push('Silver Scholar 🥈');
        }
        if (user.reputationPoints >= 500 && !user.badges.includes('Gold Scholar 🥇')) {
            user.badges.push('Gold Scholar 🥇');
        }

        await user.save();
        console.log(`[Gamification] Awarded ${pointsToAdd} points to ${user.username}. Total: ${user.reputationPoints}`);

    } catch (error) {
        console.error('[Gamification] Error awarding points:', error);
    }
};

module.exports = { awardPoints, POINTS };
