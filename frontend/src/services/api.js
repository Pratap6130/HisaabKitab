import axios from 'axios';

const DEFAULT_API_BASE_URL = 'http://localhost:5000/api';

const normalizeApiBaseUrl = (rawBaseUrl) => {
    if (!rawBaseUrl || !rawBaseUrl.trim()) {
        return DEFAULT_API_BASE_URL;
    }
    let baseUrl = rawBaseUrl.trim()
    if (baseUrl.startsWith(':')) {
        baseUrl = `http://localhost${baseUrl}`;
    } else if (baseUrl.startsWith('//')) {
        baseUrl = `http:${baseUrl}`;
    } else if (!baseUrl.startsWith('/') && !/^https?:\/\//i.test(baseUrl)) {
        baseUrl = `http://${baseUrl}`;
    }
    return baseUrl.replace(/\/+$/, '');
};

const API_BASE_URL = normalizeApiBaseUrl(process.env.REACT_APP_API_URL);

// ===== Customer APIs =====
export const getActiveCustomers = () => axios.get(`${API_BASE_URL}/customers/all`);
export const getAllCustomers = () => axios.get(`${API_BASE_URL}/customers/all-with-inactive`);
export const getCustomer = (id) => axios.get(`${API_BASE_URL}/customers/${id}`);
export const createCustomer = (data) => axios.post(`${API_BASE_URL}/customers/create`, data);
export const updateCustomer = (id, data) => axios.put(`${API_BASE_URL}/customers/${id}/update`, data);
export const deleteCustomer = (id) => axios.delete(`${API_BASE_URL}/customers/${id}/delete`);

// ===== Item APIs =====
export const getActiveItems = () => axios.get(`${API_BASE_URL}/items/all`);
export const getAllItems = () => axios.get(`${API_BASE_URL}/items/all-with-inactive`);
export const getItem = (id) => axios.get(`${API_BASE_URL}/items/${id}`);
export const createItem = (data) => axios.post(`${API_BASE_URL}/items/create`, data);
export const updateItem = (id, data) => axios.put(`${API_BASE_URL}/items/${id}/update`, data);
export const deleteItem = (id) => axios.delete(`${API_BASE_URL}/items/${id}/delete`);

// ===== Invoice APIs =====
export const createInvoice = (data) => axios.post(`${API_BASE_URL}/invoices/create`, data);
export const getAllInvoices = () => axios.get(`${API_BASE_URL}/invoices/all`);
export const getRecentInvoices = (limit = 10) => axios.get(`${API_BASE_URL}/invoices/recent?limit=${limit}`);
export const getInvoicesByCustomer = (customerId) => axios.get(`${API_BASE_URL}/invoices/customer/${customerId}`);
export const getInvoiceDetails = (invoiceId) => axios.get(`${API_BASE_URL}/invoices/details/${invoiceId}`);
export const searchInvoices = (query) => axios.get(`${API_BASE_URL}/invoices/search?query=${query}`);

const api = {
    getActiveCustomers,
    getAllCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getActiveItems,
    getAllItems,
    getItem,
    createItem,
    updateItem,
    deleteItem,
    createInvoice,
    getAllInvoices,
    getRecentInvoices,
    getInvoicesByCustomer,
    getInvoiceDetails,
    searchInvoices
};

export default api;
