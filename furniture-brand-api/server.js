const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer'); // Import Multer
const path = require('path');
const fs = require('fs'); // Import File System
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- CONFIGURING IMAGE UPLOAD ---
// We will save files initially to a temp folder, then rename them
const upload = multer({ dest: path.join(__dirname, '../client/public/images/') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// --- ROUTES ---

app.get('/api/products', async (req, res) => {
    try {
        const allProducts = await pool.query("SELECT * FROM products ORDER BY product_id ASC");
        res.json(allProducts.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await pool.query("SELECT * FROM products WHERE product_id = $1", [id]);
        if (product.rows.length === 0) return res.status(404).json({ message: "Product not found" });
        res.json(product.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

app.get('/api/variants', async (req, res) => {
    try {
        const allVariants = await pool.query("SELECT * FROM variants");
        res.json(allVariants.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// --- NEW: CREATE PRODUCT WITH IMAGE ---
// 'upload.single('image')' looks for a form field named 'image'
app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        const { name, description, base_price, material } = req.body;
        
        // 1. Insert Data into Database
        const newProduct = await pool.query(
            "INSERT INTO products (name, description, base_price, material, is_active) VALUES ($1, $2, $3, $4, true) RETURNING *",
            [name, description, base_price, material]
        );

        const newId = newProduct.rows[0].product_id;

        // 2. Handle the Image File (if one was uploaded)
        if (req.file) {
            // The file is currently saved with a random name (e.g., "a3f9...")
            const oldPath = req.file.path;
            
            // We want to rename it to "ID.jpg" (e.g., "3.jpg")
            const targetPath = path.join(__dirname, `../client/public/images/${newId}.jpg`);

            // Rename the file
            fs.rename(oldPath, targetPath, err => {
                if (err) console.error("Error renaming file:", err);
            });
        }

        res.json(newProduct.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// NEW: Create Order Endpoint (from previous steps)
app.post('/api/orders', async (req, res) => {
    const { customer_name, customer_email, shipping_address, total_amount, items } = req.body;
    try {
        const orderResult = await pool.query(
            'INSERT INTO orders (customer_name, customer_email, shipping_address, total_amount) VALUES ($1, $2, $3, $4) RETURNING order_id',
            [customer_name, customer_email, shipping_address, total_amount]
        );
        const newOrderId = orderResult.rows[0].order_id;
        for (const item of items) {
            await pool.query(
                'INSERT INTO order_items (order_id, product_id, variant_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4, $5)',
                [newOrderId, item.product_id, item.variant_id || null, item.quantity, item.price]
            );
        }
        res.status(201).json({ message: 'Order placed successfully', orderId: newOrderId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// furniture-brand-api/server.js

// ... existing routes ...

// NEW: Get All Orders (For Admin Dashboard)
app.get('/api/orders', async (req, res) => {
    try {
        // We join 'orders' with 'order_items' to get the full picture
        // This is a slightly complex query to group items under their order
        const ordersQuery = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
        const orders = ordersQuery.rows;

        // For each order, fetch its items
        for (let order of orders) {
            const itemsQuery = await pool.query(
                `SELECT oi.*, p.name 
                 FROM order_items oi 
                 JOIN products p ON oi.product_id = p.product_id 
                 WHERE oi.order_id = $1`,
                [order.order_id]
            );
            order.items = itemsQuery.rows;
        }

        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// furniture-brand-api/server.js

// ... existing routes ...

// NEW: Update a Product (PUT)
app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, base_price, material, is_active } = req.body;
        
        const updateProduct = await pool.query(
            "UPDATE products SET name = $1, description = $2, base_price = $3, material = $4, is_active = $5 WHERE product_id = $6",
            [name, description, base_price, material, is_active, id]
        );

        res.json({ message: "Product updated!" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// NEW: Delete a Product (DELETE)
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await pool.query("DELETE FROM products WHERE product_id = $1", [id]);
        res.json({ message: "Product deleted!" });
    } catch (err) {
        console.error(err.message);
        // If the product is in an order, SQL will throw a foreign key error
        res.status(400).json({ error: "Cannot delete product (it might be part of an existing order)." });
    }
});

// app.listen...

// ... app.listen ...

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});