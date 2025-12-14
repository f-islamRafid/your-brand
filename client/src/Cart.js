import React from 'react';
import { Container, Table, Button, Card, Row, Col } from 'react-bootstrap';
import { useCart } from './CartContext';
import { Link, useNavigate } from 'react-router-dom';

function Cart() {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const handleProceed = () => {
        navigate('/checkout'); // Smooth navigation
    };

    if (cartItems.length === 0) {
        return (
            <Container className="py-5 text-center animate__animated animate__fadeIn">
                <h2 className="mb-3">Your Cart is Empty</h2>
                <p className="text-muted mb-4">Looks like you haven't made your choice yet.</p>
                <Button as={Link} to="/" variant="dark" size="lg">Start Shopping</Button>
            </Container>
        );
    }

    return (
        <Container className="py-5 animate__animated animate__fadeIn">
            <h2 className="mb-4 fw-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Shopping Cart</h2>
            
            <Row>
                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Table responsive className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="py-3 ps-4">Product</th>
                                    <th className="py-3">Price</th>
                                    <th className="py-3">Quantity</th>
                                    <th className="py-3">Total</th>
                                    <th className="py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => (
                                    <tr key={item.cartId}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <img 
                                                    src={`/images/${item.id}.jpg`} 
                                                    alt={item.name} 
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', marginRight: '15px' }}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/60x60"; }}
                                                />
                                                <div>
                                                    <span className="fw-bold d-block">{item.name}</span>
                                                    {item.variant_info && <small className="text-muted">{item.variant_info}</small>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>৳{item.price}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <Button variant="outline-secondary" size="sm" onClick={() => updateQuantity(item.cartId, item.quantity - 1)}>-</Button>
                                                <span className="mx-2 fw-bold">{item.quantity}</span>
                                                <Button variant="outline-secondary" size="sm" onClick={() => updateQuantity(item.cartId, item.quantity + 1)}>+</Button>
                                            </div>
                                        </td>
                                        <td className="fw-bold">৳{item.price * item.quantity}</td>
                                        <td>
                                            <Button variant="link" className="text-danger p-0" onClick={() => removeFromCart(item.cartId)}>Remove</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="border-0 shadow-sm bg-light">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-4">Order Summary</h5>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Subtotal</span>
                                <span>৳{cartTotal}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3 text-success">
                                <span>Shipping</span>
                                <span>FREE</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-4">
                                <span className="h5 fw-bold">Total</span>
                                <span className="h5 fw-bold">৳{cartTotal}</span>
                            </div>
                            
                            {/* PROCEED BUTTON */}
                            <Button variant="dark" size="lg" className="w-100" onClick={handleProceed}>
                                Proceed to Checkout
                            </Button>
                            
                            <Button variant="outline-danger" size="sm" className="w-100 mt-3" onClick={clearCart}>
                                Clear Cart
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Cart;