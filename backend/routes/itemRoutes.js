import express from 'express';
import * as itemController from '../controllers/itemController.js';

const router = express.Router();

router.get('/all', itemController.getAllItems);

router.get('/all-with-inactive', itemController.getAllItemsWithInactive);

router.get('/:id', itemController.getItemById);

router.post('/create', itemController.createItem);

router.put('/:id/update', itemController.updateItem);

router.delete('/:id/delete', itemController.deleteItem);

export default router;
