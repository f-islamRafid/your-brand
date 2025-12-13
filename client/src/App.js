import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar, Container, Nav, Badge } from 'react-bootstrap';
import logo from './assets/logo.png'; 

import { CartProvider, useCart } from './CartContext';

// Import Pages
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';
import Cart from './Cart'; 
import Checkout from './Checkout'; // Import the new Checkout page
import './App.css';

function NavBarContent() {
    const { cartCount } = useCart();
    
    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
          <Container>
            <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
              <img
                alt="Home Decor Logo"
                src={logo}
                width="50"
                height="50"
                className="d-inline-block align-top me-2"
                style={{borderRadius: '5px'}}
              />{' '}
              <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#fff' }}>
                Home Decor
              </span>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link as={Link} to="/">Catalog</Nav.Link>
                <Nav.Link as={Link} to="/cart">
                    Cart {cartCount > 0 && <Badge bg="warning" text="dark" className="ms-1">{cartCount}</Badge>}
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
    );
}

function App() {
  return (
    <CartProvider>
        <Router>
          <div className="App">
            <NavBarContent />
            <Container>
              <Routes>
                <Route path="/" element={<ProductList />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                
                {/* --- NEW ROUTE ADDED HERE --- */}
                <Route path="/checkout" element={<Checkout />} />
                
              </Routes>
            </Container>
          </div>
        </Router>
    </CartProvider>
  );
}

export default App;