const createServiceError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

export const validateInvoicePayload = (customerId, items) => {
    if (!customerId || !Array.isArray(items) || items.length === 0) {
        throw createServiceError(400, 'Missing customer_id or items');
    }
};

export const generateInvoiceId = async (dbClient) => {
    let invoiceId;
    let exists = true;

    while (exists) {
        const randomPart = Math.floor(100000 + Math.random() * 900000).toString();
        invoiceId = `INVC${randomPart}`;

        const result = await dbClient.query('SELECT id FROM invoices WHERE invoice_id = $1', [invoiceId]);
        exists = result.rows.length > 0;
    }

    return invoiceId;
};

export const calculateInvoiceTotals = async (dbClient, customer, items) => {
    let subtotal = 0;
    const priceByItemId = {};

    for (const row of items) {
        const itemResult = await dbClient.query(
            'SELECT id, customer_selling_price FROM items WHERE id = $1',
            [row.item_id]
        );

        if (itemResult.rows.length === 0) {
            throw createServiceError(404, `Item ${row.item_id} not found`);
        }

        const price = Number(itemResult.rows[0].customer_selling_price);
        subtotal += price * row.quantity;
        priceByItemId[row.item_id] = price;
    }

    const gstPercentage = customer.is_gst_registered ? 0 : 18;
    const gstAmount = gstPercentage > 0 ? Math.round((subtotal * gstPercentage) / 100 * 100) / 100 : 0;

    return {
        subtotal,
        gstPercentage,
        gstAmount,
        totalAmount: subtotal + gstAmount,
        priceByItemId
    };
};

export const buildInvoiceItemRows = (invoiceDbId, items, priceByItemId) => {
    return items.map((row) => {
        const unitPrice = priceByItemId[row.item_id];
        return {
            invoiceId: invoiceDbId,
            itemId: row.item_id,
            quantity: row.quantity,
            unitPrice,
            lineTotal: unitPrice * row.quantity
        };
    });
};
