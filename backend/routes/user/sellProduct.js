const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('./../../cloudinary/cloudinaryConfig');
const sellProduct = require('./../../models/sellProduct');
const router = express.Router();

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'sellProducts',
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
    },
});

const upload = multer({ storage });

router.post('/uploadProduct', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 }
]), async (req, res) => {
     const { title, description, price, userId, category } = req.body;
    
    try {
       
   
        if (!title || !description || !price || !category || !userId) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const imageURL = req.files.image ? req.files.image[0].path : '';
         
        if (!imageURL) {
            return res.status(400).json({ message: 'Main product image is required' });
        }
        const imageURL1 = req.files.image1 ? req.files.image1[0].path : '';
        const imageURL2 = req.files.image2 ? req.files.image2[0].path : '';
        const imageURL3 = req.files.image3 ? req.files.image3[0].path : '';

        const product = new sellProduct({
            title,
            description,
            price,
            category,
           imageURL: imageURL,
           imageURL1: imageURL1,
           imageURL2:imageURL2,
           imageURL3:imageURL3,
            createdBy: userId
        });
        await product.save();
        res.status(201).json({ message: 'Product put on sale' });
    } catch (error) {
        console.error('Product upload error:', error);
        res.status(500).json({ message: 'Product upload failed', error: error.message });
    }
});

router.get('/getAllProducts', async (req, res) => {
    try {
        const products = await sellProduct.find().sort({ createdAt: -1 });
        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found' });
        }
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = router;