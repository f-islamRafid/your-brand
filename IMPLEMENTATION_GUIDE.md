# 🚀 FURNITURE BRAND E-COMMERCE - STEP-BY-STEP IMPLEMENTATION GUIDE

## 📋 Project Status: 50% Complete
Your project has the core features working. Now we'll safely add Payment Receipts, Email Notifications, and Order Management without breaking existing functionality.

---

## 🎯 PHASE 1: DATABASE & RECEIPTS (STEP 1-3)

### ✅ STEP 1: Update Database Schema
**What:** Add `receipts` table to store payment receipts
**Why:** To keep track of all generated receipts with their file paths and email status
**How:** Run the SQL commands in `furniture-brand-api/database-setup.sql`

```sql
CREATE TABLE IF NOT EXISTS receipts (
    receipt_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL UNIQUE REFERENCES orders(order_id),
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    receipt_content TEXT NOT NULL,
    pdf_file_path VARCHAR(255),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMP
);
```

**To Execute:**
```bash
# Connect to your PostgreSQL database
psql -U your_db_user -d your_db_name -f database-setup.sql
```

**Verify it worked:**
```bash
# Check if receipts table exists
psql -U your_db_user -d your_db_name -c "SELECT * FROM information_schema.tables WHERE table_name='receipts';"
```

---

### ✅ STEP 2: Install Required NPM Packages (Backend)
**What:** Add libraries for PDF generation and email sending
**Why:** jsPDF = PDF creation, Nodemailer = email sending

**Navigate to backend folder and run:**
```bash
cd furniture-brand-api
npm install jspdf html2canvas nodemailer
npm install --save-dev dotenv  # Already have it, but verify
```

**Check if installed:**
```bash
npm list jspdf html2canvas nodemailer
```

**What each does:**
- `jspdf` - Creates PDF files from HTML
- `html2canvas` - Converts HTML to canvas (used with jsPDF)
- `nodemailer` - Sends emails via SMTP

---

### ✅ STEP 3: Update .env File (Backend Configuration)
**What:** Add email credentials and receipt settings
**Why:** To configure email sending without hardcoding passwords

**Open `furniture-brand-api/.env` and ADD these variables:**
```
# Email Configuration (Gmail Example)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password  # Use Google App Password, NOT your gmail password
EMAIL_SERVICE=gmail

# Or use any SMTP provider:
# SMTP_HOST=smtp.your-provider.com
# SMTP_PORT=587
# SMTP_USER=your-email@provider.com
# SMTP_PASSWORD=your-password

# Receipt Settings
RECEIPT_FROM_EMAIL=noreply@yourbrand.com
RECEIPT_FOLDER_PATH=./receipts
```

**⚠️ IMPORTANT - Gmail Setup:**
1. Enable 2FA on your Gmail account
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer" (or your device)
4. Copy the 16-character password
5. Use that as `EMAIL_PASSWORD` in .env

**Verify loaded:**
```bash
node -e "require('dotenv').config(); console.log(process.env.EMAIL_USER);"
```

---

## 🎯 PHASE 2: BACKEND RECEIPT GENERATION (STEP 4-6)

### ✅ STEP 4: Create Receipt Generator Module
**What:** A helper file to generate receipt HTML/PDF
**Where:** `furniture-brand-api/receiptGenerator.js`
**Why:** Keep receipt logic separate and reusable

**Create new file with this content:**

