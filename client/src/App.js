import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Navbar, Container, Nav, Badge, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { Toaster } from 'react-hot-toast'; 
import logo from './assets/logo.png'; 

// Context
import { CartProvider, useCart } from './CartContext';

// Pages
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';
import Cart from './Cart'; 
import Checkout from './Checkout'; 
import Admin from './Admin';
import Contact from './Contact'; 
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';

import './App.css'; 

// --- COMPONENT: NAVIGATION (Restored Green/Gold) ---
// client/src/App.js

// client/src/App.js

function NavBarContent() {
    // 👇 FIXED: changed 'cartCount' to 'totalItems' to match CartContext
    const { totalItems } = useCart(); 

    return (
        <Navbar variant="dark" expand="lg" className="navbar-custom sticky-top" style={{ zIndex: 1050 }}>
          <Container>
            <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
              <img
                alt="Home Decor Logo"
                src={logo}
                width="55" 
                height="55" 
                className="d-inline-block align-top me-3 animate__animated animate__rotateIn" 
                style={{
                    borderRadius: '50%', 
                    border: '3px solid #A67B5B', 
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)', 
                    padding: '2px', 
                    backgroundColor: 'white'
                }}
              />
              
              <div className="d-flex flex-column">
                  <span style={{ 
                      fontFamily: "'Playfair Display', serif", 
                      fontWeight: '700', 
                      fontSize: '1.8rem', 
                      letterSpacing: '1.5px', 
                      color: '#ffffff',
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)', 
                      lineHeight: '1',
                      marginBottom: '2px' 
                  }}>
                    Home Decor
                  </span>
                  
                  <span style={{
                      fontSize: '0.65rem',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      color: '#A67B5B', 
                      fontWeight: '600',
                      fontStyle: 'italic'
                  }}>
                      Quality You Can Trust
                  </span>
              </div>
            </Navbar.Brand>

            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Form className="d-flex mx-auto my-2 my-lg-0" style={{ maxWidth: '400px', width: '100%' }}>
                <Form.Control
                  type="search"
                  placeholder="Search for furniture..."
                  className="me-2 rounded-pill border-0 shadow-sm"
                  aria-label="Search"
                  style={{ background: 'rgba(255,255,255,0.15)', color: 'white', backdropFilter: 'blur(5px)' }}
                />
              </Form>

              <Nav className="ms-auto">
                <Nav.Link as={Link} to="/" className="mx-2 text-uppercase fw-bold" style={{fontSize: '0.9rem', letterSpacing: '1px'}}>Shop</Nav.Link>
                <Nav.Link as={Link} to="/admin" className="mx-2 text-uppercase fw-bold" style={{fontSize: '0.9rem', letterSpacing: '1px'}}>Admin</Nav.Link>
                <Nav.Link as={Link} to="/cart" className="mx-2 position-relative text-uppercase fw-bold" style={{fontSize: '0.9rem', letterSpacing: '1px'}}>
                    Cart 
                    {/* 👇 FIXED: Using 'totalItems' here */}
                    {totalItems > 0 && 
                      <Badge bg="warning" text="dark" pill className="position-absolute top-0 start-100 translate-middle shadow-sm">
                        {totalItems}
                      </Badge>
                    }
                </Nav.Link>
                <Nav.Link as={Link} to="/contact" className="mx-2 text-uppercase fw-bold" style={{fontSize: '0.9rem', letterSpacing: '1px'}}>Contact</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
    );
}

