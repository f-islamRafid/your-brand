import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Form, Spinner, Alert } from 'react-bootstrap';
import { useCart } from './CartContext';
import toast from 'react-hot-toast'; // Import Toast Library

function ProductDetail() {
    const { id } = useParams();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);

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

    const handleAddToCart = () => {
        if (variants.length > 0 && !selectedVariant) {
            toast.error("Please select an option (Color/Size) first!");
            return;
        }

        addToCart(product, selectedVariant);
        // This is the new sleek notification:
        toast.success(`${product.name} added to cart!`, {
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            },
        }); 
    };

    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    if (!product) return <Container className="mt-5"><Alert variant="warning">Product not found</Alert></Container>;

    return (
        <Container className="py-5 animate__animated animate__fadeIn">
            <Link to="/" className="btn btn-link text-muted mb-4 text-decoration-none">&larr; Back to Catalog</Link>
            
            <Row>
                <Col md={6} className="mb-4">
                    <div style={{ border: 'none', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.08)' }}>
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
                    <h1 className="display-5 fw-bold mb-2">{product.name}</h1>
                    <div className="mb-4 d-flex align-items-center">
                        <span className="h2 text-primary me-3 mb-0">${product.base_price}</span>
                        {product.is_active ? 
                            <Badge bg="success" className="px-3 py-2">In Stock</Badge> : 
                            <Badge bg="danger" className="px-3 py-2">Unavailable</Badge>
                        }
                    </div>
                    
                    <p className="lead text-muted mb-4" style={{fontSize: '1.1rem'}}>{product.description}</p>
                    
                    <div className="p-3 bg-light rounded mb-4">
                        <strong>Material:</strong> {product.material}
                    </div>

                    <hr className="my-4" style={{opacity: 0.1}} />

                    <h5 className="mb-3">Select Options</h5>
                    {variants.length === 0 ? (
                        <div className="text-muted fst-italic mb-3">Standard model only.</div>
                    ) : (
                        <div className="mb-4">
                            {variants.map(variant => (
                                <Card 
                                    key={variant.variant_id} 
                                    className={`mb-2 shadow-sm ${selectedVariant?.variant_id === variant.variant_id ? 'border-primary bg-white ring-2' : 'border-0 bg-light'}`}
                                    style={{ cursor: variant.stock_quantity > 0 ? 'pointer' : 'not-allowed', opacity: variant.stock_quantity > 0 ? 1 : 0.6, transition: 'all 0.2s' }}
                                    onClick={() => variant.stock_quantity > 0 && setSelectedVariant(variant)}
                                >
                                    <Card.Body className="d-flex justify-content-between align-items-center py-3">
                                        <div>
                                            <strong className="d-block">{variant.color} - {variant.size}</strong>
                                            <span className="text-muted small">SKU: {variant.sku}</span>
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

                    <div className="d-grid gap-2 mt-5">
                        <Button 
                            variant="primary" 
                            size="lg" 
                            disabled={!product.is_active}
                            onClick={handleAddToCart}
                            style={{padding: '15px'}}
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