import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Alert, Badge, Nav, Tab, Card, InputGroup, Modal } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ReviewManager from './ReviewManager';

// --- SUB-COMPONENT: PRODUCT MANAGER (UPDATED FOR BETTER UI/UX) ---
function ProductManager({ products, fetchProducts }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [statusFilter, setStatusFilter] = useState('ALL'); // NEW: Filter State

    // Form State (for ADD)
    const [formData, setFormData] = useState({ name: '', description: '', base_price: '', material: '' });
    const [file, setFile] = useState(null);

    // Edit State (for EDIT Modal)
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({ product_id: '', name: '', description: '', base_price: '', material: '', is_active: true });

    // Filter Logic (UPDATED)
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.product_id.toString().includes(searchTerm);

        const matchesStatus = statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' && p.is_active) ||
            (statusFilter === 'HIDDEN' && !p.is_active);

        return matchesSearch && matchesStatus;
    });

    // --- HANDLERS (Keep the existing handlers: handleChange, handleFileChange, handleSubmit, handleDelete, etc.) ---
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFile(e.target.files[0]);

    // CREATE Product
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (file) data.append('image', file);

        try {
            const res = await fetch('/api/products', { method: 'POST', body: data });
            if (res.ok) {
                toast.success("Product Created!");
                setFormData({ name: '', description: '', base_price: '', material: '' });
                setFile(null);
                setShowForm(false);
                fetchProducts();
            } else {
                toast.error("Operation Failed");
            }
        } catch (err) { toast.error("Network Error"); }
    };

    // SMART DELETE Product (Keep as is)
    const handleDelete = async (id) => {
        if (window.confirm("Delete this product? (If it has orders, it will be Archived instead)")) {
            try {
                const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
                const data = await res.json();

                if (res.ok) {
                    toast.success(data.message);
                    fetchProducts();
                } else {
                    toast.error(data.error || "Failed to delete");
                }
            } catch (err) {
                toast.error("Network Error");
            }
        }
    };

    // EDIT Handlers (Keep as is)
    const openEditModal = (product) => {
        setEditData(product);
        setShowEditModal(true);
    };
    const handleEditChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setEditData({ ...editData, [e.target.name]: value });
    };
    const handleSaveEdit = async () => {
        try {
            const res = await fetch(`/api/products/${editData.product_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData)
            });

            if (res.ok) {
                toast.success("Product Updated!");
                setShowEditModal(false);
                fetchProducts();
            } else {
                toast.error("Failed to update");
            }
        } catch (err) {
            toast.error("Update error");
        }
    };
    // --- END HANDLERS ---

    // --- RENDER FUNCTION (UPDATED UI) ---
    return (
        <div className="animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0">Inventory</h3>
                <Button variant={showForm ? "secondary" : "success"} onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel Add" : "+ Add New Product"}
                </Button>
            </div>

            {/* ADD FORM (Keep as is) */}
            {showForm && (
                <Card className="mb-4 shadow-sm border-0 bg-light">
                    <Card.Body>
                        <h5 className="mb-3">New Product Details</h5>
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

            {/* SEARCH & FILTER BAR (NEW/UPDATED) */}
            <Card className="mb-4 shadow-sm border-0 p-3">
                <Row className="g-2">
                    <Col md={9}>
                        <InputGroup>
                            <InputGroup.Text className="bg-white border-end-0">🔍</InputGroup.Text>
                            <Form.Control
                                placeholder="Search by name or ID..."
                                className="border-start-0"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
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


            {/* PRODUCT TABLE (UPDATED UI) */}
            <Card className="border-0 shadow-sm">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light"><tr><th>Img</th><th>Name (ID)</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {filteredProducts.map(p => (
                            <tr key={p.product_id}>
                                <td>
                                    <img
                                        src={`/images/${p.product_id}.jpg`}
                                        alt="mini"
                                        width="40"
                                        height="40"
                                        className="rounded"
                                        style={{ objectFit: 'cover' }}
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/40" }}
                                    />
                                </td>
                                <td>
                                    <span className="fw-bold">{p.name}</span>
                                    <small className="text-muted d-block">ID: {p.product_id}</small>
                                </td>
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
                {filteredProducts.length === 0 && (
                    <p className="text-center text-muted p-4 mb-0">No products found.</p>
                )}
            </Card>

            {/* EDIT MODAL (Keep as is) */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Product</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" name="name" value={editData.name} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Price (৳)</Form.Label>
                            <Form.Control type="number" name="base_price" value={editData.base_price} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Material</Form.Label>
                            <Form.Control type="text" name="material" value={editData.material} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={3} name="description" value={editData.description} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="switch"
                                label="Product Active (Visible in Store)"
                                name="is_active"
                                checked={editData.is_active}
                                onChange={handleEditChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSaveEdit}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
// --- SUB-COMPONENT: ORDER MANAGER ---
// --- SUB-COMPONENT: ORDER MANAGER (UPDATED UI) ---
function OrderManager({ orders, fetchOrders }) {
    // ... (Keep state and handlers the same)
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0).toFixed(2);
    const totalOrders = orders.length;

    // Handle Status Change (Keep as is)
    const handleStatusChange = async (orderId, newStatus) => {
        // ... (API call logic)
    };

    // Helper for Badge Color (Keep as is)
    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'success';
            case 'Shipped': return 'info';
            case 'Cancelled': return 'danger';
            default: return 'warning';
        }
    };

    // Helper to get text color for select
    const getTextColor = (status) => status === 'Pending' ? 'black' : 'white';


    return (
        <div className="animate__animated animate__fadeIn">
            <h2 className="mb-5 fw-bold">Order Management</h2>

            {/* STATS CARDS (UPDATED STYLING) */}
            <Row className="mb-5 g-4">
                <Col md={6} lg={4}>
                    <Card className="border-0 shadow-lg bg-success text-white">
                        <Card.Body className="d-flex justify-content-between align-items-center">
                            <div>
                                <p className="mb-1 fw-light">Total Revenue</p>
                                <h3 className="fw-bold">৳{parseFloat(totalRevenue).toLocaleString()}</h3>
                            </div>
                            <span style={{ fontSize: '2rem' }}>💰</span>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} lg={4}>
                    <Card className="border-0 shadow-lg bg-white">
                        <Card.Body className="d-flex justify-content-between align-items-center">
                            <div>
                                <p className="mb-1 text-muted">Total Orders</p>
                                <h3 className="fw-bold text-dark">{totalOrders}</h3>
                            </div>
                            <span style={{ fontSize: '2rem' }}>📦</span>
                        </Card.Body>
                    </Card>
                </Col>
                
            </Row>

            {/* ORDER LIST (UPDATED STYLING) */}
            {orders.length === 0 ? <Alert variant="info" className="shadow-sm">No orders received yet.</Alert> : (
                <div className="d-grid gap-3">
                    {orders.map(order => (
                        <Card key={order.order_id} className="border-0 shadow-sm transition-shadow" style={{ transition: 'box-shadow 0.3s' }}>
                            <Card.Header className="bg-light d-flex justify-content-between align-items-center py-3">
                                <div>
                                    <strong className="text-dark">Order #{order.order_id}</strong>
                                    <span className="text-muted mx-2 small">|</span>
                                    <span className="text-primary fw-bold">{order.customer_name}</span>
                                </div>
                                <div className="d-flex align-items-center">
                                    <strong className="fs-5 me-3">৳{parseFloat(order.total_amount).toLocaleString()}</strong>

                                    {/* STATUS DROPDOWN (UPDATED STYLING) */}
                                    <Form.Select
                                        size="sm"
                                        value={order.status || 'Pending'}
                                        onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                                        className={`bg-${getStatusColor(order.status || 'Pending')} text-${getTextColor(order.status)} border-0 fw-bold`}
                                        style={{ width: '150px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                                    >
                                        <option value="Pending" className="bg-white text-dark">🕒 Pending</option>
                                        <option value="Shipped" className="bg-white text-dark">🚚 Shipped</option>
                                        <option value="Completed" className="bg-white text-dark">✅ Completed</option>
                                        <option value="Cancelled" className="bg-white text-dark">❌ Cancelled</option>
                                    </Form.Select>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <p className="small mb-1 text-muted">Shipping Details:</p>
                                        <p className="fw-bold mb-0">{order.shipping_address}</p>
                                        <p className="small text-muted">{order.email}</p>
                                    </Col>
                                    <Col md={6}>
                                        <Table size="sm" borderless className="mb-0">
                                            <thead className="text-muted small border-bottom"><tr><th>Item</th><th>Qty</th><th className="text-end">Price</th></tr></thead>
                                            <tbody>
                                                {order.items && order.items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td>{item.name || item.product_name}</td>
                                                        <td>x{item.quantity}</td>
                                                        <td className="text-end">৳{item.price_at_purchase}</td>
                                                    </tr>
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
// --- MAIN ADMIN LAYOUT (UPDATED UI) ---
function Admin() {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();
    const [activeKey, setActiveKey] = useState('products'); // Control active tab state

    useEffect(() => {
        // Fetch logic now depends on the active tab, or we fetch all on load
        fetchProducts();
        fetchOrders();
    }, []);

    // Fetch Logic
    const fetchProducts = () => fetch('/api/admin/products').then(res => res.json()).then(setProducts).catch(() => toast.error("Failed to load products"));
    const fetchOrders = () => fetch('/api/orders').then(res => res.json()).then(setOrders).catch(() => toast.error("Failed to load orders"));

    // Logout Logic
    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        toast.success("Logged out successfully");
        navigate('/login');
    };

    return (
        <Container fluid className="py-0 bg-light" style={{ minHeight: '100vh' }}>
            <Row className="g-0"> {/* Use g-0 to remove default gutter padding */}
                {/* LEFT SIDEBAR (STICKY, MODERN DESIGN) */}
                <Col md={3} lg={2} className="p-0 border-end bg-white shadow-sm" style={{ minHeight: '100vh', position: 'sticky', top: 0 }}>
                    <div className="p-4">
                        <h4 className="fw-bold text-success mb-5 border-bottom pb-2">Home Decor Admin</h4>
                        <Nav variant="pills" className="flex-column" activeKey={activeKey} onSelect={(k) => setActiveKey(k)}>
                            <Nav.Item>
                                <Nav.Link eventKey="products" className="mb-2 fw-normal d-flex align-items-center text-dark" style={{ borderRadius: '8px', padding: '10px 15px' }}>
                                    <span className="me-3">📦</span> Inventory
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="orders" className="mb-2 fw-normal d-flex align-items-center text-dark" style={{ borderRadius: '8px', padding: '10px 15px' }}>
                                    <span className="me-3">📋</span> Orders
                                </Nav.Link>
                            </Nav.Item>

                            {/* NEW: Reviews Tab */}
                            <Nav.Item>
                                <Nav.Link eventKey="reviews" className="mb-2 fw-normal d-flex align-items-center text-dark" style={{ borderRadius: '8px', padding: '10px 15px' }}>
                                    <span className="me-3">⭐️</span> Reviews
                                </Nav.Link>
                            </Nav.Item>

                            <hr className="my-4" />

                            <hr className="my-4" />

                            <Nav.Item>
                                <Button variant="outline-danger" size="sm" className="w-100 text-start d-flex align-items-center justify-content-center" onClick={handleLogout} style={{ borderRadius: '8px', padding: '10px 15px' }}>
                                    <span className="me-2">🔒</span> Logout
                                </Button>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link href="/" className="mt-3 text-muted small text-center">&larr; Back to Shop</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </div>
                </Col>

                <Col md={9} lg={10} className="p-5">
                    {/* Use a simple switch based on state instead of Tab.Content for cleaner rendering */}
                    {activeKey === 'products' && <ProductManager products={products} fetchProducts={fetchProducts} />}
                    {activeKey === 'orders' && <OrderManager orders={orders} fetchOrders={fetchOrders} />}
                    {/* NEW: Reviews Content */}
                    {activeKey === 'reviews' && <ReviewManager />}
                </Col>
            </Row>
        </Container>
    );
}

export default Admin;