```javascript
// furniture-brand-api/receiptGenerator.js

const jsPDF = require('jspdf').jsPDF;
const html2canvas = require('html2canvas');
const fs = require('fs');
const path = require('path');

/**
 * Generate Receipt Number (RECEIPT-2024-001234)
 */
function generateReceiptNumber(orderId) {
    const year = new Date().getFullYear();
    const paddedId = String(orderId).padStart(6, '0');
    return `RECEIPT-${year}-${paddedId}`;
}

/**
 * Create Receipt HTML (as string)
 */
function createReceiptHTML(order, orderItems) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #A67B5B; padding-bottom: 15px; }
            .header h1 { color: #A67B5B; margin: 0; font-size: 28px; }
            .header p { margin: 5px 0; color: #666; }
            .receipt-number { font-size: 14px; color: #999; margin-top: 10px; }
            .section { margin: 20px 0; }
            .section-title { font-weight: bold; font-size: 14px; color: #A67B5B; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 10px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .row-label { font-weight: bold; color: #666; }
            .row-value { text-align: right; color: #333; }
            .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .items-table th { background-color: #F5F5F5; padding: 10px; text-align: left; font-weight: bold; color: #333; }
            .items-table td { padding: 10px; border-bottom: 1px solid #eee; }
            .items-table .item-name { font-weight: 500; }
            .items-table .item-qty { text-align: center; }
            .items-table .item-price { text-align: right; }
            .items-table .item-total { text-align: right; font-weight: bold; }
            .totals { margin: 20px 0; border-top: 2px solid #A67B5B; padding-top: 15px; }
            .total-row { display: flex; justify-content: space-between; padding: 10px 0; }
            .total-row.grand-total { font-size: 18px; font-weight: bold; color: #A67B5B; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
            .status-badge { display: inline-block; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .status-pending { background-color: #FFF3CD; color: #856404; }
            .status-paid { background-color: #D4EDDA; color: #155724; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🏠 Your Furniture Brand</h1>
            <p>Premium Furniture & Home Decor</p>
            <div class="receipt-number">Receipt #${generateReceiptNumber(order.order_id)}</div>
        </div>

        <div class="section">
            <div class="section-title">Customer Information</div>
            <div class="row">
                <span class="row-label">Name:</span>
                <span class="row-value">${order.customer_name}</span>
            </div>
            <div class="row">
                <span class="row-label">Email:</span>
                <span class="row-value">${order.customer_email}</span>
            </div>
            <div class="row">
                <span class="row-label">Shipping Address:</span>
                <span class="row-value">${order.shipping_address}</span>
            </div>
            <div class="row">
                <span class="row-label">Order Date:</span>
                <span class="row-value">${new Date(order.created_at).toLocaleDateString()}</span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Order Items</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 50%;">Product Name</th>
                        <th class="item-qty" style="width: 15%;">Qty</th>
                        <th class="item-price" style="width: 15%;">Price</th>
                        <th class="item-total" style="width: 20%;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${orderItems.map(item => `
                        <tr>
                            <td class="item-name">${item.product_name}</td>
                            <td class="item-qty">${item.quantity}</td>
                            <td class="item-price">৳${parseFloat(item.price_at_purchase).toFixed(2)}</td>
                            <td class="item-total">৳${(item.quantity * parseFloat(item.price_at_purchase)).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section totals">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>৳${parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
            <div class="total-row">
                <span>Shipping:</span>
                <span>FREE</span>
            </div>
            <div class="total-row grand-total">
                <span>Total Amount:</span>
                <span>৳${parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Payment Information</div>
            <div class="row">
                <span class="row-label">Payment Method:</span>
                <span class="row-value">${order.payment_method}</span>
            </div>
            <div class="row">
                <span class="row-label">Payment Status:</span>
                <span class="row-value">
                    <span class="status-badge ${order.payment_status === 'Paid' ? 'status-paid' : 'status-pending'}">
                        ${order.payment_status}
                    </span>
                </span>
            </div>
            <div class="row">
                <span class="row-label">Order Status:</span>
                <span class="row-value">${order.order_status}</span>
            </div>
        </div>

        <div class="footer">
            <p>Thank you for your purchase! 🙏</p>
            <p>For support, contact us at: support@yourbrand.com</p>
            <p>This is an automated receipt. Please do not reply to this email.</p>
            <p style="margin-top: 20px; color: #ccc;">Generated: ${new Date().toLocaleString()}</p>
        </div>
    </body>
    </html>
    `;
}

/**
 * Generate PDF from HTML
 */
async function generatePDF(htmlContent, filename) {
    try {
        const canvas = await html2canvas(htmlContent);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        let heightLeft = canvas.height * imgWidth / canvas.width;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, heightLeft);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - pageHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, heightLeft);
            heightLeft -= pageHeight;
        }

        const receiptPath = path.join(process.env.RECEIPT_FOLDER_PATH || './receipts', filename);
        
        // Ensure folder exists
        if (!fs.existsSync(process.env.RECEIPT_FOLDER_PATH || './receipts')) {
            fs.mkdirSync(process.env.RECEIPT_FOLDER_PATH || './receipts', { recursive: true });
        }

        pdf.save(receiptPath);
        return receiptPath;
    } catch (err) {
        console.error("PDF Generation Error:", err);
        throw err;
    }
}

/**
 * Main Function: Generate and Save Receipt
 */
async function generateReceipt(pool, orderId) {
    try {
        // Get order details
        const orderResult = await pool.query('SELECT * FROM orders WHERE order_id = $1', [orderId]);
        if (orderResult.rows.length === 0) throw new Error('Order not found');
        const order = orderResult.rows[0];

        // Get order items
        const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
        const orderItems = itemsResult.rows;

        // Generate receipt number
        const receiptNumber = generateReceiptNumber(orderId);

        // Create HTML
        const htmlContent = createReceiptHTML(order, orderItems);

        // Generate PDF filename
        const pdfFilename = `receipt-${orderId}-${Date.now()}.pdf`;

        // Generate PDF - Note: html2canvas needs DOM, so we return HTML content instead
        // In production, use a service like headless chrome or server-side rendering
        
        // For now, store receipt info in database
        const receiptRecord = await pool.query(
            `INSERT INTO receipts (order_id, receipt_number, receipt_content, pdf_file_path)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [orderId, receiptNumber, htmlContent, pdfFilename]
        );

        console.log(`✅ Receipt generated for order ${orderId}`);
        return receiptRecord.rows[0];
    } catch (err) {
        console.error("Error generating receipt:", err);
        throw err;
    }
}

