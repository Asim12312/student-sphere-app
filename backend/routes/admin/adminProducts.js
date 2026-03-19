const express = require('express');
const router = express.Router();
const SellProduct = require('../../models/sellProduct');

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await SellProduct.find()
      .populate('createdBy', 'username userEmail')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await SellProduct.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product successfully deleted.', deletedId: id });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
