const express = require('express');
const sellProduct = require('../../models/sellProduct');
const router = express.Router();
const categoryModel = require('../../models/category');

router.get('/getProductByCategory', async (req, res) => {
    try {
        const categories = await categoryModel.find();
        if (categories.length === 0) {
            return res.status(404).json({ message: "No categories found" });
        }

        const productsByCategory = await Promise.all(
            categories.map(async (cat) => {
                const products = await sellProduct.find({ category: cat.category })
                    .sort({ createdAt: -1 })
                    .limit(10);
                return {
                    category: cat.category,
                    products
                };
            })
        );

        res.status(200).json({ categories: productsByCategory });
    } catch (error) {
        console.log("error: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/searchProduct', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    const category = req.query.category || 'all';

    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category !== 'all') {
      query.category = category;
    }

    const products = await sellProduct.find(query).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error('Search product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await sellProduct.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        console.log("error: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
