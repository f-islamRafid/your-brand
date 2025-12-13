import React from 'react';
import { Container, Table, Button, Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';

function Cart() {
    // 1. Get cart data and the remove function from our Context
    const { cart, removeFromCart } = useCart();

    // 2. Calculate the Grand Total
    const total = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);

    // 3. Handle Empty State
    if (cart.length === 0) {
        return (
            <Container className="mt-5 text-center">
                <div className="p-5 bg-light rounded-3">
                    <h2 className="display-6">Your Cart is Empty</h2>
                    <p className="lead">Looks like you haven't added any furniture yet.</p>
                    <Link to="/" className="btn btn-primary mt-3">Start Shopping</Link>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h2 className="mb-4">Shopping Cart</h2>
            <Row>
                {/* Left Column: Cart Items Table */}
                <Col md={8}>
                    <Table responsive bordered hover className="align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Total</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((item, index) => (
                                <tr key={`${item.product_id}-${item.variant_id}-${index}`}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            {/* Thumbnail Image */}
                                            <img
                                                src={`/images/${item.product_id}.jpg`}
                                                alt={item.name}
                                                style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '15px', borderRadius: '4px' }}
                                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/60?text=?"; }}
                                            />
                                            <div>
                                                <div className="fw-bold">{item.name}</div>
                                                <div className="text-muted small">Option: {item.variant_name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${item.price}</td>
                                    <td>{item.quantity}</td>
                                    <td>${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                                    <td>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => removeFromCart(item.product_id, item.variant_id)}
                                        >
                                            &times; Remove
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>

                {/* Right Column: Order Summary */}
                <Col md={4}>
                    <Card className="shadow-sm border-0 bg-light">
                        <Card.Body>
                            <Card.Title>Order Summary</Card.Title>
                            <hr />
                            <div className="d-flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2 text-muted">
                                <span>Shipping:</span>
                                <span>Free</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-4 fs-5 fw-bold">
                                <span>Total:</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <div className="d-grid">
                                {/* This Button now links to the Checkout Page */}
                                <Button as={Link} to="/checkout" variant="success" size="lg">
                                    Proceed to Checkout
                                </Button>
                            </div>
                            <div className="mt-3 text-center">
                                <Link to="/" className="text-decoration-none">Continue Shopping</Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Cart;