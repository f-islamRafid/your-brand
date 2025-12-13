import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Form, Spinner, Alert } from 'react-bootstrap';

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = fetch(`/api/products/${id}`).then(res => {
            if (!res.ok) throw new Error('Product not found');
            return res.json();
        });

        const fetchVariants = fetch('/api/variants').then(res => res.json());

        Promise.all([fetchProduct, fetchVariants])
            .then(([productData, variantsData]) => {
                setProduct(productData);
                // Filter variants for this specific product
                const productVariants = variantsData.filter(v => v.product_id === parseInt(id));
                setVariants(productVariants);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    if (!product) return <Container className="mt-5"><Alert variant="warning">Product not found</Alert></Container>;

    return (
        <Container className="py-5">
            <Link to="/" className="btn btn-outline-secondary mb-4">&larr; Back to Catalog</Link>
            
            <Row>
                {/* Left Column: Real Product Image */}
                <Col md={6} className="mb-4">
                    <div style={{ border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                        <img 
                            // Uses the ID from the URL to find the image (e.g., 1.jpg)
                            src={`/images/${id}.jpg`} 
                            alt={product.name} 
                            className="img-fluid"
                            onError={(e) => {
                                // Fallback if image doesn't exist
                                e.target.onerror = null; 
                                e.target.src = "https://placehold.co/600x400?text=No+Image";
                            }}
                            style={{ width: '100%', display: 'block' }}
                        />
                    </div>
                </Col>

                {/* Right Column: Details & Options */}
                <Col md={6}>
                    <h1 className="display-5 fw-bold">{product.name}</h1>
                    <div className="mb-3">
                        <span className="h2 text-primary me-3">${product.base_price}</span>
                        {product.is_active ? 
                            <Badge bg="success">In Stock</Badge> : 
                            <Badge bg="danger">Unavailable</Badge>
                        }
                    </div>
                    
                    <p className="lead text-muted">{product.description}</p>
                    <p><strong>Material:</strong> {product.material}</p>

                    <hr className="my-4" />

                    {/* Variants Section */}
                    <h4 className="mb-3">Available Options</h4>
                    {variants.length === 0 ? (
                        <Alert variant="info">Standard model only. No variants available.</Alert>
                    ) : (
                        <Form>
                            {variants.map(variant => (
                                <Card key={variant.variant_id} className="mb-3 border-light shadow-sm">
                                    <Card.Body className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{variant.color} - {variant.size}</strong>
                                            <div className="text-muted small">SKU: {variant.sku}</div>
                                        </div>
                                        <div className="text-end">
                                            {variant.price_modifier > 0 && 
                                                <div className="text-warning fw-bold">+${variant.price_modifier}</div>
                                            }
                                            <div style={{ fontSize: '0.9rem', color: variant.stock_quantity > 0 ? 'green' : 'red' }}>
                                                {variant.stock_quantity > 0 ? `${variant.stock_quantity} available` : 'Out of Stock'}
                                            </div>
                                        </div>
                                        <Button 
                                            variant={variant.stock_quantity > 0 ? "outline-primary" : "outline-secondary"} 
                                            size="sm" 
                                            className="ms-3"
                                            disabled={variant.stock_quantity === 0}
                                        >
                                            Select
                                        </Button>
                                    </Card.Body>
                                </Card>
                            ))}
                        </Form>
                    )}

                    <div className="d-grid gap-2 mt-4">
                        <Button variant="primary" size="lg" disabled={!product.is_active}>
                            Add to Cart
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default ProductDetail;