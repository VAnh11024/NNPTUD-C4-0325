var express = require('express');
var router = express.Router();
let inventoryModel = require('../schemas/inventories');

// GET all inventories (join with product)
router.get('/', async function (req, res, next) {
  try {
    let result = await inventoryModel.find().populate({
      path: 'product',
      select: 'title slug price description images category'
    });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// GET inventory by ID (join with product)
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await inventoryModel.findById(id).populate({
      path: 'product',
      select: 'title slug price description images category'
    });
    if (!result) {
      return res.status(404).send({ message: "Inventory not found" });
    }
    res.send(result);
  } catch (error) {
    res.status(404).send({ message: "Inventory not found" });
  }
});

// POST add_stock: tăng stock
router.post('/add_stock', async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    if (!product || !quantity || quantity <= 0) {
      return res.status(400).send({ message: "product and quantity (> 0) are required" });
    }
    let inventory = await inventoryModel.findOne({ product: product });
    if (!inventory) {
      return res.status(404).send({ message: "Inventory not found for this product" });
    }
    inventory.stock += quantity;
    await inventory.save();
    res.send(inventory);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// POST remove_stock: giảm stock
router.post('/remove_stock', async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    if (!product || !quantity || quantity <= 0) {
      return res.status(400).send({ message: "product and quantity (> 0) are required" });
    }
    let inventory = await inventoryModel.findOne({ product: product });
    if (!inventory) {
      return res.status(404).send({ message: "Inventory not found for this product" });
    }
    if (inventory.stock < quantity) {
      return res.status(400).send({ message: "Not enough stock" });
    }
    inventory.stock -= quantity;
    await inventory.save();
    res.send(inventory);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// POST reservation: giảm stock, tăng reserved
router.post('/reservation', async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    if (!product || !quantity || quantity <= 0) {
      return res.status(400).send({ message: "product and quantity (> 0) are required" });
    }
    let inventory = await inventoryModel.findOne({ product: product });
    if (!inventory) {
      return res.status(404).send({ message: "Inventory not found for this product" });
    }
    if (inventory.stock < quantity) {
      return res.status(400).send({ message: "Not enough stock to reserve" });
    }
    inventory.stock -= quantity;
    inventory.reserved += quantity;
    await inventory.save();
    res.send(inventory);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// POST sold: giảm reserved, tăng soldCount
router.post('/sold', async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    if (!product || !quantity || quantity <= 0) {
      return res.status(400).send({ message: "product and quantity (> 0) are required" });
    }
    let inventory = await inventoryModel.findOne({ product: product });
    if (!inventory) {
      return res.status(404).send({ message: "Inventory not found for this product" });
    }
    if (inventory.reserved < quantity) {
      return res.status(400).send({ message: "Not enough reserved to sell" });
    }
    inventory.reserved -= quantity;
    inventory.soldCount += quantity;
    await inventory.save();
    res.send(inventory);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
