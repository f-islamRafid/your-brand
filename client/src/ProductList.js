import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Import Bootstrap components
import { Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/products')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(e => {
                console.error("Error fetching products:", e);
                setError(e.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger">Error loading catalog: {error}</Alert>;
    }

    return (
        <div>
            <h2 className="mb-4">Featured Products</h2>
            {/* Bootstrap Grid Layout */}
            <Row xs={1} md={2} lg={3} className="g-4">
                {products.map(product => (
                    <Col key={product.product_id}>
                        <Card className="h-100 shadow-sm">
                            
                            {/* --- NEW: Image Logic Starts Here --- */}
                            <div style={{ height: '200px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Card.Img 
                                    variant="top" 
                                    // This looks for 1.jpg, 2.jpg based on the product ID
                                    src={`/images/${product.product_id}.jpg`} 
                                    alt={product.name}
                                    onError={(e) => {
                                        // If the specific image isn't found, show this placeholder
                                        e.target.onerror = null; 
                                        e.target.src = "https://placehold.co/600x400?text=No+Image";
                                    }}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            {/* --- Image Logic Ends Here --- */}

                            <Card.Body className="d-flex flex-column">
                                <Card.Title>{product.name}</Card.Title>
                                <Card.Text className="text-muted" style={{ flexGrow: 1 }}>
                                    {product.description.substring(0, 80)}...
                                </Card.Text>
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <span className="h5 mb-0 text-primary">${product.base_price}</span>
                                    <Button as={Link} to={`/product/${product.product_id}`} variant="outline-dark">
                                        View Details
                                    </Button>
                                </div>
                            </Card.Body>
                            {!product.is_active && (
                                <Card.Footer className="bg-danger text-white text-center py-1" style={{fontSize: '0.8rem'}}>
                                    Currently Unavailable
                                </Card.Footer>
                            )}
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

export default ProductList;