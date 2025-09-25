const express = require('express');
const Category = require('./../../models/category');
const router = express.Router();
const authenticate = require('../../middleware/jwtAuth');

router.get('/allCategories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ categories });
    } catch (error) {
        console.log('Error in displaying', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/addCategory', authenticate, async (req, res) => {
    try {
        const { category } = req.body;
        if (!category || !category.trim()) {
            return res.status(400).json({ message: 'Category name is required' });
        }
        const existingCategory = await Category.findOne({ category: category.trim() });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }
        const newCategory = new Category({ category: category.trim() });
        await newCategory.save();
        res.status(201).json({ message: 'Category added successfully', category: newCategory });
    } catch (error) {
        console.log('Error while adding category', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

router.delete('/deleteCategory', authenticate, async (req, res) => {
    try {
        const { category } = req.body;
        if (!category || !category.trim()) {
            return res.status(400).json({ message: 'Category name is required' });
        }
        const deletedCategory = await Category.findOneAndDelete({ category: category.trim() });
        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({ message: 'Category deleted successfully', category });
    } catch (error) {
        console.log("Internal server error", error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = router;