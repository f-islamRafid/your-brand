import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Alert, Badge, Nav, Tab, Card, InputGroup } from 'react-bootstrap';
import toast from 'react-hot-toast';

// --- SUB-COMPONENT: PRODUCT MANAGER ---
function ProductManager({ products, fetchProducts }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({ name: '', description: '', base_price: '', material: '' });
    const [file, setFile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    // Filter Logic
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.product_id.toString().includes(searchTerm)
    );

    const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});
    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (file) data.append('image', file);

        const url = editMode ? `/api/products/${editId}` : '/api/products';
        const method = editMode ? 'PUT' : 'POST';

        // PUT request usually needs JSON if we aren't updating the image, 
        // but for simplicity we'll keep using FormData or switch based on backend needs.
        // NOTE: Our previous PUT backend endpoint expected JSON, so let's handle that:
        
        try {
            let res;
            if (editMode) {
                // Update (JSON)
                res = await fetch(url, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData, is_active: true }) 
                });
            } else {
                // Create (FormData for Image)
                res = await fetch(url, { method: 'POST', body: data });
            }

            if (res.ok) {
                toast.success(editMode ? "Product Updated!" : "Product Created!");
                resetForm();
                fetchProducts();
            } else {
                toast.error("Operation Failed");
            }
        } catch (err) { toast.error("Network Error"); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this product?")) {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (res.ok) { toast.success("Deleted!"); fetchProducts(); }
            else { toast.error("Cannot delete (might be in an order)"); }
        }
    };

    const handleEdit = (product) => {
        setFormData({ 
            name: product.name, 
            description: product.description, 
            base_price: product.base_price, 
            material: product.material 
        });
        setEditId(product.product_id);
        setEditMode(true);
        setShowForm(true);
        window.scrollTo(0,0);
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', base_price: '', material: '' });
        setFile(null);
        setEditMode(false);
        setEditId(null);
        setShowForm(false);
    };

    return (
        <div className="animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0">Inventory</h3>
                <Button variant={showForm ? "secondary" : "primary"} onClick={() => showForm ? resetForm() : setShowForm(true)}>
                    {showForm ? "Cancel" : "+ Add New Product"}
                </Button>
            </div>

            {/* ADD / EDIT FORM (Collapsible) */}
            {showForm && (
                <Card className="mb-4 shadow-sm border-0 bg-light">
                    <Card.Body>
                        <h5 className="mb-3">{editMode ? `Edit Product #${editId}` : "New Product Details"}</h5>
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3"><Form.Label>Name</Form.Label><Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required /></Form.Group>
                                    <Form.Group className="mb-3"><Form.Label>Price ($)</Form.Label><Form.Control type="number" name="base_price" value={formData.base_price} onChange={handleChange} required /></Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3"><Form.Label>Material</Form.Label><Form.Control type="text" name="material" value={formData.material} onChange={handleChange} /></Form.Group>
                                    {!editMode && <Form.Group className="mb-3"><Form.Label>Image</Form.Label><Form.Control type="file" onChange={handleFileChange} /></Form.Group>}
                                </Col>
                                <Col md={12}>
                                    <Form.Group className="mb-3"><Form.Label>Description</Form.Label><Form.Control as="textarea" name="description" value={formData.description} onChange={handleChange} /></Form.Group>
                                    <Button type="submit" variant="success">{editMode ? "Save Changes" : "Create Product"}</Button>
                                </Col>
                            </Row>
                        </Form>
                    </Card.Body>
                </Card>
            )}

            {/* SEARCH BAR */}
            <InputGroup className="mb-3 shadow-sm">
                <InputGroup.Text className="bg-white border-0">🔍</InputGroup.Text>
                <Form.Control 
                    placeholder="Search by name or ID..." 
                    className="border-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </InputGroup>

            {/* PRODUCT TABLE */}
            <Card className="border-0 shadow-sm">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light"><tr><th>Img</th><th>Name</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                    <tbody>
                        {filteredProducts.map(p => (
                            <tr key={p.product_id}>
                                <td><img src={`/images/${p.product_id}.jpg`} alt="mini" width="40" height="40" className="rounded" onError={(e)=>{e.target.onerror=null;e.target.src="https://placehold.co/40"}}/></td>
                                <td className="fw-bold">{p.name}</td>
                                <td>${p.base_price}</td>
                                <td><Badge bg={p.is_active ? 'success' : 'secondary'}>{p.is_active ? 'Active' : 'Hidden'}</Badge></td>
                                <td>
                                    <Button variant="link" className="text-decoration-none p-0 me-3" onClick={() => handleEdit(p)}>Edit</Button>
                                    <Button variant="link" className="text-danger text-decoration-none p-0" onClick={() => handleDelete(p.product_id)}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
}

// --- SUB-COMPONENT: ORDER MANAGER ---
function OrderManager({ orders }) {
    // Quick Stats
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0).toFixed(2);
    const totalOrders = orders.length;

    return (
        <div className="animate__animated animate__fadeIn">
            <h3 className="mb-4">Order Management</h3>
            
            {/* STATS CARDS */}
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="border-0 shadow-sm text-white" style={{background: 'linear-gradient(135deg, #4A5D45 0%, #2C3531 100%)'}}>
                        <Card.Body>
                            <h6>Total Revenue</h6>
                            <h3>${totalRevenue}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm bg-white">
                        <Card.Body>
                            <h6 className="text-muted">Total Orders</h6>
                            <h3>{totalOrders}</h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {orders.length === 0 ? <Alert variant="info">No orders received yet.</Alert> : (
                <div className="d-grid gap-3">
                    {orders.map(order => (
                        <Card key={order.order_id} className="border-0 shadow-sm">
                            <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
                                <div>
                                    <strong>Order #{order.order_id}</strong>
                                    <span className="text-muted mx-2">|</span>
                                    <span className="text-primary fw-bold">{order.customer_name}</span>
                                </div>
                                <div className="text-end">
                                    <span className="text-muted small me-3">{new Date(order.created_at).toLocaleDateString()}</span>
                                    <Badge bg="warning" text="dark" className="me-2">Pending</Badge>
                                    <strong className="fs-5">${order.total_amount}</strong>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <p className="small text-muted mb-3">
                                    <strong>Ship To:</strong> {order.shipping_address} <br/>
                                    <strong>Email:</strong> {order.customer_email}
                                </p>
                                <Table size="sm" borderless className="mb-0">
                                    <thead className="text-muted small border-bottom"><tr><th>Item</th><th>Qty</th><th className="text-end">Price</th></tr></thead>
                                    <tbody>
                                        {order.items && order.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.name}</td>
                                                <td>x{item.quantity}</td>
                                                <td className="text-end">${item.price_at_purchase}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- MAIN ADMIN LAYOUT ---
function Admin() {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchProducts();
        fetchOrders();
    }, []);

    const fetchProducts = () => fetch('/api/products').then(res => res.json()).then(setProducts);
    const fetchOrders = () => fetch('/api/orders').then(res => res.json()).then(setOrders);

    return (
        <Container fluid className="py-4 bg-light" style={{minHeight: '100vh'}}>
            <Tab.Container id="admin-tabs" defaultActiveKey="products">
                <Row>
                    {/* LEFT SIDEBAR */}
                    <Col md={3} lg={2} className="mb-4">
                        <Card className="border-0 shadow-sm sticky-top" style={{top: '100px'}}>
                            <Card.Body className="p-2">
                                <div className="text-center py-3 border-bottom mb-2">
                                    <h5 className="fw-bold text-success">Admin Panel</h5>
                                </div>
                                <Nav variant="pills" className="flex-column">
                                    <Nav.Item>
                                        <Nav.Link eventKey="products" className="mb-1 fw-bold text-dark">📦 Products</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="orders" className="mb-1 fw-bold text-dark">📋 Orders</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link href="/" className="mt-3 text-muted small">&larr; Back to Shop</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* RIGHT CONTENT AREA */}
                    <Col md={9} lg={10}>
                        <Tab.Content>
                            <Tab.Pane eventKey="products">
                                <ProductManager products={products} fetchProducts={fetchProducts} />
                            </Tab.Pane>
                            <Tab.Pane eventKey="orders">
                                <OrderManager orders={orders} />
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
        </Container>
    );
}

export default Admin;