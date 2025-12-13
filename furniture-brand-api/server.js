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

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Access API at: http://localhost:${PORT}`);
});