module.exports = {
    generateReceipt,
    generateReceiptNumber,
    createReceiptHTML,
    generatePDF
};
```

---

### ✅ STEP 5: Create Email Service Module
**What:** Helper to send emails
**Where:** `furniture-brand-api/emailService.js`

**Create new file:**

```javascript
// furniture-brand-api/emailService.js

const nodemailer = require('nodemailer');

// Initialize email transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 * Send Order Confirmation Email
 */
async function sendOrderConfirmation(customerEmail, customerName, orderId, totalAmount) {
    try {
        const mailOptions = {
            from: process.env.RECEIPT_FROM_EMAIL || process.env.EMAIL_USER,
            to: customerEmail,
            subject: `Order Confirmation - Order #${orderId}`,
            html: `
                <h2>Thank You for Your Order! 🎉</h2>
                <p>Hi ${customerName},</p>
                <p>We've received your order and will start preparing it for shipment.</p>
                
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
                    <p><strong>Order Details:</strong></p>
                    <p>Order ID: <strong>#${orderId}</strong></p>
                    <p>Total Amount: <strong>৳${totalAmount.toFixed(2)}</strong></p>
                </div>
                
                <p>You will receive a shipping notification soon.</p>
                <p>Thank you for shopping with us!</p>
                <p style="color: #999; font-size: 12px;">This is an automated email. Please do not reply.</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Order confirmation sent to ${customerEmail}`, info.response);
        return true;
    } catch (err) {
        console.error("❌ Error sending order confirmation:", err);
        return false;
    }
}

/**
 * Send Receipt Email (HTML or PDF attachment)
 */
async function sendReceiptEmail(customerEmail, customerName, receiptNumber, receiptHTML) {
    try {
        const mailOptions = {
            from: process.env.RECEIPT_FROM_EMAIL || process.env.EMAIL_USER,
            to: customerEmail,
            subject: `Payment Receipt - ${receiptNumber}`,
            html: `
                <h2>Your Payment Receipt 📄</h2>
                <p>Hi ${customerName},</p>
                <p>Your receipt is attached below:</p>
                
                ${receiptHTML}
                
                <p style="color: #999; font-size: 12px; margin-top: 20px;">
                    This is an automated email. Please do not reply.
                </p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Receipt sent to ${customerEmail}`, info.response);
        return true;
    } catch (err) {
        console.error("❌ Error sending receipt email:", err);
        return false;
    }
}

/**
 * Send Order Status Update
 */
