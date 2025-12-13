import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Navbar, Container, Nav, Badge, Row, Col } from 'react-bootstrap';
import { Toaster } from 'react-hot-toast'; // 1. Import Toaster for notifications
import logo from './assets/logo.png'; 

import { CartProvider, useCart } from './CartContext';
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';
import Cart from './Cart'; 
import Checkout from './Checkout'; 
import Admin from './Admin';

import './App.css'; 

// --- COMPONENT: NAVIGATION ---
function NavBarContent() {
    const { cartCount } = useCart();
    return (
        <Navbar variant="dark" expand="lg" className="navbar-custom sticky-top">
          <Container>
            <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
              <img
                alt="Home Decor Logo"
                src={logo}
                width="45"
                height="45"
                className="d-inline-block align-top me-2"
                style={{borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)'}}
              />{' '}
              <span style={{ fontWeight: 'bold', fontSize: '1.4rem', letterSpacing: '1px' }}>
                Home Decor
              </span>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link as={Link} to="/" className="mx-2">Shop</Nav.Link>
                <Nav.Link as={Link} to="/admin" className="mx-2">Admin</Nav.Link>
                <Nav.Link as={Link} to="/cart" className="mx-2 position-relative">
                    Cart 
                    {cartCount > 0 && 
                      <Badge bg="warning" text="dark" pill className="position-absolute top-0 start-100 translate-middle">
                        {cartCount}
                      </Badge>
                    }
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
    );
}

// --- COMPONENT: HERO SECTION (Only shows on Home Page) ---
function HeroSection() {
    const location = useLocation();
    
    // Only show hero on the home page ('/')
    if (location.pathname !== '/') return null;

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
                {/* 2. Added Animation Class to the Header */}
                <h1 className="display-3 fw-bold mb-3 animate__animated animate__fadeInDown" style={{color: 'white'}}>
                    Elevate Your Living Space
                </h1>
                <p className="lead mb-4 animate__animated animate__fadeInUp" style={{maxWidth: '600px', margin: '0 auto', animationDelay: '0.2s'}}>
                    Discover our handcrafted collection of premium furniture. 
                    Designed for comfort, built for style.
                </p>
                <Link to="/" className="btn btn-light btn-lg px-5 rounded-pill shadow animate__animated animate__fadeInUp" style={{animationDelay: '0.4s'}}>
                    Browse Collection
                </Link>
            </Container>
        </div>
    );
}

// --- COMPONENT: FOOTER ---
function Footer() {
    return (
        <footer style={{ backgroundColor: '#2C3531', color: '#8F9779', marginTop: 'auto', paddingTop: '60px', paddingBottom: '30px' }}>
            <Container>
                <Row>
                    <Col md={4} className="mb-4">
                        <h5 className="text-white mb-3">Home Decor</h5>
                        <p className="small">Creating beautiful spaces since 2025. We believe in quality materials and timeless design.</p>
                    </Col>
                    <Col md={4} className="mb-4">
                        <h5 className="text-white mb-3">Quick Links</h5>
                        <ul className="list-unstyled">
                            <li><Link to="/" className="text-decoration-none text-muted">Shop All</Link></li>
                            <li><Link to="/cart" className="text-decoration-none text-muted">My Cart</Link></li>
                            <li><Link to="/admin" className="text-decoration-none text-muted">Admin Login</Link></li>
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
                </div>
            </Container>
        </footer>
    );
}

function App() {
  return (
    <CartProvider>
        <Router>
          <div className="App d-flex flex-column min-vh-100">
            {/* 3. Add Toaster here (Invisible until triggered) */}
            <Toaster position="top-center" reverseOrder={false} />

            <NavBarContent />
            
            {/* The HeroSection handles its own internal animation classes */}
            <HeroSection />

            <Container className="flex-grow-1">
              <Routes>
                <Route path="/" element={<ProductList />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </Container>

            <Footer />
          </div>
        </Router>
    </CartProvider>
  );
}

export default App;