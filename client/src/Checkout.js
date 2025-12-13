// client/src/Checkout.js
import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, ListGroup, Alert } from 'react-bootstrap';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';

function Checkout() {
    const { cart, clearCart } = useCart();
    const navigate = useNavigate();
    
    // Calculate total for summary
    const total = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        address: '',
        city: '',
        zip: '',
        cardName: '',
        cardNumber: ''
    });

    const [orderPlaced, setOrderPlaced] = useState(false);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const orderData = {
            customer_name: formData.fullName,
            customer_email: formData.email,
            shipping_address: `${formData.address}, ${formData.city} ${formData.zip}`,
            total_amount: total,
            items: cart
        };

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                // Success!
                setOrderPlaced(true);
                setTimeout(() => {
                    clearCart(); 
                    navigate('/'); 
                }, 3000);
            } else {
                alert("Failed to place order. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Network error.");
        }
    };

    if (cart.length === 0 && !orderPlaced) {
        return <Container className="mt-5"><Alert variant="warning">Your cart is empty.</Alert></Container>;
    }

    if (orderPlaced) {
        return (
            <Container className="mt-5 text-center p-5 bg-light rounded">
                <h1 className="text-success mb-3">🎉 Order Placed Successfully!</h1>
                <p className="lead">Thank you, {formData.fullName}!</p>
                <p>Your order for <strong>${total.toFixed(2)}</strong> is being processed.</p>
                <p className="text-muted">Redirecting you to the home page...</p>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h2 className="mb-4">Checkout</h2>
            <Row>
                {/* Left Column: Billing Form */}
                <Col md={8}>
                    <Card className="p-4 shadow-sm mb-4">
                        <Card.Title className="mb-3">Shipping & Payment</Card.Title>
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>Full Name</Form.Label>
                                        <Form.Control type="text" name="fullName" required onChange={handleChange} placeholder="John Doe" />
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control type="email" name="email" required onChange={handleChange} placeholder="john@example.com" />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Address</Form.Label>
                                <Form.Control type="text" name="address" required onChange={handleChange} placeholder="123 Main St" />
                            </Form.Group>

                            <Row>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>City</Form.Label>
                                        <Form.Control type="text" name="city" required onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>Zip Code</Form.Label>
                                        <Form.Control type="text" name="zip" required onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr className="my-4" />
                            <h5 className="mb-3">Payment Details (Mock)</h5>
                            
                            <Form.Group className="mb-3">
                                <Form.Label>Name on Card</Form.Label>
                                <Form.Control type="text" name="cardName" required onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Card Number</Form.Label>
                                <Form.Control type="text" name="cardNumber" placeholder="0000 0000 0000 0000" required onChange={handleChange} />
                            </Form.Group>

                            <Button variant="primary" size="lg" type="submit" className="w-100 mt-3">
                                Place Order (${total.toFixed(2)})
                            </Button>
                        </Form>
                    </Card>
                </Col>

                {/* Right Column: Order Summary */}
                <Col md={4}>
                    <Card className="shadow-sm">
                        <Card.Header>Your Items ({cart.length})</Card.Header>
                        <ListGroup variant="flush">
                            {cart.map((item, idx) => (
                                <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="fw-bold">{item.name}</div>
                                        <small className="text-muted">{item.variant_name} (x{item.quantity})</small>
                                    </div>
                                    <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                                </ListGroup.Item>
                            ))}
                            <ListGroup.Item className="d-flex justify-content-between fw-bold bg-light">
                                <span>Total (USD)</span>
                                <span>${total.toFixed(2)}</span>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Checkout;