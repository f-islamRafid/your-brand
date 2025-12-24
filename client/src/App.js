import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Navbar, Container, Nav, Badge, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { Toaster } from 'react-hot-toast'; 
import axios from 'axios'; // Added this
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

// --- COMPONENT: NAVIGATION ---
function NavBarContent() {
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
                  style={{ background: 'rgba(255,255,255,0.15)', color: 'white', backdropFilter: 'blur(5px)' }}
                />
              </Form>

              <Nav className="ms-auto">
                <Nav.Link as={Link} to="/" className="mx-2 text-uppercase fw-bold">Shop</Nav.Link>
                <Nav.Link as={Link} to="/admin" className="mx-2 text-uppercase fw-bold">Admin</Nav.Link>
                <Nav.Link as={Link} to="/cart" className="mx-2 position-relative text-uppercase fw-bold">
                    Cart 
                    {totalItems > 0 && 
                      <Badge bg="warning" text="dark" pill className="position-absolute top-0 start-100 translate-middle">
                        {totalItems}
                      </Badge>
                    }
                </Nav.Link>
                <Nav.Link as={Link} to="/contact" className="mx-2 text-uppercase fw-bold">Contact</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
    );
}

// --- COMPONENT: HERO SECTION ---
function HeroSection() {
    const location = useLocation();
    if (location.pathname !== '/') return null;

    const scrollToCollection = () => {
        const element = document.getElementById('collection');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
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
                <h1 className="display-3 fw-bold mb-3 animate__animated animate__fadeInDown">Elevate Your Living Space</h1>
                <p className="lead mb-4 animate__animated animate__fadeInUp">Discover our handcrafted collection of premium furniture.</p>
                <Button variant="outline-light" size="lg" onClick={scrollToCollection} className="animate__animated animate__fadeInUp">
                    BROWSE COLLECTION
                </Button>
            </Container>
        </div>
    );
}

// --- COMPONENT: TRUST SIGNALS ---
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
                        <Col key={i} md={3} sm={6} className="text-center mb-3">
                            <div style={{ fontSize: '2.5rem' }}>{f.icon}</div>
                            <h6 className="fw-bold">{f.title}</h6>
                            <p className="text-muted small">{f.text}</p>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
}

// --- COMPONENT: FOOTER ---
function Footer() {
    return (
        <footer style={{ backgroundColor: '#2C3531', color: '#8F9779', marginTop: 'auto', padding: '60px 0 30px' }}>
            <Container>
                <div className="text-center small">
                    &copy; 2025 Home Decor Inc. | <span style={{ color: '#fff', fontWeight: 'bold' }}>Built by RAFID</span>
                </div>
            </Container>
        </footer>
    );
}

// --- MAIN APP COMPONENT ---
function App() {
  const [token, setToken] = useState(localStorage.getItem('admin_token'));

  useEffect(() => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('admin_token', token);
    } else {
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('admin_token');
    }
}, [token]);

  const handleLogout = () => {
    setToken(null);
  };

  return (
    <CartProvider>
        <Router>
          <div className="App d-flex flex-column min-vh-100">
            <Toaster position="top-center" />
            
            {/* 1. Only show Shop Navbar if NOT in admin */}
            <Routes>
               <Route path="/admin/*" element={null} />
               <Route path="*" element={<NavBarContent />} />
            </Routes>

            {/* 2. Your Hero and Trust sections already have path checks inside them, which is good! */}
            <HeroSection />
            <TrustSection />

            <Container fluid={window.location.pathname.includes('/admin')} className="flex-grow-1">
              <Routes>
                <Route path="/" element={<ProductList />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/contact" element={<Contact />} />

                <Route path="/login" element={
                  !token ? <Login setToken={setToken} /> : <Navigate to="/admin" />
                } />
                
                <Route 
                  path="/admin/*" 
                  element={
                    <ProtectedRoute token={token}>
                      <Admin onLogout={handleLogout} />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </Container>

            {/* 3. Hide footer in Admin for a cleaner look */}
            <Routes>
               <Route path="/admin/*" element={null} />
               <Route path="*" element={<Footer />} />
            </Routes>
          </div>
        </Router>
    </CartProvider>
  )};

export default App;