DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS items CASCADE;

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_address TEXT,
    customer_pan_card VARCHAR(20) UNIQUE,
    customer_gst_number VARCHAR(15) UNIQUE,
    is_gst_registered BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'In-Active')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    customer_selling_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'In-Active')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_id VARCHAR(10) UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(12, 2) NOT NULL,
    gst_amount DECIMAL(12, 2) DEFAULT 0,
    gst_percentage INTEGER DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Generated' CHECK (status IN ('Generated', 'Paid', 'Cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES items(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_invoice_id ON invoices(invoice_id);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_items_status ON items(status);

INSERT INTO customers (customer_name, customer_address, customer_pan_card, customer_gst_number, is_gst_registered, status) VALUES
('Gupta Enterprise Pvt. Ltd.', '123 Business Street, Mumbai', 'AAAPG1234K', '27AABGU9003R1Z0', TRUE, 'Active'),
('Mahesh Industries Pvt. Ltd.', '456 Industrial Area, Delhi', 'BBBPG5678J', '07AABCU5678R1Z0', TRUE, 'Active'),
('Omkar and Brothers Pvt. Ltd.', '789 Commerce Road, Bangalore', 'CCCPG9012M', NULL, FALSE, 'In-Active'),
('Bhuwan Infotech.', '321 Tech Park, Pune', 'DDDPG3456N', '18AABDU1234R1Z0', TRUE, 'Active'),
('Swastik Software Pvt. Ltd.', '654 Developer Court, Hyderabad', 'EEEPG7890O', NULL, FALSE, 'Active');

INSERT INTO items (item_name, customer_selling_price, status) VALUES
('Laptop', 50000.00, 'Active'),
('LED Monitor', 15000.00, 'Active'),
('Pen Drive', 500.00, 'Active'),
('Mobile Phone', 30000.00, 'Active'),
('Headphones', 5000.00, 'In-Active'),
('Power Bank', 2000.00, 'Active');

CREATE OR REPLACE VIEW recent_invoices_view AS
SELECT 
    i.id,
    i.invoice_id,
    c.customer_name,
    i.invoice_date,
    i.subtotal,
    i.gst_amount,
    i.total_amount,
    i.status
FROM invoices i
JOIN customers c ON i.customer_id = c.id
ORDER BY i.created_at DESC
LIMIT 10;

CREATE OR REPLACE VIEW customer_invoices_view AS
SELECT 
    c.id,
    c.customer_name,
    COUNT(i.id) as total_invoices,
    SUM(i.total_amount) as total_amount_generated
FROM customers c
LEFT JOIN invoices i ON c.id = i.customer_id
GROUP BY c.id, c.customer_name;

CREATE OR REPLACE FUNCTION generate_invoice_id()
RETURNS VARCHAR(10) AS $$
DECLARE
    new_invoice_id VARCHAR(10);
    random_part VARCHAR(6);
BEGIN
    LOOP
        random_part := SUBSTR(MD5(RANDOM()::TEXT), 1, 6);
        new_invoice_id := 'INVC' || random_part;

        EXIT WHEN NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_id = new_invoice_id);
    END LOOP;
    
    RETURN new_invoice_id;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50),
    operation VARCHAR(10),
    record_id INTEGER,
    old_data JSONB,
    new_data JSONB,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(50)
);
