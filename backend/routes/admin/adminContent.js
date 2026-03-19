const express = require('express');
const router = express.Router();
const Blog = require('../../models/blogModel');
const Question = require('../../models/questionModel');
const ProfilePost = require('../../models/profilePostModel');

// GET all blogs
router.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'username userEmail')
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE blog
router.delete('/blogs/:id', async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET all questions (forums)
router.get('/questions', async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('author', 'username userEmail')
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE question
router.delete('/questions/:id', async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET all profile posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await ProfilePost.find()
      .populate('user', 'username userEmail')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE profile post
router.delete('/posts/:id', async (req, res) => {
  try {
    await ProfilePost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
