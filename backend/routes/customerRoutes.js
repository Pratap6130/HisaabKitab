import express from 'express';
import * as customerController from '../controllers/customerController.js';

const router = express.Router();

// Get all active customers
router.get('/all', customerController.getAllCustomers);

// Get all customers (including inactive)
router.get('/all-with-inactive', customerController.getAllCustomersWithInactive);

// Get customer by ID
router.get('/:id', customerController.getCustomerById);

// Create new customer
router.post('/create', customerController.createCustomer);

// Update customer
router.put('/:id/update', customerController.updateCustomer);

// Delete customer (soft delete)
router.delete('/:id/delete', customerController.deleteCustomer);

export default router;
