import express from 'express';
import * as invoiceController from '../controllers/invoiceController.js';

const router = express.Router();

// Create new invoice
router.post('/create', invoiceController.createInvoice);

// Get all invoices
router.get('/all', invoiceController.getAllInvoices);

// Get recent invoices (for dashboard)
router.get('/recent', invoiceController.getRecentInvoices);

// Get invoices by customer ID
router.get('/customer/:customerId', invoiceController.getInvoicesByCustomer);

// Search invoices by ID
router.get('/search', invoiceController.searchInvoiceById);

// Get invoice details by invoice ID
router.get('/details/:invoiceId', invoiceController.getInvoiceDetails);

// Get single invoice by ID
router.get('/:invoiceId', invoiceController.getInvoiceById);

export default router;
