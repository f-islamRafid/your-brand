import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Card, Spinner, Badge, Form, Dropdown } from 'react-bootstrap';
import { FaPlus, FaFilter, FaEllipsisV, FaPencilAlt, FaTrash } from 'react-icons/fa';
import ProductModal from './ProductModal'; 
import toast from 'react-hot-toast';
 // Assuming you have a modal for Add/Edit

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // NEW: Filter state

    // Function to fetch products
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/products');
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            } else {
                toast.error("Failed to fetch products.");
            }
        } catch (err) {
            toast.error("Network error during fetch.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Handle Delete/Archive
    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product? If it has order history, it will be archived instead.")) {
            return;
        }

        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                const result = await res.json();
                toast.success(result.message);
                fetchProducts(); // Refresh list
            } else {
                toast.error("Deletion failed.");
            }
        } catch (err) {
            toast.error("Network error during deletion.");
        }
    };

    // Handle Edit
    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowModal(true);
    };

    // Handle New Product
    const handleAdd = () => {
        setEditingProduct(null);
        setShowModal(true);
    };

    // Filtered and Searched List
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              product.product_id.toString().includes(searchTerm);
        
        const matchesStatus = statusFilter === 'ALL' || 
                              (statusFilter === 'ACTIVE' && product.is_active) || 
                              (statusFilter === 'HIDDEN' && !product.is_active);

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4 fw-bold">Inventory Management</h2>
            
            <Card className="shadow-sm mb-4 border-0">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        {/* Search Bar */}
                        <Form.Group className="flex-grow-1 me-3">
                            <Form.Control
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Form.Group>
                        
                        {/* Filter Dropdown */}
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-dark" id="dropdown-basic" className="d-flex align-items-center me-3">
                                <FaFilter className="me-2" />
                                {statusFilter === 'ALL' ? 'All Statuses' : statusFilter === 'ACTIVE' ? 'Active' : 'Hidden'}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => setStatusFilter('ALL')}>All Statuses</Dropdown.Item>
                                <Dropdown.Item onClick={() => setStatusFilter('ACTIVE')}>Active</Dropdown.Item>
                                <Dropdown.Item onClick={() => setStatusFilter('HIDDEN')}>Hidden</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        {/* Add Button */}
                        <Button variant="success" onClick={handleAdd} className="d-flex align-items-center">
                            <FaPlus className="me-2" /> Add New Product
                        </Button>
                    </div>

                    {/* Product Table */}
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th style={{ width: '80px' }}>Img</th>
                                <th>Name (ID)</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th style={{ width: '100px' }}>Actions</th>
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
                                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/50x50"; }}
                                        />
                                    </td>
                                    <td>
                                        <span className="fw-bold">{product.name}</span>
                                        <small className="text-muted d-block">ID: {product.product_id}</small>
                                    </td>
                                    <td>৳{parseFloat(product.base_price).toLocaleString()}</td>
                                    <td>
                                        <Badge bg={product.is_active ? 'success' : 'secondary'} className="py-2 px-3">
                                            {product.is_active ? 'ACTIVE' : 'HIDDEN'}
                                        </Badge>
                                    </td>
                                    <td>
                                        {/* Action Dropdown Menu */}
                                        <Dropdown align="end">
                                            <Dropdown.Toggle variant="light" size="sm" id={`dropdown-actions-${product.product_id}`}>
                                                <FaEllipsisV />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => handleEdit(product)}>
                                                    <FaPencilAlt className="me-2" /> Edit
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleDelete(product.product_id)} className="text-danger">
                                                    <FaTrash className="me-2" /> Delete
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {filteredProducts.length === 0 && (
                        <p className="text-center text-muted mt-3 mb-0">No products found matching your criteria.</p>
                    )}
                </Card.Body>
            </Card>

            {/* Product Modal for Editing/Adding */}
            {showModal && (
                <ProductModal 
                    show={showModal} 
                    handleClose={() => setShowModal(false)} 
                    product={editingProduct} 
                    onSuccess={fetchProducts} 
                />
            )}
        </Container>
    );
}

export default Products;