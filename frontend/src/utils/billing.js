export const getSubtotal = (billItems) => {
    return billItems.reduce((total, row) => total + (row.unit_price * row.quantity), 0);
};

export const getGstPercentage = (customer) => {
    return customer?.is_gst_registered ? 0 : 18;
};

export const getBillingPreview = (billItems, customer) => {
    const subtotal = getSubtotal(billItems);
    const gstPercentage = getGstPercentage(customer);
    const gstAmount = gstPercentage > 0
        ? Math.round((subtotal * gstPercentage) / 100 * 100) / 100
        : 0;

    return {
        subtotal,
        gstPercentage,
        gstAmount,
        grandTotal: subtotal + gstAmount
    };
};
