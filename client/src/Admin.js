import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Alert, Badge, Nav, Card, InputGroup, Modal } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ReviewManager from './ReviewManager';

// --- SUB-COMPONENT: PRODUCT MANAGER ---
function ProductManager({ products, fetchProducts }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [formData, setFormData] = useState({ name: '', description: '', base_price: '', material: '' });
    const [file, setFile] = useState(null);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({ product_id: '', name: '', description: '', base_price: '', material: '', is_active: true });

    // CRASH FIX: Safety check to ensure products is always an array
    const safeProducts = Array.isArray(products) ? products : [];

    const filteredProducts = safeProducts.filter(p => {
        const matchesSearch = (p.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.product_id?.toString().includes(searchTerm));

        const matchesStatus = statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' && p.is_active) ||
            (statusFilter === 'HIDDEN' && !p.is_active);

        return matchesSearch && matchesStatus;
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFile(e.target.files[0]);

    // Added Token to Header
    const authHeader = { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (file) data.append('image', file);

        try {
            const res = await fetch('http://localhost:5000/api/products', { 
                method: 'POST', 
                headers: authHeader, 
                body: data 
            });
            if (res.ok) {
                toast.success("Product Created!");
                setFormData({ name: '', description: '', base_price: '', material: '' });
                setFile(null);
                setShowForm(false);
                fetchProducts();
            } else { toast.error("Operation Failed"); }
        } catch (err) { toast.error("Network Error"); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this product?")) {
            try {
                const res = await fetch(`http://localhost:5000/api/products/${id}`, { 
                    method: 'DELETE',
                    headers: authHeader 
                });
                if (res.ok) { toast.success("Deleted"); fetchProducts(); }
            } catch (err) { toast.error("Network Error"); }
        }
    };

    const openEditModal = (product) => { setEditData(product); setShowEditModal(true); };
    
    const handleEditChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setEditData({ ...editData, [e.target.name]: value });
    };

    const handleSaveEdit = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/products/${editData.product_id}`, {
                method: 'PUT',
                headers: { ...authHeader, 'Content-Type': 'application/json' },
                body: JSON.stringify(editData)
            });
            if (res.ok) { toast.success("Updated!"); setShowEditModal(false); fetchProducts(); }
        } catch (err) { toast.error("Update error"); }
    };

    return (
        <div className="animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0">Inventory</h3>
                <Button variant={showForm ? "secondary" : "success"} onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel Add" : "+ Add New Product"}
                </Button>
            </div>

            {showForm && (
                <Card className="mb-4 shadow-sm border-0 bg-light">
                    <Card.Body>
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3"><Form.Label>Name</Form.Label><Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required /></Form.Group>
                                    <Form.Group className="mb-3"><Form.Label>Price (৳)</Form.Label><Form.Control type="number" name="base_price" value={formData.base_price} onChange={handleChange} required /></Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3"><Form.Label>Material</Form.Label><Form.Control type="text" name="material" value={formData.material} onChange={handleChange} /></Form.Group>
                                    <Form.Group className="mb-3"><Form.Label>Image</Form.Label><Form.Control type="file" onChange={handleFileChange} /></Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group className="mb-3"><Form.Label>Description</Form.Label><Form.Control as="textarea" name="description" value={formData.description} onChange={handleChange} /></Form.Group>
                                    <Button type="submit" variant="success">Create Product</Button>
                                </Col>
                            </Row>
                        </Form>
                    </Card.Body>
                </Card>
            )}

            <Card className="mb-4 shadow-sm border-0 p-3">
                <Row className="g-2">
                    <Col md={9}>
                        <InputGroup>
                            <InputGroup.Text className="bg-white border-end-0">🔍</InputGroup.Text>
                            <Form.Control placeholder="Search by name or ID..." className="border-start-0" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </InputGroup>
                    </Col>
                    <Col md={3}>
                        <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="ALL">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="HIDDEN">Hidden/Archived</option>
                        </Form.Select>
                    </Col>
                </Row>
            </Card>

            <Card className="border-0 shadow-sm">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light"><tr><th>Img</th><th>Name (ID)</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {filteredProducts.map(p => (
                            <tr key={p.product_id}>
                                <td><img src={`/images/${p.product_id}.jpg`} alt="mini" width="40" height="40" className="rounded" style={{ objectFit: 'cover' }} onError={(e) => { e.target.src = "https://placehold.co/40" }} /></td>
                                <td><span className="fw-bold">{p.name}</span><small className="text-muted d-block">ID: {p.product_id}</small></td>
                                <td>৳{parseFloat(p.base_price).toLocaleString()}</td>
                                <td><Badge bg={p.is_active ? 'success' : 'secondary'}>{p.is_active ? 'ACTIVE' : 'HIDDEN'}</Badge></td>
                                <td>
                                    <Button variant="link" className="text-decoration-none p-0 me-3" onClick={() => openEditModal(p)}>Edit</Button>
                                    <Button variant="link" className="text-danger text-decoration-none p-0" onClick={() => handleDelete(p.product_id)}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton><Modal.Title>Edit Product</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3"><Form.Label>Name</Form.Label><Form.Control type="text" name="name" value={editData.name} onChange={handleEditChange} /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Price</Form.Label><Form.Control type="number" name="base_price" value={editData.base_price} onChange={handleEditChange} /></Form.Group>
                        <Form.Check type="switch" label="Product Active" name="is_active" checked={editData.is_active} onChange={handleEditChange} />
                    </Form>
                </Modal.Body>
                <Modal.Footer><Button variant="primary" onClick={handleSaveEdit}>Save Changes</Button></Modal.Footer>
            </Modal>
        </div>
    );
}

// --- SUB-COMPONENT: ORDER MANAGER ---
function OrderManager({ orders, fetchOrders }) {
    const safeOrders = Array.isArray(orders) ? orders : [];
    const totalRevenue = safeOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0).toFixed(2);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await fetch(`http://localhost:5000/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            fetchOrders();
            toast.success("Status Updated");
        } catch (err) { toast.error("Failed to update status"); }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'success';
            case 'Shipped': return 'info';
            case 'Cancelled': return 'danger';
            default: return 'warning';
        }
    };

    return (
        <div className="animate__animated animate__fadeIn">
            <h2 className="mb-5 fw-bold">Order Management</h2>
            <Row className="mb-5 g-4">
                <Col md={6} lg={4}>
                    <Card className="border-0 shadow-lg bg-success text-white">
                        <Card.Body className="d-flex justify-content-between align-items-center">
                            <div><p className="mb-1 fw-light">Total Revenue</p><h3 className="fw-bold">৳{parseFloat(totalRevenue).toLocaleString()}</h3></div>
                            <span style={{ fontSize: '2rem' }}>💰</span>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} lg={4}>
                    <Card className="border-0 shadow-lg bg-white">
                        <Card.Body className="d-flex justify-content-between align-items-center">
                            <div><p className="mb-1 text-muted">Total Orders</p><h3 className="fw-bold text-dark">{safeOrders.length}</h3></div>
                            <span style={{ fontSize: '2rem' }}>📦</span>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {safeOrders.length === 0 ? <Alert variant="info">No orders received.</Alert> : (
                <div className="d-grid gap-3">
                    {safeOrders.map(order => (
                        <Card key={order.order_id} className="border-0 shadow-sm">
                            <Card.Header className="bg-light d-flex justify-content-between align-items-center py-3">
                                <div><strong>Order #{order.order_id}</strong> | <span className="text-primary fw-bold">{order.customer_name}</span></div>
                                <div className="d-flex align-items-center">
                                    <strong className="fs-5 me-3">৳{parseFloat(order.total_amount).toLocaleString()}</strong>
                                    <Form.Select 
                                        size="sm" 
                                        value={order.status || 'Pending'} 
                                        className={`bg-${getStatusColor(order.status)} text-dark border-0 fw-bold`}
                                        style={{ width: '150px' }}
                                        onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                                    >
                                        <option value="Pending">🕒 Pending</option>
                                        <option value="Shipped">🚚 Shipped</option>
                                        <option value="Completed">✅ Completed</option>
                                        <option value="Cancelled">❌ Cancelled</option>
                                    </Form.Select>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}><p className="small mb-1 text-muted">Shipping:</p><p className="fw-bold mb-0">{order.shipping_address}</p></Col>
                                    <Col md={6}>
                                        <Table size="sm" borderless>
                                            <thead><tr className="small border-bottom"><th>Item</th><th>Qty</th><th className="text-end">Price</th></tr></thead>
                                            <tbody>
                                                {order.items?.map((item, idx) => (
                                                    <tr key={idx}><td>{item.name}</td><td>x{item.quantity}</td><td className="text-end">৳{item.price_at_purchase}</td></tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </Col>
                                </Row>
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
    const [activeKey, setActiveKey] = useState('products');
    const navigate = useNavigate();

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/products', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
            });
            const data = await res.json();
            setProducts(data);
        } catch (err) { toast.error("Failed to load products"); }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/orders', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
            });
            const data = await res.json();
            setOrders(data);
        } catch (err) { toast.error("Failed to load orders"); }
    };

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) navigate('/login');
        fetchProducts();
        fetchOrders();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.success("Logged out");
        navigate('/login');
    };

    return (
        <Container fluid className="py-0 bg-light" style={{ minHeight: '100vh' }}>
            <Row className="g-0">
                <Col md={3} lg={2} className="p-0 border-end bg-white shadow-sm" style={{ minHeight: '100vh', position: 'sticky', top: 0 }}>
                    <div className="p-4">
                        <h4 className="fw-bold text-success mb-5">Home Decor Admin</h4>
                        <Nav variant="pills" className="flex-column" activeKey={activeKey} onSelect={(k) => setActiveKey(k)}>
                            <Nav.Link eventKey="products" className="mb-2 text-dark">📦 Inventory</Nav.Link>
                            <Nav.Link eventKey="orders" className="mb-2 text-dark">📋 Orders</Nav.Link>
                            <Nav.Link eventKey="reviews" className="mb-2 text-dark">⭐️ Reviews</Nav.Link>
                            <hr />
                            <Button variant="outline-danger" className="w-100" onClick={handleLogout}>Logout</Button>
                        </Nav>
                    </div>
                </Col>
                <Col md={9} lg={10} className="p-5">
                    {activeKey === 'products' && <ProductManager products={products} fetchProducts={fetchProducts} />}
                    {activeKey === 'orders' && <OrderManager orders={orders} fetchOrders={fetchOrders} />}
                    {activeKey === 'reviews' && <ReviewManager />}
                </Col>
            </Row>
        </Container>
    );
}

export default Admin;