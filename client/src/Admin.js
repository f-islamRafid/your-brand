import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Alert, Badge, Nav, Modal } from 'react-bootstrap';
import toast from 'react-hot-toast'; // We use toasts for professional feedback

function Admin() {
    const [view, setView] = useState('products');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    
    // Add Product Form State
    const [formData, setFormData] = useState({ name: '', description: '', base_price: '', material: '' });
    const [file, setFile] = useState(null);
    
    // --- NEW: Edit Modal State ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({ product_id: '', name: '', description: '', base_price: '', material: '', is_active: true });

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

    // --- ADD HANDLERS ---
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
                toast.success('Product Added!');
                setFormData({ name: '', description: '', base_price: '', material: '' });
                setFile(null);
                fetchProducts();
            } else {
                toast.error('Failed to add product.');
            }
        } catch (err) { toast.error('Network Error'); }
    };

    // --- NEW: DELETE HANDLER ---
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            try {
                const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    toast.success("Product Deleted");
                    fetchProducts();
                } else {
                    const err = await res.json();
                    toast.error(err.error || "Failed to delete");
                }
            } catch (err) {
                toast.error("Error deleting product");
            }
        }
    };

    // --- NEW: EDIT HANDLERS ---
    const openEditModal = (product) => {
        setEditData(product); // Fill the modal with this product's data
        setShowEditModal(true);
    };

    const handleEditChange = (e) => {
        // Handle checkbox vs text input
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

    return (
        <Container className="py-5 animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Admin Dashboard</h2>
                <Nav variant="pills" activeKey={view} onSelect={(k) => setView(k)}>
                    <Nav.Item><Nav.Link eventKey="products">Products</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link eventKey="orders">Orders</Nav.Link></Nav.Item>
                </Nav>
            </div>
            
            {view === 'products' ? (
                <Row>
                    {/* Add Form (Left) */}
                    <Col md={4} className="mb-4">
                        <div className="p-4 border rounded bg-white shadow-sm sticky-top" style={{top: '100px'}}>
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
                    
                    {/* Product List (Right) */}
                    <Col md={8}>
                        <Table hover responsive className="bg-white shadow-sm rounded align-middle">
                            <thead className="bg-light"><tr><th>Img</th><th>Name</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.product_id}>
                                        <td>
                                            <img src={`/images/${p.product_id}.jpg`} alt="" width="40" height="40" style={{objectFit:'cover', borderRadius:'4px'}} 
                                            onError={(e)=>{e.target.onerror=null;e.target.src="https://placehold.co/40"}}/>
                                        </td>
                                        <td>{p.name}</td>
                                        <td>${p.base_price}</td>
                                        <td>
                                            <Badge bg={p.is_active ? 'success' : 'secondary'}>
                                                {p.is_active ? 'Active' : 'Hidden'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => openEditModal(p)}>
                                                ✏️ Edit
                                            </Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(p.product_id)}>
                                                🗑️
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            ) : (
                /* Orders View */
                <Row>
                    <Col>
                        {orders.length === 0 ? <Alert variant="info">No orders yet.</Alert> : 
                        orders.map(order => (
                            <div key={order.order_id} className="card mb-3 shadow-sm border-0">
                                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                    <div><strong>Order #{order.order_id}</strong> <span className="text-muted ms-2">{order.customer_name}</span></div>
                                    <Badge bg="success">${order.total_amount}</Badge>
                                </div>
                                <div className="card-body">
                                    {/* Order details... keeping brief for space */}
                                    <span className="small text-muted">{new Date(order.created_at).toLocaleString()}</span>
                                    <hr/>
                                    {order.items && order.items.map((item, idx) => (
                                        <div key={idx} className="d-flex justify-content-between small">
                                            <span>{item.quantity}x {item.name}</span>
                                            <span>${item.price_at_purchase}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </Col>
                </Row>
            )}

            {/* --- NEW: EDIT MODAL --- */}
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
                            <Form.Label>Price</Form.Label>
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
                                id="active-switch"
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

        </Container>
    );
}

export default Admin;