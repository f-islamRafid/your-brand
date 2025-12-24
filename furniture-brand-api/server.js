require('dotenv').config(); // Load environment variables once at the very top
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer'); 
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// --- DATABASE CONNECTION ---
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Test the connection immediately
pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Database connection error:', err.stack);
    }
    console.log('✅ Connected to PostgreSQL Database');
    release();
});

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// Auth Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) return res.status(401).json({ message: "Access Denied: No Token Provided" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid or Expired Token" });
        req.user = user; 
        next(); 
    });
};

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
        res.status(500).send("Server Error");
    }
});

// 3. Admin: Get ALL Products
app.get('/api/admin/products', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM products ORDER BY product_id ASC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// 4. Admin: Add New Product
app.post('/api/products', authenticateToken, upload.single('image'), async (req, res) => {
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
        res.status(500).send("Server Error");
    }
});

// 5. Admin: Update Product
app.put('/api/products/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, base_price, description, material, is_active } = req.body;
        await pool.query(
            "UPDATE products SET name = $1, base_price = $2, description = $3, material = $4, is_active = $5 WHERE product_id = $6",
            [name, base_price, description, material, is_active, id]
        );
        res.json("Product updated!");
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// 6. Admin: Delete Product
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM products WHERE product_id = $1", [id]);
        res.json({ message: "Product permanently deleted." });
    } catch (err) {
        if (err.code === '23503') {
            await pool.query("UPDATE products SET is_active = false WHERE product_id = $1", [id]);
            return res.json({ message: "Product archived because it has order history." });
        }
        res.status(500).json({ error: "Server Error" });
    }
});

// 7. Place Order
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
        res.status(500).send("Server Error");
    } finally {
        client.release();
    }
});

// 8. Admin: Get Orders
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const orders = await pool.query("SELECT * FROM orders ORDER BY order_id DESC");
        res.json(orders.rows);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// 9. Admin: Update Reviews
app.get('/api/admin/reviews', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, p.name AS product_name
            FROM reviews r
            JOIN products p ON r.product_id = p.product_id
            ORDER BY r.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});

// 10. AUTH: Register
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userExist = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExist.rows.length > 0) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, username, email",
            [username, email, hashedPassword]
        );
        res.json({ message: "User registered successfully!", user: newUser.rows[0] });
    } catch (err) {
        res.status(500).send("Server Error during registration");
    }
});

// 11. AUTH: Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        
        if (userResult.rows.length === 0) return res.status(401).json({ message: "Invalid Credentials" });

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: "Invalid Credentials" });

        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.user_id, username: user.username, role: user.role } });
    } catch (err) {
        res.status(500).send("Server Error during login");
    }
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});