import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Alert, Badge, Nav } from 'react-bootstrap';

function Admin() {
    const [view, setView] = useState('products'); // 'products' or 'orders'
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    
    // Form State
    const [formData, setFormData] = useState({ name: '', description: '', base_price: '', material: '' });
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchProducts();
        fetchOrders();
    }, []);

    const fetchProducts = () => {
        fetch('/api/products').then(res => res.json()).then(data => setProducts(data));
    };

    const fetchOrders = () => {
        fetch('/api/orders').then(res => res.json()).then(data => setOrders(data));
    };

    // ... Handle Form Inputs (Same as before) ...
    const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});
    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('base_price', formData.base_price);
        data.append('material', formData.material);
        if (file) data.append('image', file);

        try {
            const res = await fetch('/api/products', { method: 'POST', body: data });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Product added!' });
                setFormData({ name: '', description: '', base_price: '', material: '' });
                setFile(null);
                fetchProducts();
            } else {
                setMessage({ type: 'danger', text: 'Failed.' });
            }
        } catch (err) { setMessage({ type: 'danger', text: 'Error.' }); }
    };

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Admin Dashboard</h2>
                <Nav variant="pills" activeKey={view} onSelect={(k) => setView(k)}>
                    <Nav.Item>
                        <Nav.Link eventKey="products">Products</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="orders">Orders</Nav.Link>
                    </Nav.Item>
                </Nav>
            </div>
            
            {message && <Alert variant={message.type}>{message.text}</Alert>}

            {view === 'products' ? (
                /* --- PRODUCTS VIEW --- */
                <Row>
                    <Col md={4} className="mb-4">
                        <div className="p-4 border rounded bg-white shadow-sm">
                            <h4>Add Product</h4>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3"><Form.Control type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required /></Form.Group>
                                <Form.Group className="mb-3"><Form.Control type="number" name="base_price" placeholder="Price" value={formData.base_price} onChange={handleChange} required /></Form.Group>
                                <Form.Group className="mb-3"><Form.Control type="text" name="material" placeholder="Material" value={formData.material} onChange={handleChange} /></Form.Group>
                                <Form.Group className="mb-3"><Form.Control as="textarea" name="description" placeholder="Description" value={formData.description} onChange={handleChange} /></Form.Group>
                                <Form.Group className="mb-3"><Form.Control type="file" accept=".jpg" onChange={handleFileChange} /></Form.Group>
                                <Button variant="primary" type="submit" className="w-100">Add Product</Button>
                            </Form>
                        </div>
                    </Col>
                    <Col md={8}>
                        <Table hover responsive className="bg-white shadow-sm rounded">
                            <thead className="bg-light"><tr><th>ID</th><th>Img</th><th>Name</th><th>Price</th></tr></thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.product_id}>
                                        <td>{p.product_id}</td>
                                        <td><img src={`/images/${p.product_id}.jpg`} alt="" width="30" onError={(e)=>{e.target.onerror=null;e.target.src="https://placehold.co/30"}}/></td>
                                        <td>{p.name}</td>
                                        <td>${p.base_price}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            ) : (
                /* --- ORDERS VIEW (NEW) --- */
                <Row>
                    <Col>
                        {orders.length === 0 ? <Alert variant="info">No orders received yet.</Alert> : 
                        orders.map(order => (
                            <div key={order.order_id} className="card mb-3 shadow-sm border-0">
                                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>Order #{order.order_id}</strong>
                                        <span className="text-muted ms-2">by {order.customer_name}</span>
                                        <div className="small text-muted">{new Date(order.created_at).toLocaleString()}</div>
                                    </div>
                                    <h4><Badge bg="success">${order.total_amount}</Badge></h4>
                                </div>
                                <div className="card-body">
                                    <Row>
                                        <Col md={4}>
                                            <h6>Shipping To:</h6>
                                            <p className="small text-muted mb-0">
                                                {order.shipping_address}<br/>
                                                {order.customer_email}
                                            </p>
                                        </Col>
                                        <Col md={8}>
                                            <h6>Items:</h6>
                                            <Table size="sm" borderless>
                                                <tbody>
                                                    {order.items && order.items.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td>{item.quantity}x</td>
                                                            <td>{item.name}</td>
                                                            <td className="text-end">${item.price_at_purchase}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        ))}
                    </Col>
                </Row>
            )}
        </Container>
    );
}

export default Admin;