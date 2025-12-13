import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Form, Spinner, Alert } from 'react-bootstrap';
// 1. Import the hook
import { useCart } from './CartContext';

function ProductDetail() {
    const { id } = useParams();
    const { addToCart } = useCart(); // 2. Get the addToCart function

    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // 3. State to track which variant is selected
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [addedMessage, setAddedMessage] = useState(false); // For success message

    useEffect(() => {
        const fetchProduct = fetch(`/api/products/${id}`).then(res => {
            if (!res.ok) throw new Error('Product not found');
            return res.json();
        });

        const fetchVariants = fetch('/api/variants').then(res => res.json());

        Promise.all([fetchProduct, fetchVariants])
            .then(([productData, variantsData]) => {
                setProduct(productData);
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

    // 4. Handle Adding to Cart
    const handleAddToCart = () => {
        // If variants exist but none selected, alert user
        if (variants.length > 0 && !selectedVariant) {
            alert("Please select an option (Color/Size) first!");
            return;
        }

        addToCart(product, selectedVariant);
        
        // Show success message briefly
        setAddedMessage(true);
        setTimeout(() => setAddedMessage(false), 3000);
    };

    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    if (!product) return <Container className="mt-5"><Alert variant="warning">Product not found</Alert></Container>;

    return (
        <Container className="py-5">
            <Link to="/" className="btn btn-outline-secondary mb-4">&larr; Back to Catalog</Link>
            
            {/* Success Message Alert */}
            {addedMessage && (
                <Alert variant="success" className="fixed-top text-center" style={{ top: '10px', left: '20%', right: '20%', zIndex: 9999 }}>
                    ✅ Added to Cart!
                </Alert>
            )}

            <Row>
                <Col md={6} className="mb-4">
                    <div style={{ border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
                        <img 
                            src={`/images/${id}.jpg`} 
                            alt={product.name} 
                            className="img-fluid"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400?text=No+Image"; }}
                            style={{ width: '100%', display: 'block' }}
                        />
                    </div>
                </Col>

                <Col md={6}>
                    <h1 className="display-5 fw-bold">{product.name}</h1>
                    <div className="mb-3">
                        <span className="h2 text-primary me-3">${product.base_price}</span>
                        {product.is_active ? <Badge bg="success">In Stock</Badge> : <Badge bg="danger">Unavailable</Badge>}
                    </div>
                    <p className="lead text-muted">{product.description}</p>

                    <hr className="my-4" />

                    <h4 className="mb-3">Available Options</h4>
                    {variants.length === 0 ? (
                        <Alert variant="info">Standard model only.</Alert>
                    ) : (
                        <div className="mb-4">
                            {variants.map(variant => (
                                <Card 
                                    key={variant.variant_id} 
                                    className={`mb-2 shadow-sm ${selectedVariant?.variant_id === variant.variant_id ? 'border-primary bg-light' : 'border-light'}`}
                                    style={{ cursor: variant.stock_quantity > 0 ? 'pointer' : 'not-allowed', opacity: variant.stock_quantity > 0 ? 1 : 0.6 }}
                                    onClick={() => variant.stock_quantity > 0 && setSelectedVariant(variant)}
                                >
                                    <Card.Body className="d-flex justify-content-between align-items-center py-2">
                                        <div>
                                            <strong>{variant.color} - {variant.size}</strong>
                                        </div>
                                        <div className="text-end">
                                            {variant.price_modifier > 0 && <span className="text-warning fw-bold me-3">+${variant.price_modifier}</span>}
                                            {selectedVariant?.variant_id === variant.variant_id && <Badge bg="primary">Selected</Badge>}
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    )}

                    <div className="d-grid gap-2 mt-4">
                        {/* 5. Button triggers handleAddToCart */}
                        <Button 
                            variant="primary" 
                            size="lg" 
                            disabled={!product.is_active}
                            onClick={handleAddToCart}
                        >
                            {variants.length > 0 && !selectedVariant ? "Select an Option" : "Add to Cart"}
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default ProductDetail;