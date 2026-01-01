const Trend = require('../models/trendModel');

/**
 * Calculate trending score for a post
 * Twitter-like algorithm considering:
 * - Engagement (likes, comments, reposts)
 * - Velocity (engagement rate over time)
 * - Time decay (newer posts get boost)
 */
const calculateTrendingScore = (trend) => {
    const now = Date.now();
    const postAge = (now - new Date(trend.createdAt).getTime()) / (1000 * 60 * 60); // hours

    // Engagement metrics
    const likes = trend.likes?.length || 0;
    const comments = trend.comments?.length || 0;
    const reposts = trend.repostCount || 0; // We'll need to count this

    // Weighted engagement score
    const engagementScore = (likes * 1) + (comments * 2) + (reposts * 3);

    // Time decay factor (exponential decay)
    // Posts lose 50% relevance every 6 hours
    const decayFactor = Math.pow(0.5, postAge / 6);

    // Velocity bonus (engagement per hour)
    const velocity = postAge > 0 ? engagementScore / postAge : engagementScore;
    const velocityBonus = Math.log(velocity + 1) * 10;

    // Final score
    const score = (engagementScore * decayFactor) + velocityBonus;

    return score;
};

/**
 * Get trending posts (not just hashtags)
 * Returns posts with highest engagement in last 24 hours
 */
const getTrendingPosts = async (limit = 10) => {
    try {
        // Get posts from last 24 hours
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);

        const recentTrends = await Trend.find({
            createdAt: { $gte: oneDayAgo },
            isRepost: false // Don't include reposts in trending
        })
            .populate('author', 'username profilePicture')
            .populate('comments.user', 'username profilePicture')
            .lean();

        // Count reposts for each trend
        const trendsWithReposts = await Promise.all(recentTrends.map(async (trend) => {
            const repostCount = await Trend.countDocuments({
                originalTrend: trend._id,
                isRepost: true
            });
            return { ...trend, repostCount };
        }));

        // Calculate scores and sort
        const scoredTrends = trendsWithReposts.map(trend => ({
            ...trend,
            trendingScore: calculateTrendingScore(trend)
        }));

        // Sort by score and return top N
        const trending = scoredTrends
            .sort((a, b) => b.trendingScore - a.trendingScore)
            .slice(0, limit);

        return trending;

    } catch (error) {
        console.error('Error calculating trending posts:', error);
        return [];
    }
};

/**
 * Get trending topics (hashtags with engagement)
 * Enhanced version that considers engagement on posts with hashtags
 */
const getTrendingTopics = async (limit = 10) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trends = await Trend.find({
            createdAt: { $gte: sevenDaysAgo },
            hashtags: { $exists: true, $ne: [] }
        }).lean();

        const hashtagStats = {};

        trends.forEach(trend => {
            const engagementScore = (trend.likes?.length || 0) +
                (trend.comments?.length || 0) * 2;

            trend.hashtags.forEach(tag => {
                if (!hashtagStats[tag]) {
                    hashtagStats[tag] = { count: 0, engagement: 0 };
                }
                hashtagStats[tag].count += 1;
                hashtagStats[tag].engagement += engagementScore;
            });
        });

        // Calculate composite score (count + engagement)
        const sortedTopics = Object.entries(hashtagStats)
            .map(([tag, stats]) => ({
                tag,
                count: stats.count,
                engagement: stats.engagement,
                score: stats.count * 10 + stats.engagement // Weighted score
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        return sortedTopics;

    } catch (error) {
        console.error('Error calculating trending topics:', error);
        return [];
    }
};

module.exports = {
    calculateTrendingScore,
    getTrendingPosts,
    getTrendingTopics
};
