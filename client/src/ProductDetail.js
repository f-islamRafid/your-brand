import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Form, ProgressBar } from 'react-bootstrap';
import { useCart } from './CartContext';
import toast from 'react-hot-toast'; 

function ProductDetail() {
    const { id } = useParams();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [reviews, setReviews] = useState([]); // Store reviews
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);

    // Review Form State
    const [reviewForm, setReviewForm] = useState({ user_name: '', rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchProduct = fetch(`/api/products/${id}`).then(res => {
            if (!res.ok) throw new Error('Product not found');
            return res.json();
        });

        const fetchVariants = fetch('/api/variants').then(res => res.json());
        
        // Fetch Reviews
        const fetchReviews = fetch(`/api/products/${id}/reviews`).then(res => res.json());

        Promise.all([fetchProduct, fetchVariants, fetchReviews])
            .then(([productData, variantsData, reviewsData]) => {
                setProduct(productData);
                const productVariants = variantsData.filter(v => v.product_id === parseInt(id));
                setVariants(productVariants);
                setReviews(reviewsData); // Save reviews
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

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            const res = await fetch(`/api/products/${id}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewForm)
            });
            if (res.ok) {
                const newReview = await res.json();
                setReviews([newReview, ...reviews]); // Add to list instantly
                setReviewForm({ user_name: '', rating: 5, comment: '' }); // Reset form
                toast.success("Review posted! Thank you.");
            } else {
                toast.error("Failed to post review.");
            }
        } catch (err) {
            toast.error("Network error.");
        }
        setSubmittingReview(false);
    };

    // Calculate Average Rating
    const averageRating = reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
        : "New";

    // Helper to render stars
    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} style={{ color: i < rating ? '#ffc107' : '#e4e5e9', fontSize: '1.2rem' }}>★</span>
        ));
    };

    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    if (!product) return <Container className="mt-5"><Alert variant="warning">Product not found</Alert></Container>;

    return (
        <Container className="py-5 animate__animated animate__fadeIn">
            <Link to="/" className="btn btn-link text-muted mb-4 text-decoration-none fw-bold" style={{ letterSpacing: '1px' }}>
                &larr; Back to Catalog
            </Link>
            
            {/* PRODUCT INFO SECTION */}
            <Row className="gx-5 mb-5">
                <Col md={6} className="mb-4">
                    <div className="product-image-container" style={{ 
                        border: 'none', borderRadius: '16px', overflow: 'hidden', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)', backgroundColor: '#f8f9fa' 
                    }}>
                        <img 
                            src={`/images/${id}.jpg`} alt={product.name} className="img-fluid"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x600?text=No+Image"; }}
                            style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                        />
                    </div>
                </Col>

                <Col md={6}>
                    <div className="product-header mb-4">
                        <h1 className="display-5 fw-bolder mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{product.name}</h1>
                        
                        {/* STAR RATING BADGE */}
                        <div className="mb-3 d-flex align-items-center">
                            <span style={{ color: '#ffc107', fontSize: '1.5rem', marginRight: '10px' }}>★</span>
                            <span className="fw-bold fs-5 me-2">{averageRating}</span>
                            <span className="text-muted small">({reviews.length} Reviews)</span>
                        </div>

                        <div className="d-flex align-items-center mb-3">
                            <span className="h1 text-dark me-3 mb-0 fw-bold" style={{ letterSpacing: '-0.5px' }}>৳{product.base_price}</span>
                            {product.is_active ? 
                                <Badge bg="success" className="px-3 py-2 fs-6 rounded-pill">In Stock</Badge> : 
                                <Badge bg="danger" className="px-3 py-2 fs-6 rounded-pill">Unavailable</Badge>
                            }
                        </div>
                    </div>
                    
                    <p className="lead text-dark mb-4" style={{fontSize: '1.05rem', lineHeight: '1.7'}}>{product.description}</p>
                    
                    <div className="p-3 bg-light rounded mb-4 border border-1" style={{borderLeft: '5px solid #A67B5B'}}>
                        <strong className="text-dark">Key Material:</strong> {product.material}
                    </div>

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
                                        <div><strong className="d-block text-dark">{variant.color} - {variant.size}</strong><span className="text-muted small">SKU: {variant.sku}</span></div>
                                        <div className="text-end">{variant.price_modifier > 0 && <span className="text-success fw-bold me-3">+৳{variant.price_modifier}</span>}{selectedVariant?.variant_id === variant.variant_id && <Badge bg="dark" className="rounded-pill">Current</Badge>}</div>
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    )}
                    
                    <div className="d-none d-md-block mt-5">
                         <Button variant="dark" size="lg" disabled={!product.is_active || (variants.length > 0 && !selectedVariant)} onClick={handleAddToCart} className="px-5 py-3 rounded-pill fw-bold" style={{ minWidth: '300px' }}>{variants.length > 0 && !selectedVariant ? "Select Configuration" : "Add to Cart"}</Button>
                    </div>
                </Col>
            </Row>

            <hr className="my-5" />

            {/* --- REVIEWS SECTION --- */}
            <Row>
                <Col md={12}>
                    <h3 className="mb-4 fw-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Customer Reviews</h3>
                </Col>
                
                {/* Review List */}
                <Col md={7}>
                    {reviews.length === 0 ? (
                        <div className="text-center p-5 bg-light rounded mb-4">
                            <h5>No reviews yet</h5>
                            <p className="text-muted">Be the first to review this product!</p>
                        </div>
                    ) : (
                        reviews.map(review => (
                            <Card key={review.review_id} className="mb-3 border-0 shadow-sm">
                                <Card.Body>
                                    <div className="d-flex justify-content-between">
                                        <h6 className="fw-bold">{review.user_name}</h6>
                                        <small className="text-muted">{new Date(review.created_at).toLocaleDateString()}</small>
                                    </div>
                                    <div className="mb-2">{renderStars(review.rating)}</div>
                                    <Card.Text>{review.comment}</Card.Text>
                                </Card.Body>
                            </Card>
                        ))
                    )}
                </Col>

                {/* Write Review Form */}
                <Col md={5}>
                    <Card className="border-0 shadow-sm bg-light sticky-top" style={{ top: '100px' }}>
                        <Card.Body>
                            <h5 className="mb-3 fw-bold">Write a Review</h5>
                            <Form onSubmit={handleSubmitReview}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Your Name</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="John Doe" 
                                        required 
                                        value={reviewForm.user_name}
                                        onChange={e => setReviewForm({...reviewForm, user_name: e.target.value})}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Rating</Form.Label>
                                    <div className="d-flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Button 
                                                key={star} 
                                                variant={reviewForm.rating === star ? 'warning' : 'outline-secondary'} 
                                                size="sm" 
                                                onClick={() => setReviewForm({...reviewForm, rating: star})}
                                                style={{ color: reviewForm.rating === star ? 'black' : '', fontWeight: 'bold' }}
                                            >
                                                {star} ★
                                            </Button>
                                        ))}
                                    </div>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Your Review</Form.Label>
                                    <Form.Control 
                                        as="textarea" 
                                        rows={3} 
                                        placeholder="How is the quality?" 
                                        required 
                                        value={reviewForm.comment}
                                        onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                                    />
                                </Form.Group>
                                <Button variant="dark" type="submit" className="w-100" disabled={submittingReview}>
                                    {submittingReview ? 'Posting...' : 'Submit Review'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Mobile Sticky Button (Unchanged) */}
            <div className="d-block d-md-none fixed-bottom bg-white shadow-lg p-3" style={{ zIndex: 1050 }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong className="h4 mb-0">৳{product.base_price}</strong>
                    <Badge bg={product.is_active ? 'success' : 'danger'}>{product.is_active ? 'In Stock' : 'Out of Stock'}</Badge>
                </div>
                <Button variant="dark" size="lg" disabled={!product.is_active || (variants.length > 0 && !selectedVariant)} onClick={handleAddToCart} className="w-100 rounded-pill fw-bold">
                    {variants.length > 0 && !selectedVariant ? "Select Option" : "Add to Cart"}
                </Button>
            </div>
        </Container>
    );
}

export default ProductDetail;