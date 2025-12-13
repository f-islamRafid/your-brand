// server.js

const express = require('express');
const cors = require('cors');
// Load environment variables
require('dotenv').config(); 
// Import database pool
const pool = require('./db'); 

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); 
app.use(express.json()); 

// --- Root Test Route ---
app.get('/', (req, res) => {
    res.send('Welcome to the Furniture Brand API!');
});

// --- API Routes ---

// 1. GET all products (Read All)
app.get('/api/products', async (req, res) => {
    try {
        const allProducts = await pool.query("SELECT * FROM products;");
        res.json(allProducts.rows);
    } catch (err) {
        console.error('Error fetching all products:', err.message);
        res.status(500).json({ error: 'Server Error: Failed to fetch products.' });
    }
});

// 2. GET single product by ID (Read Single)
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Use parameterized query ($1) for security
        const product = await pool.query("SELECT * FROM products WHERE product_id = $1;", [id]);
        
        if (product.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json(product.rows[0]);
    } catch (err) {
        console.error('Error fetching single product:', err.message);
        res.status(500).json({ error: 'Server Error: Failed to fetch product.' });
    }
});

// 3. POST a new product (Create)
app.post('/api/products', async (req, res) => {
    try {
        // Destructure necessary fields from the request body
        const { category_id, name, description, base_price, material } = req.body;

        // SQL Query to insert the new product, RETURNING * sends back the new row
        const newProduct = await pool.query(
            "INSERT INTO products (category_id, name, description, base_price, material) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
            [category_id, name, description, base_price, material]
        );

        // Send back the newly created product object with a 201 Created status
        res.status(201).json(newProduct.rows[0]);

    } catch (err) {
        console.error('Error creating product:', err.message);
        // This often catches database errors (e.g., foreign key violation, missing fields)
        res.status(500).json({ error: 'Server Error: Failed to create new product.' });
    }
});


// --- Database Connection Test Route ---
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()'); 
        res.json({ 
            message: 'Database query successful', 
            timestamp: result.rows[0].now 
        });
    } catch (err) {
        console.error('Error running DB test query:', err.message);
        res.status(500).json({ error: 'Server Error: Could not execute database query.' });
    }
});

// server.js

// 4. PUT to update a product (Update)
app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params; // The product ID from the URL
        // Fields to update from the request body
        const { name, description, base_price, material, is_active } = req.body; 

        // SQL Query to update the product. 
        // We ensure only the provided fields are updated for the given ID ($6).
        const updateProduct = await pool.query(
            "UPDATE products SET name = $1, description = $2, base_price = $3, material = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP WHERE product_id = $6 RETURNING *;",
            [name, description, base_price, material, is_active, id]
        );

        if (updateProduct.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        // Send back the newly updated product object
        res.json(updateProduct.rows[0]);

    } catch (err) {
        console.error('Error updating product:', err.message);
        res.status(500).json({ error: 'Server Error: Failed to update product.' });
    }
});

// server.js

// 5. DELETE a product by ID (Delete)
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params; // The product ID from the URL

        // SQL Query to delete the row where the product_id matches the ID from the URL
        const deleteProduct = await pool.query(
            "DELETE FROM products WHERE product_id = $1 RETURNING *;",
            [id]
        );

        if (deleteProduct.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        // Send a simple confirmation message
        res.json({ message: `Product with ID ${id} was successfully deleted.` });

    } catch (err) {
        console.error('Error deleting product:', err.message);
        res.status(500).json({ error: 'Server Error: Failed to delete product.' });
    }
});

// server.js

// 6. POST a new variant for a product (Create Variant)
app.post('/api/variants', async (req, res) => {
    try {
        // Destructure all required fields from the request body
        const { product_id, sku, color, size, price_modifier, stock_quantity, image_url, is_available } = req.body;

        // SQL Query to insert the new variant
        const newVariant = await pool.query(
            "INSERT INTO variants (product_id, sku, color, size, price_modifier, stock_quantity, image_url, is_available) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;",
            [product_id, sku, color, size, price_modifier, stock_quantity, image_url, is_available]
        );

        // Send back the newly created variant object
        res.status(201).json(newVariant.rows[0]); 

    } catch (err) {
        console.error('Error creating variant:', err.message);
        // This will often catch Foreign Key errors if product_id does not exist
        res.status(500).json({ error: 'Server Error: Failed to create new variant.' });
    }
});

// server.js

// 7. GET all variants (Read All)
app.get('/api/variants', async (req, res) => {
    try {
        const allVariants = await pool.query("SELECT * FROM variants;");
        res.json(allVariants.rows);
    } catch (err) {
        console.error('Error fetching all variants:', err.message);
        res.status(500).json({ error: 'Server Error: Failed to fetch variants.' });
    }
});

// 8. GET single variant by ID (Read Single)
app.get('/api/variants/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const variant = await pool.query("SELECT * FROM variants WHERE variant_id = $1;", [id]);
        
        if (variant.rows.length === 0) {
            return res.status(404).json({ error: "Variant not found" });
        }

        res.json(variant.rows[0]);
    } catch (err) {
        console.error('Error fetching single variant:', err.message);
        res.status(500).json({ error: 'Server Error: Failed to fetch variant.' });
    }
});

// server.js

// 9. DELETE a variant by ID (Delete)
app.delete('/api/variants/:id', async (req, res) => {
    try {
        const { id } = req.params; 

        const deleteVariant = await pool.query(
            "DELETE FROM variants WHERE variant_id = $1 RETURNING *;",
            [id]
        );

        if (deleteVariant.rows.length === 0) {
            return res.status(404).json({ error: "Variant not found" });
        }
        
        res.json({ message: `Variant with ID ${id} was successfully deleted.` });

    } catch (err) {
        console.error('Error deleting variant:', err.message);
        res.status(500).json({ error: 'Server Error: Failed to delete variant.' });
    }
});

// furniture-brand-api/server.js

// ... existing routes ...

// NEW: Create a new Order
app.post('/api/orders', async (req, res) => {
    const { customer_name, customer_email, shipping_address, total_amount, items } = req.body;

    try {
        // 1. Insert the main Order
        const orderResult = await pool.query(
            'INSERT INTO orders (customer_name, customer_email, shipping_address, total_amount) VALUES ($1, $2, $3, $4) RETURNING order_id',
            [customer_name, customer_email, shipping_address, total_amount]
        );
        
        const newOrderId = orderResult.rows[0].order_id;

        // 2. Insert all the Items for this order
        // We use a loop to save each item into order_items
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

// ... app.listen ...

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Access API at: http://localhost:${PORT}`);
});