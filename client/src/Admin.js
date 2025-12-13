import React, { useState, useEffect } from 'react';
import { Container, Tab, Row, Col, Nav, Card, Form, Table, Button, Alert, Modal, Badge, Spinner } from 'react-bootstrap';
import { toast } from 'react-hot-toast';

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
                    <Card className="border-0 shadow-sm text-white" style={{background: 'linear-gradient(135deg, #4A5D45 0%, #2C3531 100%)'}}>
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
                                                <td>{item.product_name}</td>
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


// --- SUB-COMPONENT: PRODUCT MANAGER ---
function ProductManager({ products, fetchProducts }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', base_price: '', description: '', material: '', is_active: true });

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleShowModal = (product = null) => {
        if (product) {
            setCurrentProduct(product);
            setIsEditing(true);
            setFormData({ 
                name: product.name, 
                base_price: product.base_price, 
                description: product.description, 
                material: product.material, 
                is_active: product.is_active 
            });
        } else {
            setCurrentProduct(null);
            setIsEditing(false);
            setFormData({ name: '', base_price: '', description: '', material: '', is_active: true });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isEditing ? `/api/products/${currentProduct.product_id}` : '/api/products';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(`Product ${isEditing ? 'updated' : 'added'} successfully!`);
                handleCloseModal();
                fetchProducts();
            } else {
                toast.error(`Failed to ${isEditing ? 'update' : 'add'} product.`);
            }
        } catch (err) {
            toast.error("Network Error");
        }
    };

    const handleDelete = async (id) => {
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

    return (
        <div className="animate__animated animate__fadeIn">
            <h3 className="mb-4">Product Inventory</h3>
            <div className="d-flex justify-content-between mb-4">
                <Form.Control
                    type="search"
                    placeholder="🔍 Search..."
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{ width: '300px' }}
                />
                <Button variant="success" onClick={() => handleShowModal(null)}>
                    + Add New Product
                </Button>
            </div>

            <Card className="shadow-sm">
                <Card.Body>
                    <Table hover responsive className="mb-0">
                        <thead>
                            <tr>
                                <th style={{width: '70px'}}>Img</th>
                                <th>Name</th>
                                <th style={{width: '100px'}}>Price</th>
                                <th style={{width: '100px'}}>Status</th>
                                <th style={{width: '120px'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.product_id}>
                                    <td>
                                        <img 
                                            src={`/images/${product.product_id}.jpg`} 
                                            alt={product.name} 
                                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/50x50?text=I"; }}
                                        />
                                    </td>
                                    <td>
                                        <strong className="d-block">{product.name}</strong>
                                        <span className="text-muted small">Material: {product.material}</span>
                                    </td>
                                    <td>৳{product.base_price}</td>
                                    <td>
                                        <Badge bg={product.is_active ? 'success' : 'secondary'}>
                                            {product.is_active ? 'ACTIVE' : 'HIDDEN'}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleShowModal(product)}>Edit</Button>
                                        <Button size="sm" variant="outline-danger" onClick={() => handleDelete(product.product_id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted">No products match your search.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Product Add/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? `Edit Product: ${currentProduct.name}` : 'Add New Product'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Product Name</Form.Label>
                            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Base Price (৳)</Form.Label>
                            <Form.Control type="number" name="base_price" value={formData.base_price} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Material</Form.Label>
                            <Form.Control type="text" name="material" value={formData.material} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} />
                        </Form.Group>
                        {isEditing && (
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    label="Active in Store (Uncheck to hide/archive)"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        )}
                        <Button variant="primary" type="submit" className="w-100">
                            {isEditing ? 'Save Changes' : 'Add Product'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

// --- MAIN ADMIN COMPONENT ---
function Admin({ fetchProducts }) {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loginInfo, setLoginInfo] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState('');

    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    // Fetch Admin Products (includes inactive/archived)
    const fetchAdminProducts = async () => {
        try {
            const res = await fetch('/api/admin/products');
            const data = await res.json();
            setProducts(data);
            // Also call the main fetchProducts to refresh the shop view if needed
            fetchProducts();
        } catch (err) {
            console.error("Failed to fetch admin products:", err);
        }
    };
    
    // Fetch Orders
    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
        }
    };


    useEffect(() => {
        if (isAdmin) {
            Promise.all([fetchAdminProducts(), fetchOrders()]).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [isAdmin]);

    const handleLoginChange = (e) => {
        setLoginInfo({ ...loginInfo, [e.target.name]: e.target.value });
    };

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        // Mock Login: Use a simple hardcoded admin/admin for testing
        if (loginInfo.username === 'admin' && loginInfo.password === 'admin') {
            localStorage.setItem('isAdmin', 'true');
            setLoginError('');
            // Reload the component state
            window.location.reload(); 
        } else {
            setLoginError('Invalid credentials. Use admin/admin');
        }
    };
    
    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        window.location.reload(); 
    };

    if (loading) {
        return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
    }

    if (!isAdmin) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={6} lg={4}>
                        <Card className="shadow-lg">
                            <Card.Header className="bg-dark text-white text-center">
                                <h4 className="mb-0">Admin Login</h4>
                            </Card.Header>
                            <Card.Body>
                                <Form onSubmit={handleLoginSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Username</Form.Label>
                                        <Form.Control type="text" name="username" value={loginInfo.username} onChange={handleLoginChange} required />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control type="password" name="password" value={loginInfo.password} onChange={handleLoginChange} required />
                                    </Form.Group>
                                    {loginError && <Alert variant="danger" className="py-2">{loginError}</Alert>}
                                    <Button variant="success" type="submit" className="w-100 mt-2">
                                        Log In
                                    </Button>
                                    <p className="text-center text-muted small mt-2">Hint: admin / admin</p>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    // Admin Dashboard View
    return (
        <Container fluid className="py-4">
            <Row>
                <Col md={2}>
                    <Card className="shadow-sm p-3 bg-white">
                        <h4 className="mb-4 text-center">Admin Panel</h4>
                        <Nav variant="pills" className="flex-column">
                            <Nav.Item>
                                <Nav.Link eventKey="products" className="mb-2 active-link" style={{ backgroundColor: '#0d6efd', color: 'white' }}>
                                    📦 Products
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="orders" className="mb-2 active-link">
                                    🛒 Orders
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link onClick={handleLogout} className="text-danger">
                                    🔑 Logout
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                        <hr/>
                        <Nav.Link href="/">← Back to Shop</Nav.Link>
                    </Card>
                </Col>
                <Col md={10}>
                    <Tab.Content>
                        <Tab.Pane eventKey="products" className="fade show active">
                            <ProductManager products={products} fetchProducts={fetchAdminProducts} />
                        </Tab.Pane>
                        <Tab.Pane eventKey="orders">
                            <OrderManager orders={orders} fetchOrders={fetchOrders} />
                        </Tab.Pane>
                    </Tab.Content>
                </Col>
            </Row>
        </Container>
    );
}

export default Admin;