import express from 'express';
import * as invoiceController from '../controllers/invoiceController.js';

const router = express.Router();

router.post('/create', invoiceController.createInvoice);

router.get('/all', invoiceController.getAllInvoices);

router.get('/recent', invoiceController.getRecentInvoices);

router.get('/customer/:customerId', invoiceController.getInvoicesByCustomer);

router.get('/search', invoiceController.searchInvoiceById);

router.get('/details/:invoiceId', invoiceController.getInvoiceDetails);

router.get('/:invoiceId', invoiceController.getInvoiceById);

export default router;
