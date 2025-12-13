const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 5000;

// PostgreSQL Connection Pool
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

// --- ROUTES ---

// 1. Get All Products (only active ones for the shop)
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
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 3. Admin: Get All Products (active and archived)
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
app.post('/api/products', async (req, res) => {
    try {
        const { name, base_price, description, material } = req.body;
        const newProduct = await pool.query(
            "INSERT INTO products (name, base_price, description, material) VALUES($1, $2, $3, $4) RETURNING *",
            [name, base_price, description, material]
        );
        res.json(newProduct.rows[0]);
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
        res.json("Product was updated!");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 6. Admin: SMART DELETE (Archive if used, Delete if unused)
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Try to Hard Delete
        await pool.query("DELETE FROM products WHERE product_id = $1", [id]);
        
        // If successful:
        res.json({ message: "Product permanently deleted." });

    } catch (err) {
        // 2. Catch Foreign Key Violation (Error 23503 means "It's used in an order")
        if (err.code === '23503') {
            try {
                // 3. Perform "Soft Delete" (Set is_active = false)
                await pool.query("UPDATE products SET is_active = false WHERE product_id = $1", [req.params.id]);
                return res.json({ message: "Product archived (hidden) because it has order history." });
            } catch (updateErr) {
                return res.status(500).json({ error: "Failed to archive product." });
            }
        }
        
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// 7. Get All Variants (for all products)
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
        
        await client.query('BEGIN'); // Start transaction

        // Insert into orders table
        const orderResult = await client.query(
            "INSERT INTO orders (customer_name, shipping_address, total_amount, email) VALUES($1, $2, $3, $4) RETURNING order_id",
            [customerInfo.name, customerInfo.address, customerInfo.total, customerInfo.email]
        );
        const orderId = orderResult.rows[0].order_id;

        // Insert into order_items table and update stock
        for (const item of cartItems) {
            await client.query(
                "INSERT INTO order_items (order_id, product_id, product_name, quantity, price_at_purchase) VALUES($1, $2, $3, $4, $5)",
                [orderId, item.id, item.name, item.quantity, item.price]
            );

            // If it's a variant, update variant stock
            if (item.variant_id) {
                await client.query(
                    "UPDATE variants SET stock_quantity = stock_quantity - $1 WHERE variant_id = $2",
                    [item.quantity, item.variant_id]
                );
            }
            // If it's a base product, update base product stock (though we haven't implemented base stock yet)
            
        }

        await client.query('COMMIT'); // End transaction
        res.json({ orderId, message: "Order placed successfully!" });

    } catch (err) {
        await client.query('ROLLBACK'); // Rollback transaction on error
        console.error(err.message);
        res.status(500).send("Server Error during checkout");
    } finally {
        client.release();
    }
});

// 9. Admin: Get All Orders with Items (for OrderManager)
app.get('/api/orders', async (req, res) => {
    try {
        const ordersResult = await pool.query("SELECT * FROM orders ORDER BY order_id DESC");
        const orders = ordersResult.rows;

        // Fetch items for all orders concurrently
        const orderIds = orders.map(o => o.order_id);
        if (orderIds.length === 0) return res.json([]);

        const itemsResult = await pool.query(
            "SELECT * FROM order_items WHERE order_id = ANY($1::int[])",
            [orderIds]
        );
        const itemsMap = {};
        itemsResult.rows.forEach(item => {
            if (!itemsMap[item.order_id]) {
                itemsMap[item.order_id] = [];
            }
            itemsMap[item.order_id].push(item);
        });

        const finalOrders = orders.map(order => ({
            ...order,
            items: itemsMap[order.order_id] || []
        }));

        res.json(finalOrders);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error fetching orders");
    }
});

// 10. Admin: Update Order Status
app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // e.g., "Shipped", "Completed"

        await pool.query(
            "UPDATE orders SET status = $1 WHERE order_id = $2",
            [status, id]
        );

        res.json({ message: "Order status updated" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});