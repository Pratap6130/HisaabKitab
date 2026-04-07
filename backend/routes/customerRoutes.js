import express from 'express';
import * as customerController from '../controllers/customerController.js';

const router = express.Router();

router.get('/all', customerController.getAllCustomers);

router.get('/all-with-inactive', customerController.getAllCustomersWithInactive);

router.get('/:id', customerController.getCustomerById);

router.post('/create', customerController.createCustomer);

router.put('/:id/update', customerController.updateCustomer);

router.delete('/:id/delete', customerController.deleteCustomer);

export default router;
