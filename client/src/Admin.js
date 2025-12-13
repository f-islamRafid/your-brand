import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Alert, Badge, Nav, Tab, Card, InputGroup } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap'; // Needed for Edit Modal

// --- SUB-COMPONENT: PRODUCT MANAGER ---
function ProductManager({ products, fetchProducts }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', base_price: '', material: '' });
    const [file, setFile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    // Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({ product_id: '', name: '', description: '', base_price: '', material: '', is_active: true });


    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.product_id.toString().includes(searchTerm)
    );

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFile(e.target.files[0]);

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
            } else { toast.error("Operation Failed"); }
        } catch (err) { toast.error("Network Error"); }
    };

   // Inside client/src/Admin.js -> ProductManager component

    const handleDelete = async (id) => {
        // Updated confirmation text to be accurate
        if (window.confirm("Delete this product? (If it has orders, it will be Archived instead)")) {
            try {
                const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
                const data = await res.json(); // Get the message from server

                if (res.ok) {
                    // Success! Show the specific message (Deleted vs Archived)
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

    // EDIT LOGIC (From previous steps, integrated here for completeness)
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
            } else { toast.error("Failed to update"); }
        } catch (err) { toast.error("Update error"); }
    };

    return (
        <div className="animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0">Inventory</h3>
                <Button variant={showForm ? "secondary" : "primary"} onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel" : "+ Add New Product"}
                </Button>
            </div>

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

            <InputGroup className="mb-3 shadow-sm">
                <InputGroup.Text className="bg-white border-0">🔍</InputGroup.Text>
                <Form.Control placeholder="Search..." className="border-0" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </InputGroup>

            <Card className="border-0 shadow-sm">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light"><tr><th>Img</th><th>Name</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {filteredProducts.map(p => (
                            <tr key={p.product_id}>
                                <td><img src={`/images/${p.product_id}.jpg`} alt="" width="40" height="40" className="rounded" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/40" }} /></td>
                                <td className="fw-bold">{p.name}</td>
                                <td>৳{p.base_price}</td>
                                <td><Badge bg={p.is_active ? 'success' : 'secondary'}>{p.is_active ? 'Active' : 'Hidden'}</Badge></td>
                                <td>
                                    <Button variant="link" className="text-decoration-none p-0 me-3" onClick={() => openEditModal(p)}>Edit</Button>
                                    <Button variant="link" className="text-danger text-decoration-none p-0" onClick={() => handleDelete(p.product_id)}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>

            {/* EDIT MODAL */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton><Modal.Title>Edit Product</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3"><Form.Label>Name</Form.Label><Form.Control type="text" name="name" value={editData.name} onChange={handleEditChange} /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Price (৳)</Form.Label><Form.Control type="number" name="base_price" value={editData.base_price} onChange={handleEditChange} /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Material</Form.Label><Form.Control type="text" name="material" value={editData.material} onChange={handleEditChange} /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={3} name="description" value={editData.description} onChange={handleEditChange} /></Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check type="switch" label="Product Active" name="is_active" checked={editData.is_active} onChange={handleEditChange} />
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
function OrderManager({ orders, fetchOrders }) { // Added fetchOrders prop to refresh data
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0).toFixed(2);
    const totalOrders = orders.length;

    // Handle Status Change
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                toast.success(`Order #${orderId} marked as ${newStatus}`);
                fetchOrders(); // Refresh the list to show new color
            } else {
                toast.error("Failed to update status");
            }
        } catch (err) {
            toast.error("Network Error");
        }
    };

    // Helper for Badge Color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'success'; // Green
            case 'Shipped': return 'info';    // Blue
            case 'Cancelled': return 'danger'; // Red
            default: return 'warning';        // Yellow (Pending)
        }
    };

    return (
        <div className="animate__animated animate__fadeIn">
            <h3 className="mb-4">Order Management</h3>
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #4A5D45 0%, #2C3531 100%)' }}>
                        <Card.Body>
                            <h6>Total Revenue</h6>
                            <h3>৳{totalRevenue}</h3>
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
                                    {order.customer_name}
                                </div>
                                <div className="d-flex align-items-center">
                                    <strong className="fs-5 me-3">৳{order.total_amount}</strong>

                                    {/* STATUS DROPDOWN */}
                                    <Form.Select
                                        size="sm"
                                        value={order.status || 'Pending'}
                                        onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                                        style={{
                                            width: '130px',
                                            fontWeight: 'bold',
                                            borderColor: 'transparent',
                                            backgroundColor: `var(--bs-${getStatusColor(order.status || 'Pending')})`,
                                            color: order.status === 'Pending' ? 'black' : 'white'
                                        }}
                                    >
                                        <option value="Pending">🕒 Pending</option>
                                        <option value="Shipped">🚚 Shipped</option>
                                        <option value="Completed">✅ Completed</option>
                                        <option value="Cancelled">❌ Cancelled</option>
                                    </Form.Select>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <p className="small text-muted mb-3"><strong>Ship To:</strong> {order.shipping_address}</p>
                                <Table size="sm" borderless className="mb-0">
                                    <thead className="text-muted small border-bottom"><tr><th>Item</th><th>Qty</th><th className="text-end">Price</th></tr></thead>
                                    <tbody>
                                        {order.items && order.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.name}</td>
                                                <td>x{item.quantity}</td>
                                                <td className="text-end">৳{item.price_at_purchase}</td>
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
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
        fetchOrders();
    }, []);

    const fetchProducts = () => fetch('/api/products').then(res => res.json()).then(setProducts);
    const fetchOrders = () => fetch('/api/orders').then(res => res.json()).then(setOrders);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        toast.success("Logged out successfully");
        navigate('/login');
    };

    return (
        <Container fluid className="py-4 bg-light" style={{ minHeight: '100vh' }}>
            <Tab.Container id="admin-tabs" defaultActiveKey="products">
                <Row>
                    <Col md={3} lg={2} className="mb-4">
                        <Card className="border-0 shadow-sm sticky-top" style={{ top: '100px' }}>
                            <Card.Body className="p-2">
                                <div className="text-center py-3 border-bottom mb-2">
                                    <h5 className="fw-bold text-success">Admin Panel</h5>
                                </div>
                                <Nav variant="pills" className="flex-column">
                                    <Nav.Item><Nav.Link eventKey="products" className="mb-1 fw-bold text-dark">📦 Products</Nav.Link></Nav.Item>
                                    <Nav.Item><Nav.Link eventKey="orders" className="mb-1 fw-bold text-dark">📋 Orders</Nav.Link></Nav.Item>
                                    <hr className="my-3" />
                                    <Nav.Item><Button variant="outline-danger" size="sm" className="w-100 text-start" onClick={handleLogout}>🔒 Logout</Button></Nav.Item>
                                    <Nav.Item><Nav.Link href="/" className="mt-2 text-muted small">&larr; Back to Shop</Nav.Link></Nav.Item>
                                </Nav>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={9} lg={10}>
                        <Tab.Content>
                            <Tab.Pane eventKey="products"><ProductManager products={products} fetchProducts={fetchProducts} /></Tab.Pane>
                            <Tab.Pane eventKey="orders">
                                <OrderManager orders={orders} fetchOrders={fetchOrders} />
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
        </Container>
    );
}

export default Admin;