import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Button, Alert } from 'react-bootstrap';

// 1. The Skeleton Card Component (Visual Upgrade)
const SkeletonCard = () => (
    <Col>
        <Card className="h-100 border-0 shadow-sm">
            <div className="skeleton skeleton-img"></div>
            <Card.Body>
                <div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '90%', marginTop: '1rem' }}></div>
            </Card.Body>
        </Card>
    </Col>
);

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // 2. New State for Filtering
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        // Simulate a slight delay so you can see the beautiful skeleton loader
        const timer = setTimeout(() => {
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
        }, 800); // 800ms delay for effect
        return () => clearTimeout(timer);
    }, []);

    // 3. Filter Logic
    const getFilteredProducts = () => {
        if (filter === 'All') return products;
        // Simple text matching for now
        return products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
    };

    const filteredProducts = getFilteredProducts();

    if (error) return <Alert variant="danger" className="m-5">Error loading catalog: {error}</Alert>;

    return (
        <div className="py-4">
            <div className="text-center mb-5">
                <h2 className="mb-3 fw-bold display-6">Featured Collection</h2>
                <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    Explore our curated selection of premium furniture, designed to bring comfort and style to every corner of your home.
                </p>
            </div>

            {/* 4. The Category Filter Bar (Efficiency Upgrade) */}
            <div className="d-flex justify-content-center mb-5 flex-wrap gap-2">
                {['All', 'Chair', 'Sofa', 'Table', 'Lamp'].map(category => (
                    <Button 
                        key={category}
                        variant={filter === category ? 'dark' : 'outline-secondary'}
                        className="rounded-pill px-4"
                        style={{ borderWidth: '2px', fontWeight: '600' }}
                        onClick={() => setFilter(category)}
                    >
                        {category}
                    </Button>
                ))}
            </div>
            
            <Row xs={1} md={2} lg={3} className="g-4 animate__animated animate__fadeInUp">
                {/* 5. Show Skeletons while loading */}
                {loading ? (
                    Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
                ) : filteredProducts.length === 0 ? (
                    <Col xs={12} className="text-center py-5">
                        <h4 className="text-muted">No products found in this category.</h4>
                        <Button variant="link" onClick={() => setFilter('All')}>View All</Button>
                    </Col>
                ) : (
                    /* 6. Real Products */
                    filteredProducts.map(product => (
                        <Col key={product.product_id}>
                            <Card className="h-100 product-card shadow-sm border-0">
                                <div className="card-img-wrapper" style={{ height: '280px', position: 'relative' }}>
                                    <Card.Img 
                                        className="card-img-top" 
                                        variant="top" 
                                        src={`/images/${product.product_id}.jpg`} 
                                        alt={product.name}
                                        onError={(e) => {
                                            e.target.onerror = null; 
                                            e.target.src = "https://placehold.co/600x400?text=No+Image";
                                        }}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    {!product.is_active && (
                                        <div style={{
                                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                            backgroundColor: 'rgba(255,255,255,0.7)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 'bold', color: '#dc3545', letterSpacing: '2px'
                                        }}>
                                            OUT OF STOCK
                                        </div>
                                    )}
                                </div>

                                <Card.Body className="d-flex flex-column p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <Card.Title className="fs-5 fw-bold mb-0">{product.name}</Card.Title>
                                        <span className="text-primary fw-bold">${product.base_price}</span>
                                    </div>
                                    <Card.Text className="text-muted small" style={{ flexGrow: 1 }}>
                                        {product.description.substring(0, 60)}...
                                    </Card.Text>
                                    <div className="mt-3">
                                        <Button as={Link} to={`/product/${product.product_id}`} variant="outline-dark" size="sm" className="w-100 rounded-pill">
                                            View Details
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>
        </div>
    );
}

export default ProductList;