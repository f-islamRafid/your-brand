import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useCart } from './CartContext';
import toast from 'react-hot-toast'; 

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
        toast.success(`${product.name} added to cart!`, {
            style: { borderRadius: '10px', background: '#333', color: '#fff' },
        }); 
    };

    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    if (!product) return <Container className="mt-5"><Alert variant="warning">Product not found</Alert></Container>;

    return (
        <Container className="py-5 animate__animated animate__fadeIn">
            <Link to="/" className="btn btn-link text-muted mb-4 text-decoration-none fw-bold" style={{ letterSpacing: '1px' }}>
                &larr; Back to Catalog
            </Link>
            
            <Row className="gx-5"> {/* Increased gutter for more spacing */}
                {/* --- COLUMN 1: IMAGE --- */}
                <Col md={6} className="mb-4">
                    <div className="product-image-container" style={{ 
                        border: 'none', 
                        borderRadius: '16px', // Slightly larger border radius
                        overflow: 'hidden', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)', // Deeper shadow
                        backgroundColor: '#f8f9fa' // Light background for contrast
                    }}>
                        <img 
                            src={`/images/${id}.jpg`} 
                            alt={product.name} 
                            className="img-fluid"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x600?text=No+Image"; }}
                            style={{ 
                                width: '100%', 
                                display: 'block',
                                objectFit: 'cover',
                                transition: 'transform 0.5s ease',
                            }}
                        />
                    </div>
                </Col>

                {/* --- COLUMN 2: DETAILS & ADD TO CART --- */}
                <Col md={6}>
                    {/* PRODUCT HEADERS */}
                    <div className="product-header mb-4">
                        <h1 className="display-5 fw-bolder mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                            {product.name}
                        </h1>
                        <div className="d-flex align-items-center mb-3">
                            <span className="h1 text-dark me-3 mb-0 fw-bold" style={{ letterSpacing: '-0.5px' }}>
                                ৳{product.base_price}
                            </span>
                            {product.is_active ? 
                                <Badge bg="success" className="px-3 py-2 fs-6 rounded-pill">In Stock</Badge> : 
                                <Badge bg="danger" className="px-3 py-2 fs-6 rounded-pill">Unavailable</Badge>
                            }
                        </div>
                    </div>
                    
                    {/* DESCRIPTION */}
                    <p className="lead text-dark mb-4" style={{fontSize: '1.05rem', lineHeight: '1.7'}}>
                        {product.description}
                    </p>
                    
                    {/* ATTRIBUTE CALLOUT */}
                    <div className="p-3 bg-light rounded mb-4 border border-1" style={{borderLeft: '5px solid #A67B5B'}}>
                        <strong className="text-dark">Key Material:</strong> {product.material}
                    </div>

                    <hr className="my-4" style={{opacity: 0.1}} />

                    {/* VARIANT SELECTION */}
                    <h5 className="mb-3 fw-bold">Select Configuration</h5>
                    {variants.length === 0 ? (
                        <div className="text-muted fst-italic mb-3 p-3 bg-white border rounded">Standard model only.</div>
                    ) : (
                        <div className="mb-4">
                            {variants.map(variant => (
                                <Card 
                                    key={variant.variant_id} 
                                    className={`mb-2 product-variant-card ${selectedVariant?.variant_id === variant.variant_id ? 'border-dark bg-white shadow-lg' : 'border-light bg-light'}`}
                                    style={{ cursor: variant.stock_quantity > 0 ? 'pointer' : 'not-allowed', opacity: variant.stock_quantity > 0 ? 1 : 0.6, transition: 'all 0.2s' }}
                                    onClick={() => variant.stock_quantity > 0 && setSelectedVariant(variant)}
                                >
                                    <Card.Body className="d-flex justify-content-between align-items-center py-3">
                                        <div>
                                            <strong className="d-block text-dark">{variant.color} - {variant.size}</strong>
                                            <span className="text-muted small">SKU: {variant.sku}</span>
                                        </div>
                                        <div className="text-end">
                                            {variant.price_modifier > 0 && <span className="text-success fw-bold me-3">+৳{variant.price_modifier}</span>}
                                            {selectedVariant?.variant_id === variant.variant_id && <Badge bg="dark" className="rounded-pill">Current</Badge>}
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    )}
                    
                    {/* --- ADD TO CART BUTTON (DESKTOP VIEW) --- */}
                    <div className="d-none d-md-block mt-5">
                         <Button 
                            variant="dark" 
                            size="lg" 
                            disabled={!product.is_active || (variants.length > 0 && !selectedVariant)}
                            onClick={handleAddToCart}
                            className="px-5 py-3 rounded-pill fw-bold"
                            style={{ minWidth: '300px' }}
                        >
                            {variants.length > 0 && !selectedVariant ? "Select Configuration" : "Add to Cart"}
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* --- FIXED/STICKY ADD TO CART CTA (MOBILE VIEW) --- */}
            <div className="d-block d-md-none fixed-bottom bg-white shadow-lg p-3" style={{ zIndex: 1050 }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong className="h4 mb-0">৳{product.base_price}</strong>
                    <Badge bg={product.is_active ? 'success' : 'danger'}>{product.is_active ? 'In Stock' : 'Out of Stock'}</Badge>
                </div>
                <Button 
                    variant="dark" 
                    size="lg" 
                    disabled={!product.is_active || (variants.length > 0 && !selectedVariant)}
                    onClick={handleAddToCart}
                    className="w-100 rounded-pill fw-bold"
                >
                    {variants.length > 0 && !selectedVariant ? "Select an Option" : "Add to Cart"}
                </Button>
            </div>
        </Container>
    );
}

export default ProductDetail;