// --- COMPONENT: HERO SECTION (With New Stylish Button) ---
function HeroSection() {
    const location = useLocation();
    if (location.pathname !== '/') return null;

    const scrollToCollection = () => {
        const element = document.getElementById('collection');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div style={{
            background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            padding: '100px 0',
            textAlign: 'center',
            marginBottom: '40px',
            borderRadius: '0 0 20px 20px'
        }}>
            <Container>
                <h1 className="display-3 fw-bold mb-3 animate__animated animate__fadeInDown" style={{color: 'white'}}>
                    Elevate Your Living Space
                </h1>
                <p className="lead mb-4 animate__animated animate__fadeInUp" style={{maxWidth: '600px', margin: '0 auto', animationDelay: '0.2s'}}>
                    Discover our handcrafted collection of premium furniture. 
                    Designed for comfort, built for style.
                </p>
                
                {/* 👇 UPDATED STYLISH BUTTON */}
                <Button 
                    variant="outline-light" // Base variant
                    size="lg" 
                    onClick={scrollToCollection}
                    className="hero-browse-btn animate__animated animate__fadeInUp" 
                    style={{ animationDelay: '0.4s' }}
                >
                    BROWSE COLLECTION
                </Button>

            </Container>
        </div>
    );
}

// --- COMPONENT: TRUST SIGNALS (Restored) ---
function TrustSection() {
    const location = useLocation();
    if (location.pathname !== '/') return null;

    const features = [
        { icon: "🚚", title: "Free Shipping", text: "On all orders over ৳5000" },
        { icon: "🛡️", title: "Secure Payment", text: "100% protected transactions" },
        { icon: "✨", title: "Quality Material", text: "Hand-picked premium wood" },
        { icon: "↩️", title: "Easy Returns", text: "30-day money back guarantee" },
    ];

    return (
        <div style={{ backgroundColor: '#fff', marginTop: '-40px', padding: '40px 0', position: 'relative', zIndex: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Container>
                <Row>
                    {features.map((f, i) => (
                        <Col key={i} md={3} sm={6} className="text-center mb-3 mb-md-0 animate__animated animate__fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{f.icon}</div>
                            <h6 style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{f.title}</h6>
                            <p className="text-muted small mb-0">{f.text}</p>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
}

// --- COMPONENT: FOOTER (Restored "Built by RAFID") ---
function Footer() {
    return (
        <footer style={{ backgroundColor: '#2C3531', color: '#8F9779', marginTop: 'auto', paddingTop: '60px', paddingBottom: '30px' }}>
            <Container>
                <Row>
                    <Col md={4} className="mb-4">
                        <h5 className="text-white mb-3">Home Decor</h5>
                        <p className="small">
                            Creating beautiful spaces since 2004. We believe in quality materials and timeless design.
                        </p>
                    </Col>
                    <Col md={4} className="mb-4">
                        <h5 className="text-white mb-3">Quick Links</h5>
                        <ul className="list-unstyled">
                            <li><Link to="/" className="text-decoration-none text-muted">Shop All</Link></li>
                            <li><Link to="/contact" className="text-decoration-none text-muted">Contact Us</Link></li>
                            <li><Link to="/cart" className="text-decoration-none text-muted">My Cart</Link></li>
                        </ul>
                    </Col>
                    <Col md={4} className="mb-4">
                        <h5 className="text-white mb-3">Newsletter</h5>
                        <div className="input-group mb-3">
                            <input type="text" className="form-control" placeholder="Your email" style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white'}} />
                            <button className="btn btn-outline-light" type="button">Subscribe</button>
                        </div>
                    </Col>
                </Row>
                <hr style={{borderColor: 'rgba(255,255,255,0.1)'}} />
                <div className="text-center small">
                    &copy; 2025 Home Decor Inc. All rights reserved. 
                    <span className="mx-2">|</span> 
                    <span style={{ color: '#fff', fontWeight: 'bold', letterSpacing: '1px' }}>Built by RAFID</span>
                </div>
            </Container>
        </footer>
    );
}

// --- MAIN APP COMPONENT ---
function App() {
  return (
    <CartProvider>
        <Router>
          <div className="App d-flex flex-column min-vh-100">
            <Toaster position="top-center" reverseOrder={false} />

            <NavBarContent />
            <HeroSection />
            <TrustSection />

            <Container className="flex-grow-1">
              <Routes>
                <Route path="/" element={<ProductList />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/contact" element={<Contact />} />

                {/* Security Routes */}
                <Route path="/login" element={<Login />} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </Container>

            <Footer />
          </div>
        </Router>
    </CartProvider>
  );
}

export default App;