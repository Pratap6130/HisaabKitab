import express from 'express';
import * as itemController from '../controllers/itemController.js';

const router = express.Router();

// Get all active items
router.get('/all', itemController.getAllItems);

// Get all items (including inactive)
router.get('/all-with-inactive', itemController.getAllItemsWithInactive);

// Get item by ID
router.get('/:id', itemController.getItemById);

// Create new item
router.post('/create', itemController.createItem);

// Update item
router.put('/:id/update', itemController.updateItem);

// Delete item (soft delete)
router.delete('/:id/delete', itemController.deleteItem);

export default router;