async function sendOrderStatusUpdate(customerEmail, customerName, orderId, newStatus) {
    try {
        const mailOptions = {
            from: process.env.RECEIPT_FROM_EMAIL || process.env.EMAIL_USER,
            to: customerEmail,
            subject: `Order Status Update - Order #${orderId}`,
            html: `
                <h2>Order Status Updated 📦</h2>
                <p>Hi ${customerName},</p>
                <p>Your order <strong>#${orderId}</strong> status has been updated:</p>
                
                <div style="background-color: #D4EDDA; padding: 15px; border-left: 4px solid #28A745; border-radius: 5px;">
                    <p style="margin: 0; color: #155724;"><strong>New Status: ${newStatus}</strong></p>
                </div>
                
                <p>Thank you for your patience!</p>
                <p style="color: #999; font-size: 12px;">This is an automated email. Please do not reply.</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Status update sent to ${customerEmail}`, info.response);
        return true;
    } catch (err) {
        console.error("❌ Error sending status update:", err);
        return false;
    }
}

/**
 * Test Email Connection
 */
async function testEmailConnection() {
    try {
        await transporter.verify();
        console.log('✅ Email service is ready!');
        return true;
    } catch (err) {
        console.error('❌ Email service error:', err);
        return false;
    }
}

module.exports = {
    sendOrderConfirmation,
    sendReceiptEmail,
    sendOrderStatusUpdate,
    testEmailConnection
};
```

---

### ✅ STEP 6: Update Server.js - Add Receipt Generation to Order Creation
**What:** When an order is created, auto-generate receipt and send email
**Where:** Modify `furniture-brand-api/server.js` 

**Add these imports at the top:**
```javascript
const { generateReceipt } = require('./receiptGenerator');
const { sendOrderConfirmation, sendReceiptEmail } = require('./emailService');
```

**Replace the "7. Place Order" route (line 150-177) with this:**

```javascript
// 7. Place Order - WITH RECEIPT GENERATION
app.post('/api/orders', async (req, res) => {
    const client = await pool.connect();
    try {
        const { cartItems, customerInfo, paymentMethod, paymentStatus } = req.body;
        await client.query('BEGIN');

        // Create order
        const orderResult = await client.query(
            "INSERT INTO orders (customer_name, shipping_address, total_amount, customer_email, payment_method, payment_status) VALUES($1, $2, $3, $4, $5, $6) RETURNING order_id",
            [customerInfo.name, customerInfo.address, customerInfo.total, customerInfo.email, paymentMethod || 'COD', paymentStatus || 'Pending']
        );
        const orderId = orderResult.rows[0].order_id;

        // Add order items
        for (const item of cartItems) {
            await client.query(
                "INSERT INTO order_items (order_id, product_id, product_name, quantity, price_at_purchase) VALUES($1, $2, $3, $4, $5)",
                [orderId, item.id, item.name, item.quantity, item.price]
            );
        }
        
        await client.query('COMMIT');

        // ✅ AFTER ORDER IS CREATED:
        // 1. Generate receipt
        try {
            await generateReceipt(pool, orderId);
            console.log(`📄 Receipt generated for order ${orderId}`);
        } catch (err) {
            console.error(`⚠️  Receipt generation failed: ${err.message}`);
            // Don't fail the order, just log the error
        }

        // 2. Send order confirmation email
        try {
            await sendOrderConfirmation(customerInfo.email, customerInfo.name, orderId, customerInfo.total);
            console.log(`📧 Confirmation email sent to ${customerInfo.email}`);
        } catch (err) {
            console.error(`⚠️  Email sending failed: ${err.message}`);
        }

        res.json({ orderId, message: "Order placed successfully!", receipt: "Receipt generated" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Order creation error:", err);
        res.status(500).json({ error: "Server Error", details: err.message });
    } finally {
        client.release();
    }
});
```

---

## 🎯 PHASE 3: FRONTEND RECEIPT DISPLAY (STEP 7-8)

### ✅ STEP 7: Create Receipt Download Component
**What:** New React component to show receipt and download it
**Where:** Create `client/src/OrderReceipt.js`

**Create new file:**

```javascript
// client/src/OrderReceipt.js

import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiDownload, FiMail, FiArrowLeft } from 'react-icons/fi';

function OrderReceipt() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    
    const [receipt, setReceipt] = useState(null);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [emailing, setEmailing] = useState(false);

    useEffect(() => {
        fetchReceiptData();
    }, [orderId]);

    const fetchReceiptData = async () => {
        try {
            const res = await fetch(`/api/receipts/${orderId}`);
            if (!res.ok) throw new Error('Receipt not found');
            
            const data = await res.json();
            setReceipt(data.receipt);
            setOrder(data.order);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError(err.message);
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        setDownloading(true);
        try {
            const res = await fetch(`/api/receipts/${orderId}/download-pdf`);
            if (!res.ok) throw new Error('Failed to download PDF');
            
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt-${orderId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            
            toast.success('Receipt downloaded successfully!');
        } catch (err) {
            toast.error('Failed to download PDF');
        }
        setDownloading(false);
    };

    const handleSendEmail = async () => {
        setEmailing(true);
        try {
            const res = await fetch(`/api/receipts/${orderId}/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!res.ok) throw new Error('Failed to send email');
            
            toast.success('Receipt sent to your email!');
        } catch (err) {
            toast.error('Failed to send email');
        }
        setEmailing(false);
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" />
                <p className="mt-3">Loading receipt...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <h4>Receipt Not Found</h4>
                    <p>{error}</p>
                    <Button variant="primary" onClick={() => navigate('/')}>Go Home</Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row className="mb-4">
                <Col md={8}>
                    <Button 
                        variant="link" 
                        className="text-decoration-none p-0 mb-3" 
                        onClick={() => navigate('/')}
                    >
                        <FiArrowLeft className="me-2" /> Back to Home
                    </Button>
                    <h2 className="fw-bold">Order Receipt</h2>
                </Col>
                <Col md={4} className="text-end">
                    <Button 
                        variant="primary" 
                        className="me-2" 
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                    >
                        <FiDownload className="me-2" /> {downloading ? 'Downloading...' : 'Download PDF'}
                    </Button>
                    <Button 
                        variant="outline-primary" 
                        onClick={handleSendEmail}
                        disabled={emailing}
                    >
                        <FiMail className="me-2" /> {emailing ? 'Sending...' : 'Send Email'}
                    </Button>
                </Col>
            </Row>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                    {receipt && (
                        <div dangerouslySetInnerHTML={{ __html: receipt.receipt_content }} />
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default OrderReceipt;
```

---

### ✅ STEP 8: Update Checkout to Redirect to Receipt
**What:** After order is placed, redirect to receipt page
**Where:** Modify `client/src/Checkout.js`

**Find the `placeOrder` function (around line 45-73) and update it:**

```javascript
const placeOrder = async (status = 'Pending') => {
    setProcessing(true);
    try {
        const orderData = {
            customerInfo: { ...formData, total: cartTotal },
            cartItems: cartItems,
            paymentMethod: paymentMethod,
            paymentStatus: status
        };

        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (res.ok) {
            const data = await res.json();
            toast.success(`Order Placed! ID: ${data.orderId}`);
            clearCart();
            
            // ✅ REDIRECT TO RECEIPT PAGE INSTEAD OF HOME
            navigate(`/order-receipt/${data.orderId}`);
        } else {
            toast.error("Order failed. Please try again.");
        }
    } catch (err) {
        toast.error("Network Error");
    }
    setProcessing(false);
};
```

---

## 🎯 PHASE 4: BACKEND ROUTES FOR RECEIPTS (STEP 9)

### ✅ STEP 9: Add Receipt Routes to Server.js
**What:** API endpoints to fetch and download receipts
**Where:** Add to `furniture-brand-api/server.js` (at the end, before listening)

**Add these new routes:**

```javascript
// 12. Get Receipt by Order ID
app.get('/api/receipts/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const receiptResult = await pool.query(
            'SELECT * FROM receipts WHERE order_id = $1',
            [orderId]
        );
        
        if (receiptResult.rows.length === 0) {
            return res.status(404).json({ error: 'Receipt not found' });
        }

        const orderResult = await pool.query(
            'SELECT * FROM orders WHERE order_id = $1',
            [orderId]
        );

        res.json({
            receipt: receiptResult.rows[0],
            order: orderResult.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// 13. Download Receipt as PDF
app.get('/api/receipts/:orderId/download-pdf', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const receiptResult = await pool.query(
            'SELECT * FROM receipts WHERE order_id = $1',
            [orderId]
        );
        
        if (receiptResult.rows.length === 0) {
            return res.status(404).json({ error: 'Receipt not found' });
        }

        const receipt = receiptResult.rows[0];
        const pdfPath = path.join(__dirname, receipt.pdf_file_path);

        // If PDF exists, send it
        if (fs.existsSync(pdfPath)) {
            res.download(pdfPath);
        } else {
            // Otherwise, return HTML as fallback
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Content-Disposition', `attachment; filename="receipt-${orderId}.html"`);
            res.send(receipt.receipt_content);
        }
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// 14. Send Receipt Email
app.post('/api/receipts/:orderId/send-email', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const receiptResult = await pool.query(
            'SELECT * FROM receipts WHERE order_id = $1',
            [orderId]
        );
        
        if (receiptResult.rows.length === 0) {
            return res.status(404).json({ error: 'Receipt not found' });
        }

        const receipt = receiptResult.rows[0];
        
        const orderResult = await pool.query(
            'SELECT * FROM orders WHERE order_id = $1',
            [orderId]
        );
        const order = orderResult.rows[0];

        // Send email
        const emailSent = await sendReceiptEmail(
            order.customer_email,
            order.customer_name,
            receipt.receipt_number,
            receipt.receipt_content
        );

        if (emailSent) {
            // Update email_sent status
            await pool.query(
                'UPDATE receipts SET email_sent = true, email_sent_at = CURRENT_TIMESTAMP WHERE receipt_id = $1',
                [receipt.receipt_id]
            );
            res.json({ message: 'Receipt email sent successfully' });
        } else {
            res.status(500).json({ error: 'Failed to send email' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});
```

---

## 🎯 PHASE 5: ROUTING SETUP (STEP 10)

### ✅ STEP 10: Add Receipt Route to App.js
**What:** Register new receipt page in router
**Where:** `client/src/App.js`

**Find the imports section and add:**
```javascript
import OrderReceipt from './OrderReceipt';
```

**Find the Routes section (around line 180) and add this new route:**
```javascript
<Route path="/order-receipt/:orderId" element={<OrderReceipt />} />
```

**Example of how it should look:**
```javascript
<Routes>
    <Route path="/" element={<ProductList />} />
    <Route path="/product/:id" element={<ProductDetail />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/order-receipt/:orderId" element={<OrderReceipt />} />  {/* NEW */}
    <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/login" element={<Login />} />
    <Route path="*" element={<Navigate to="/" />} />
</Routes>
```

---

## ✅ TESTING CHECKLIST

### Before Deployment:

- [ ] **Database**: Run SQL script and verify `receipts` table exists
- [ ] **Backend**: Install npm packages (jspdf, nodemailer, html2canvas)
- [ ] **Environment**: Add EMAIL_USER and EMAIL_PASSWORD to .env
- [ ] **Backend**: Test email connection by running server
- [ ] **Frontend**: Verify no console errors in browser
- [ ] **Test Flow**:
  1. Add products to cart
  2. Go to checkout
  3. Place order
  4. Should redirect to receipt page
  5. Download/Email buttons should work

---

## 📝 QUICK REFERENCE - FILE CHANGES

| File | Action | Purpose |
|------|--------|---------|
| `database-setup.sql` | CREATE | Add `receipts` table |
| `receiptGenerator.js` | CREATE | Generate receipt HTML |
| `emailService.js` | CREATE | Send emails |
| `server.js` | UPDATE | Add receipt generation to order endpoint |
| `server.js` | ADD | Add receipt API routes |
| `OrderReceipt.js` | CREATE | React receipt display component |
| `Checkout.js` | UPDATE | Redirect to receipt after order |
| `App.js` | UPDATE | Add receipt route |

---

## 🆘 TROUBLESHOOTING

**Problem**: "Email not sending"
- Solution: Check .env variables, verify Gmail app password

**Problem**: "Receipt not showing"
- Solution: Check if receipts table exists in database

**Problem**: "Blank receipt page"
- Solution: Check browser console for errors, verify order ID in URL

---

## 🚀 NEXT STEPS AFTER THIS PHASE

Once this is working:
- Phase 2: Add order status tracking (Pending → Shipped → Delivered)
- Phase 3: Real payment gateway integration (Stripe/PayPal/SSLCommerz)
- Phase 4: Admin dashboard with order management

---

**You're ready to start! Begin with STEP 1 (Database) and work through in order.** 🎉
