const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Blog = require('../../models/blogModel');
const multer = require("multer");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../../cloudinary/cloudinaryConfig');

// Cloudinary storage config
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'blog_headers',
        resource_type: 'image',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});
const upload = multer({ storage: storage });

// Create Blog
router.post('/create', upload.single('headerImage'), async (req, res) => {
    try {
        const { title, content, author, category, tags } = req.body;

        let headerImageUrl = '';
        if (req.file) {
            headerImageUrl = req.file.path;
        }

        // Tags might come as a comma-separated string or array
        let parsedTags = [];
        if (tags) {
            parsedTags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
        }

        const newBlog = new Blog({
            title,
            content,
            author,
            category,
            headerImage: headerImageUrl,
            tags: parsedTags
        });

        await newBlog.save();
        res.status(201).json({ success: true, blog: newBlog });
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ success: false, message: 'Failed to create blog' });
    }
});

// Get All Blogs
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};

        if (category && category !== 'All') {
            query.category = category;
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const blogs = await Blog.find(query)
            .populate('author', 'username profilePicture')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, blogs });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch blogs' });
    }
});

// Get Single Blog
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('author', 'username profilePicture')
            .populate('comments.user', 'username profilePicture');

        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

        res.status(200).json({ success: true, blog });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching blog details' });
    }
});

// Like Blog
router.post('/like/:id', async (req, res) => {
    try {
        const { userId } = req.body;
        const blog = await Blog.findById(req.params.id);

        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

        const index = blog.likes.indexOf(userId);
        if (index === -1) {
            blog.likes.push(userId);
        } else {
            blog.likes.splice(index, 1);
        }

        await blog.save();
        res.status(200).json({ success: true, likes: blog.likes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error liking blog' });
    }
});

// Add Comment
router.post('/comment/:id', async (req, res) => {
    try {
        const { userId, text } = req.body;
        const blog = await Blog.findById(req.params.id);

        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

        const newComment = {
            user: userId,
            text,
            createdAt: new Date()
        };

        blog.comments.push(newComment);
        await blog.save();

        // Populate the user of the new comment to return it
        const populatedBlog = await Blog.findById(req.params.id).populate('comments.user', 'username profilePicture');
        const addedComment = populatedBlog.comments[populatedBlog.comments.length - 1];

        res.status(200).json({ success: true, comment: addedComment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding comment' });
    }
});

// Delete Blog
router.delete('/:id', async (req, res) => {
    try {
        const { userId } = req.body; // In a real app, use auth middleware
        const blog = await Blog.findById(req.params.id);

        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

        // Check ownership
        if (blog.author.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await Blog.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Blog deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting blog' });
    }
});

module.exports = router;
