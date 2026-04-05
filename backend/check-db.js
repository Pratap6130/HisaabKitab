const { Client } = require("pg");
require("dotenv").config();

(async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log("✓ PostgreSQL connected");

    const dbInfo = await client.query("SELECT current_database() AS db, current_user AS usr");
    console.log("✓ Database info:", dbInfo.rows[0]);

    const counts = await client.query(
      "SELECT (SELECT COUNT(*) FROM customers) AS customers, (SELECT COUNT(*) FROM items) AS items, (SELECT COUNT(*) FROM invoices) AS invoices, (SELECT COUNT(*) FROM invoice_items) AS invoice_items"
    );
    console.log("✓ Row counts:", counts.rows[0]);

    const customers = await client.query("SELECT id, customer_name, status FROM customers LIMIT 3");
    console.log("✓ Sample customers:", customers.rows);

    const items = await client.query("SELECT id, item_name, customer_selling_price, status FROM items LIMIT 3");
    console.log("✓ Sample items:", items.rows);

    const invoices = await client.query("SELECT id, invoice_id, customer_id, total_amount, status FROM invoices LIMIT 3");
    console.log("✓ Sample invoices:", invoices.rows);

    await client.end();
    console.log("\n✓ All queries successful - database is connected and has data");
  } catch (err) {
    console.error("✗ DB Error:", err.message);
    process.exit(1);
  }
})();
