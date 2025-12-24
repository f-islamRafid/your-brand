require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer'); 
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// PostgreSQL Connection
// Note: host is 'localhost' because your Docker DB is mapped to your local port 5432
require('dotenv').config(); 
const { Pool } = require('pg');

// Use the variables from your .env file
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Test the connection immediately on startup
pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Database connection error:', err.stack);
    }
    console.log('✅ Connected to PostgreSQL Database');
    release();
});

// Middleware
app.use(cors());
app.use(express.json());

// --- IMAGE UPLOAD CONFIGURATION (MULTER) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../client/public/images');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, 'temp-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- ROUTES ---

// 1. Get Active Products (Shop View)
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM products WHERE is_active = true ORDER BY product_id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 2. Get Single Product
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM products WHERE product_id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Product not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 3. Admin: Get ALL Products (Active & Hidden)
app.get('/api/admin/products', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM products ORDER BY product_id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 4. Admin: Add New Product
app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        const { name, base_price, description, material } = req.body;
        const newProduct = await pool.query(
            "INSERT INTO products (name, base_price, description, material) VALUES($1, $2, $3, $4) RETURNING *",
            [name, base_price, description, material]
        );
        const product = newProduct.rows[0];

        if (req.file) {
            const oldPath = req.file.path;
            const newPath = path.join(req.file.destination, `${product.product_id}.jpg`);
            fs.renameSync(oldPath, newPath);
        }
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 5. Admin: Update Product
app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, base_price, description, material, is_active } = req.body;
        await pool.query(
            "UPDATE products SET name = $1, base_price = $2, description = $3, material = $4, is_active = $5 WHERE product_id = $6",
            [name, base_price, description, material, is_active, id]
        );
        res.json("Product updated!");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 6. Admin: Delete/Archive Product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM products WHERE product_id = $1", [id]);
        res.json({ message: "Product permanently deleted." });
    } catch (err) {
        if (err.code === '23503') {
            await pool.query("UPDATE products SET is_active = false WHERE product_id = $1", [req.params.id]);
            return res.json({ message: "Product archived because it has order history." });
        }
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// 7. Get All Variants
app.get('/api/variants', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM variants");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 8. Place Order
app.post('/api/orders', async (req, res) => {
    const client = await pool.connect();
    try {
        const { cartItems, customerInfo, paymentMethod, paymentStatus } = req.body;
        await client.query('BEGIN');

        const orderResult = await client.query(
            "INSERT INTO orders (customer_name, shipping_address, total_amount, customer_email, payment_method, payment_status) VALUES($1, $2, $3, $4, $5, $6) RETURNING order_id",
            [customerInfo.name, customerInfo.address, customerInfo.total, customerInfo.email, paymentMethod || 'COD', paymentStatus || 'Pending']
        );
        const orderId = orderResult.rows[0].order_id;

        for (const item of cartItems) {
            await client.query(
                "INSERT INTO order_items (order_id, product_id, product_name, quantity, price_at_purchase) VALUES($1, $2, $3, $4, $5)",
                [orderId, item.id, item.name, item.quantity, item.price]
            );
        }
        await client.query('COMMIT');
        res.json({ orderId, message: "Order placed!" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send("Server Error");
    } finally {
        client.release();
    }
});

// 9. Admin: Get Orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await pool.query("SELECT * FROM orders ORDER BY order_id DESC");
        res.json(orders.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 10. Admin: Update Order Status
app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await pool.query("UPDATE orders SET status = $1 WHERE order_id = $2", [status, id]);
        res.json({ message: "Status updated" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// --- ⭐ REVIEW ROUTES (UPDATED FOR CORRECT SCHEMA) ---

// 11. Get APPROVED Reviews for a Product (Public View)
app.get('/api/products/:id/reviews', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "SELECT * FROM reviews WHERE product_id = $1 AND status = 'APPROVED' ORDER BY created_at DESC",
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 12. Add a Review (Public View)
app.post('/api/products/:id/reviews', async (req, res) => {
    try {
        const { id } = req.params;
        const { customer_name, rating, content } = req.body; 
        const newReview = await pool.query(
            "INSERT INTO reviews (product_id, customer_name, rating, content) VALUES($1, $2, $3, $4) RETURNING *",
            [id, customer_name, rating, content]
        );
        res.json(newReview.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 13. Admin: Get ALL Reviews with Product Names (For ReviewManager)
app.get('/api/admin/reviews', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                r.review_id, r.product_id, r.customer_name, r.email, r.rating, 
                r.content, r.status, r.created_at, p.name AS product_name
            FROM reviews r
            JOIN products p ON r.product_id = p.product_id
            ORDER BY r.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Admin Fetch Error:", err.message);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});

// 14. Admin: Update Review Status (Approve/Hide)
app.put('/api/admin/reviews/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await pool.query("UPDATE reviews SET status = $1 WHERE review_id = $2", [status, id]);
        res.json({ message: "Review status updated" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// 15. Admin: Delete Review
app.delete('/api/admin/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM reviews WHERE review_id = $1", [id]);
        res.json({ message: "Review deleted" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});