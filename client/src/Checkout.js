import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Modal, Spinner, Badge } from 'react-bootstrap';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Checkout() {
    // 1. Get cart items
    const { cartItems = [], cartTotal, clearCart } = useCart(); 
    const navigate = useNavigate();

    // 2. Add local loading state to wait for hydration
    const [isCartReady, setIsCartReady] = useState(false);

    const [step, setStep] = useState(1); 
    const [formData, setFormData] = useState({ name: '', email: '', address: '', city: '' });
    const [paymentMethod, setPaymentMethod] = useState('COD'); 
    const [processing, setProcessing] = useState(false);
    
    // Mock Payment Modal State
    const [showPayModal, setShowPayModal] = useState(false);
    const [payProcessing, setPayProcessing] = useState(false);

    // 3. useEffect to check cart on load
    useEffect(() => {
        // If cart has items, we are ready.
        if (cartItems.length > 0) {
            setIsCartReady(true);
        } else {
            // If empty, wait a tiny bit to be sure it's not just lagging
            const timer = setTimeout(() => {
                setIsCartReady(true); 
            }, 500); 
            return () => clearTimeout(timer);
        }
    }, [cartItems]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleShippingSubmit = (e) => {
        e.preventDefault();
        setStep(2); 
    };

    const placeOrder = async (status = 'Pending') => {
        setProcessing(true);
        try {
            const orderData = {
                customerInfo: { ...formData, total: cartTotal },
                cartItems: cartItems,
                paymentMethod: paymentMethod,
                paymentStatus: status
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(`Order Placed! ID: ${data.orderId}`);
                clearCart();
                navigate('/'); 
            } else {
                toast.error("Order failed. Please try again.");
            }
        } catch (err) {
            toast.error("Network Error");
        }
        setProcessing(false);
    };

    const handlePayment = () => {
        if (paymentMethod === 'COD') {
            placeOrder('Pending'); 
        } else {
            setShowPayModal(true);
        }
    };

    const confirmOnlinePayment = () => {
        setPayProcessing(true);
        setTimeout(() => {
            setPayProcessing(false);
            setShowPayModal(false);
            placeOrder('Paid'); 
            toast.success("Payment Successful!", { icon: '💳' });
        }, 2000);
    };

    // 4. Show loading spinner while checking cart
    if (!isCartReady && cartItems.length === 0) {
        return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
    }

    // 5. NOW check if empty
    if (cartItems.length === 0) {
        return (
            <Container className="py-5 text-center animate__animated animate__fadeIn">
                <div className="mb-4" style={{ fontSize: '4rem' }}>🛒</div>
                <h3 className="mb-3">Your cart is empty</h3>
                <p className="text-muted mb-4">Looks like you haven't added any furniture yet.</p>
                <Button variant="dark" onClick={() => navigate('/shop')}>Start Shopping</Button>
            </Container>
        );
    }

    return (
        <Container className="py-5 animate__animated animate__fadeIn">
            <h2 className="mb-4 fw-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Checkout</h2>
            
            <Row>
                {/* LEFT: Forms */}
                <Col md={8}>
                    {step === 1 ? (
                        /* STEP 1: SHIPPING */
                        <Card className="shadow-sm border-0 mb-4">
                            <Card.Header className="bg-white py-3"><h5 className="mb-0">1. Shipping Information</h5></Card.Header>
                            <Card.Body className="p-4">
                                <Form onSubmit={handleShippingSubmit}>
                                    <Row>
                                        <Col md={6} className="mb-3"><Form.Control placeholder="Full Name" name="name" required onChange={handleChange} /></Col>
                                        <Col md={6} className="mb-3"><Form.Control type="email" placeholder="Email Address" name="email" required onChange={handleChange} /></Col>
                                    </Row>
                                    <Form.Group className="mb-3"><Form.Control placeholder="Address (House, Road, Area)" name="address" required onChange={handleChange} /></Form.Group>
                                    <Form.Group className="mb-4"><Form.Control placeholder="City / District" name="city" required onChange={handleChange} /></Form.Group>
                                    <Button variant="dark" type="submit" className="px-4">Continue to Payment &rarr;</Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    ) : (
                        /* STEP 2: PAYMENT METHOD */
                        <Card className="shadow-sm border-0 mb-4">
                            <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">2. Payment Method</h5>
                                <Button variant="link" size="sm" onClick={() => setStep(1)}>Change Shipping</Button>
                            </Card.Header>
                            <Card.Body className="p-4">
                                {/* OPTION 1: COD */}
                                <div 
                                    className={`p-3 border rounded mb-3 d-flex align-items-center cursor-pointer ${paymentMethod === 'COD' ? 'border-primary bg-light' : ''}`}
                                    onClick={() => setPaymentMethod('COD')}
                                    style={{ cursor: 'pointer', transition: '0.2s' }}
                                >
                                    <Form.Check type="radio" name="pay" checked={paymentMethod === 'COD'} readOnly className="me-3" />
                                    <div>
                                        <strong>Cash on Delivery (COD)</strong>
                                        <p className="mb-0 text-muted small">Pay with cash when your furniture arrives.</p>
                                    </div>
                                    <div className="ms-auto h2 mb-0">💵</div>
                                </div>

                                {/* OPTION 2: ONLINE (BKASH/CARDS) */}
                                <div 
                                    className={`p-3 border rounded mb-3 d-flex align-items-center cursor-pointer ${paymentMethod === 'ONLINE' ? 'border-primary bg-light' : ''}`}
                                    onClick={() => setPaymentMethod('ONLINE')}
                                    style={{ cursor: 'pointer', transition: '0.2s' }}
                                >
                                    <Form.Check type="radio" name="pay" checked={paymentMethod === 'ONLINE'} readOnly className="me-3" />
                                    <div className="flex-grow-1">
                                        <strong>Online Payment</strong>
                                        <p className="mb-0 text-muted small">Secure payment via SSLCommerz</p>
                                        <div className="d-flex gap-2 mt-2">
                                            {/* PAYMENT LOGOS */}
                                            <Badge bg="danger">Bkash</Badge>
                                            <Badge bg="warning" text="dark">Nagad</Badge>
                                            <Badge bg="primary">Visa</Badge>
                                            <Badge bg="dark">Mastercard</Badge>
                                            <Badge bg="info">Amex</Badge>
                                        </div>
                                    </div>
                                </div>

                                <Button variant="success" size="lg" className="w-100 mt-3" onClick={handlePayment} disabled={processing}>
                                    {processing ? <Spinner size="sm" animation="border" /> : (paymentMethod === 'COD' ? `Place Order (৳${cartTotal})` : `Pay Now (৳${cartTotal})`)}
                                </Button>
                            </Card.Body>
                        </Card>
                    )}
                </Col>

                {/* RIGHT: Order Summary */}
                <Col md={4}>
                    <Card className="border-0 shadow-sm bg-light">
                        <Card.Body>
                            <h5 className="mb-3">Order Summary</h5>
                            {cartItems.map(item => (
                                <div key={item.cartId} className="d-flex justify-content-between mb-2 small">
                                    <span>{item.name} x {item.quantity}</span>
                                    <span>৳{item.price * item.quantity}</span>
                                </div>
                            ))}
                            <hr />
                            <div className="d-flex justify-content-between fw-bold fs-5">
                                <span>Total</span>
                                <span>৳{cartTotal}</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* --- MOCK PAYMENT GATEWAY MODAL --- */}
            <Modal show={showPayModal} onHide={() => setShowPayModal(false)} centered backdrop="static">
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>
                        <span className="me-2">🔒</span> Secure Payment Gateway
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 text-center">
                    <p className="text-muted mb-4">Simulating transaction...</p>
                    
                    {/* Mock Card Input */}
                    <div className="text-start bg-white p-3 border rounded mb-4 shadow-sm">
                        <div className="d-flex justify-content-between mb-3">
                            <span className="fw-bold">Pay With:</span>
                            <div>
                                <span className="me-2 text-primary fw-bold">VISA</span>
                                <span className="text-danger fw-bold">bkash</span>
                            </div>
                        </div>
                        <Form.Control placeholder="Card / Mobile Number" className="mb-2" />
                        <Row>
                            <Col><Form.Control placeholder="MM/YY" /></Col>
                            <Col><Form.Control placeholder="CVC / PIN" type="password" /></Col>
                        </Row>
                    </div>

                    <div className="d-grid gap-2">
                        <Button variant="success" size="lg" onClick={confirmOnlinePayment} disabled={payProcessing}>
                            {payProcessing ? 'Processing Transaction...' : `Confirm Payment ৳${cartTotal}`}
                        </Button>
                        <Button variant="link" onClick={() => setShowPayModal(false)} className="text-muted text-decoration-none">Cancel Transaction</Button>
                    </div>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default Checkout;