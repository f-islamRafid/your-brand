import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Row, Col, Card, Button, InputGroup, Form, Badge, Spinner } from 'react-bootstrap';
import { Toaster } from 'react-hot-toast';
import './App.css'; 

// Components
import Admin from './Admin';
import ProductDetail from './ProductDetail';
import Cart from './Cart';
import Checkout from './Checkout';
import Footer from './Footer';

// Context
import { CartProvider } from './CartContext';

// Mock Auth Check
const isAuthenticated = () => localStorage.getItem('isAdmin') === 'true';

// --- MAIN COMPONENTS ---

// Navbar Component
function Header({ totalItems }) {
    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        window.location.href = '/'; 
    };

    return (
        <Navbar expand="lg" style={{ backgroundColor: '#4A5D45' }} variant="dark" sticky="top" className="shadow-sm">
            <Container>
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
                    <img src="/logo.png" alt="Home Decor Logo" height="30" className="me-2" />
                    <span className="fs-4 fw-bold">Home Decor</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Form className="d-flex mx-auto w-50">
                        <InputGroup>
                            <Form.Control
                                type="search"
                                placeholder="Search for furniture..."
                                aria-label="Search"
                                className="border-0"
                                style={{ backgroundColor: '#62765d' }}
                            />
                            <Button variant="outline-light">Search</Button>
                        </InputGroup>
                    </Form>
                    <Nav className="ms-auto fw-bold">
                        <Nav.Link as={Link} to="/shop">SHOP</Nav.Link>
                        {isAuthenticated() ? (
                            <>
                                <Nav.Link as={Link} to="/admin">ADMIN</Nav.Link>
                                <Nav.Link onClick={handleLogout} style={{cursor: 'pointer'}}>LOGOUT</Nav.Link>
                            </>
                        ) : (
                            <Nav.Link as={Link} to="/admin">ADMIN</Nav.Link>
                        )}
                        <Nav.Link as={Link} to="/cart" className="position-relative">
                            CART 
                            {totalItems > 0 && (
                                <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
                                    {totalItems}
                                </Badge>
                            )}
                        </Nav.Link>
                        <Nav.Link as={Link} to="/contact">CONTACT</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

// Home Page Component
function Home({ products }) {
    
    // Feature Highlights Data
    const features = [
        { icon: '🚚', title: 'FREE SHIPPING', subtitle: 'On all orders over ৳5000' },
        { icon: '🔒', title: 'SECURE PAYMENT', subtitle: '100% protected transactions' },
        { icon: '✨', title: 'QUALITY MATERIAL', subtitle: 'Hand-picked premium wood' },
        { icon: '🔄', title: 'EASY RETURNS', subtitle: '30-day money-back guarantee' }
    ];

    return (
        <>
            {/* HERO BANNER SECTION */}
            <div className="hero-section" style={{ 
                backgroundImage: 'url(/hero-bg.jpg)', 
                backgroundSize: 'cover', 
                backgroundPosition: 'center center',
            }}>
                <div className="overlay"></div>
                
                {/* HERO CONTENT - MODIFIED BUTTON HERE */}
                <div className="hero-content text-center text-white">
                    <h1 className="display-3 fw-bolder mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Elevate Your Living Space
                    </h1>
                    <p className="lead mb-5 px-3">
                        Discover our handcrafted collection of premium furniture. Designed for comfort, built for style.
                    </p>
                    
                    <Button 
                        variant="outline-light" 
                        size="lg" 
                        as={Link} 
                        to="/shop"
                        className="hero-browse-btn" // Applies the stylish CSS
                    >
                        BROWSE COLLECTION
                    </Button>
                </div>
            </div>

            {/* FEATURE HIGHLIGHTS */}
            <Container className="my-5">
                <Row className="text-center">
                    {features.map((feature, index) => (
                        <Col md={3} key={index} className="mb-4">
                            <div className="p-3">
                                <span style={{ fontSize: '2.5rem' }}>{feature.icon}</span>
                                <h5 className="mt-2 fw-bold">{feature.title}</h5>
                                <p className="text-muted small">{feature.subtitle}</p>
                            </div>
                        </Col>
                    ))}
                </Row>
                <hr className="my-5"/>
            </Container>

            {/* PRODUCT LISTING (SHOP PREVIEW) */}
            <Container className="mb-5">
                <h2 className="text-center mb-5 fw-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Featured Products</h2>
                <Row xs={1} md={2} lg={4} className="g-4">
                    {products.slice(0, 4).map(product => ( // Show first 4 products
                        <ProductCard key={product.product_id} product={product} />
                    ))}
                </Row>
                <div className="text-center mt-5">
                    <Button as={Link} to="/shop" variant="outline-dark" size="lg" className="rounded-pill px-5">View All</Button>
                </div>
            </Container>
        </>
    );
}

// Product Card Component (used in Home and Shop)
function ProductCard({ product }) {
    const { addToCart } = useCart();

    const handleQuickAdd = (e) => {
        e.preventDefault();
        addToCart(product);
    };

    return (
        <Col>
            <Card className="h-100 shadow-sm border-0 product-card">
                <Link to={`/product/${product.product_id}`}>
                    <div className="product-image-container-small">
                        <img 
                            src={`/images/${product.product_id}.jpg`} 
                            alt={product.name} 
                            className="card-img-top img-fluid" 
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300?text=No+Image"; }}
                        />
                    </div>
                </Link>
                <Card.Body className="d-flex flex-column">
                    <Card.Title className="fw-bold mb-1">{product.name}</Card.Title>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fs-5 text-muted">৳{product.base_price}</span>
                        <Badge bg={product.is_active ? 'success' : 'danger'}>
                            {product.is_active ? 'In Stock' : 'Hidden'}
                        </Badge>
                    </div>
                    <Card.Text className="text-muted small mb-3 flex-grow-1">
                        {product.description ? product.description.substring(0, 50) + '...' : 'No description provided.'}
                    </Card.Text>
                    
                    <div className="mt-auto d-grid gap-2">
                        <Button as={Link} to={`/product/${product.product_id}`} variant="outline-dark" className="rounded-pill">
                            View Details
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Col>
    );
}

// Shop Page Component
function Shop({ products }) {
    return (
        <Container className="py-5">
            <h1 className="text-center mb-5 fw-bold" style={{ fontFamily: 'Playfair Display, serif' }}>All Products</h1>
            <Row xs={1} md={2} lg={4} className="g-4">
                {products.map(product => (
                    <ProductCard key={product.product_id} product={product} />
                ))}
            </Row>
            {products.length === 0 && (
                <Alert variant="info" className="text-center">No active products found in the catalog.</Alert>
            )}
        </Container>
    );
}

// Main App Component
function App() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch products:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" />
            </div>
        );
    }

    return (
        <CartProvider>
            <Router>
                <AppContent products={products} fetchProducts={fetchProducts} />
            </Router>
        </CartProvider>
    );
}

// AppContent handles routing and context
function AppContent({ products, fetchProducts }) {
    const { totalItems } = useCart();

    return (
        <div id="app-container">
            <Toaster />
            <Header totalItems={totalItems} />
            <main>
                <Routes>
                    <Route path="/" element={<Home products={products} />} />
                    <Route path="/shop" element={<Shop products={products} />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/admin" element={<Admin fetchProducts={fetchProducts} />} />
                    <Route path="/contact" element={<Container className='py-5'><Alert variant="info">Contact Page Placeholder</Alert></Container>} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

export default App;