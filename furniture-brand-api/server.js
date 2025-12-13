const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer'); // REQUIRE MULTER FOR IMAGES
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// PostgreSQL Connection
const pool = new Pool({
    user: 'myuser',
    host: 'furniture-db-pg',
    database: 'furniture_db',
    password: 'mypassword',
    port: 5432,
});

// Middleware
app.use(cors());
app.use(express.json());

// --- IMAGE UPLOAD CONFIGURATION (MULTER) ---
// This tells the server where to save the images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Save to client/public/images so React can see them
        const dir = path.join(__dirname, '../client/public/images');
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Give it a temporary name first
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

// 4. Admin: Add New Product (FIXED: Added 'upload.single')
app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        const { name, base_price, description, material } = req.body;
        
        // Insert into Database
        const newProduct = await pool.query(
            "INSERT INTO products (name, base_price, description, material) VALUES($1, $2, $3, $4) RETURNING *",
            [name, base_price, description, material]
        );
        const product = newProduct.rows[0];

        // Rename the image to match the Product ID (e.g., 55.jpg)
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

// 6. Admin: Smart Delete (Archive if sold, Delete if new)
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Try permanent delete
        await pool.query("DELETE FROM products WHERE product_id = $1", [id]);
        res.json({ message: "Product permanently deleted." });
    } catch (err) {
        // If it fails because of orders (Foreign Key error 23503), Archive it instead
        if (err.code === '23503') {
            await pool.query("UPDATE products SET is_active = false WHERE product_id = $1", [req.params.id]);
            return res.json({ message: "Product archived (hidden) because it has order history." });
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
        const { cartItems, customerInfo } = req.body;
        await client.query('BEGIN');

        const orderResult = await client.query(
            "INSERT INTO orders (customer_name, shipping_address, total_amount, email) VALUES($1, $2, $3, $4) RETURNING order_id",
            [customerInfo.name, customerInfo.address, customerInfo.total, customerInfo.email]
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});