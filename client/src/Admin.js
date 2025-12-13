// client/src/Admin.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Alert } from 'react-bootstrap';

function Admin() {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        base_price: '',
        material: ''
    });
    const [message, setMessage] = useState(null);

    // 1. Fetch current products on load
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error(err));
    };

    // 2. Handle Form Input
    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    // 3. Submit New Product
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Product added successfully!' });
                setFormData({ name: '', description: '', base_price: '', material: '' }); // Clear form
                fetchProducts(); // Refresh list
            } else {
                setMessage({ type: 'danger', text: 'Failed to add product.' });
            }
        } catch (error) {
            setMessage({ type: 'danger', text: 'Network error.' });
        }
    };

    return (
        <Container className="py-5">
            <h2 className="mb-4">Admin Dashboard: Product Manager</h2>
            
            {message && <Alert variant={message.type}>{message.text}</Alert>}

            <Row>
                {/* Left: Add Product Form */}
                <Col md={4} className="mb-4">
                    <div className="p-4 border rounded bg-light">
                        <h4>Add New Product</h4>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Product Name</Form.Label>
                                <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Price ($)</Form.Label>
                                <Form.Control type="number" step="0.01" name="base_price" value={formData.base_price} onChange={handleChange} required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Material</Form.Label>
                                <Form.Control type="text" name="material" value={formData.material} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} />
                            </Form.Group>
                            <Button variant="primary" type="submit" className="w-100">
                                Add Product
                            </Button>
                        </Form>
                    </div>
                </Col>

                {/* Right: Product Inventory List */}
                <Col md={8}>
                    <h4>Current Inventory</h4>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.product_id}>
                                    <td>{p.product_id}</td>
                                    <td>{p.name}</td>
                                    <td>${p.base_price}</td>
                                    <td style={{ color: p.is_active ? 'green' : 'red' }}>
                                        {p.is_active ? 'Active' : 'Inactive'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
}

export default Admin;