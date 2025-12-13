// client/src/Contact.js
import React from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import toast from 'react-hot-toast';

function Contact() {
    
    const handleSubmit = (e) => {
        e.preventDefault();
        // Just a visual simulation for now
        toast.success("Message sent! We'll get back to you soon.");
    };

    return (
        <Container className="py-5 animate__animated animate__fadeIn">
            <div className="text-center mb-5">
                <h1 className="display-4 fw-bold mb-3">Get in Touch</h1>
                <p className="lead text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    Have a question about our furniture? Need help with an order? 
                    Our design team is here to assist you.
                </p>
            </div>

            <Row className="justify-content-center">
                {/* Left Column: Contact Details */}
                <Col md={5} className="mb-4">
                    <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#F8F9F5' }}>
                        <Card.Body className="p-4">
                            <h3 className="mb-4" style={{ color: '#4A5D45' }}>Contact Information</h3>
                            
                            <div className="d-flex align-items-start mb-4">
                                <div className="me-3" style={{ fontSize: '1.5rem' }}>📍</div>
                                <div>
                                    <h6 className="fw-bold mb-1">Our Showroom</h6>
                                    <p className="text-muted mb-0">123 Furniture Lane, Design District<br />New York, NY 10012</p>
                                </div>
                            </div>

                            <div className="d-flex align-items-start mb-4">
                                <div className="me-3" style={{ fontSize: '1.5rem' }}>📞</div>
                                <div>
                                    <h6 className="fw-bold mb-1">Phone</h6>
                                    <p className="text-muted mb-0">+1 (555) 123-4567</p>
                                    <small className="text-muted">Mon-Fri: 9am - 6pm EST</small>
                                </div>
                            </div>

                            <div className="d-flex align-items-start mb-4">
                                <div className="me-3" style={{ fontSize: '1.5rem' }}>✉️</div>
                                <div>
                                    <h6 className="fw-bold mb-1">Email</h6>
                                    <p className="text-muted mb-0">support@homedecor.com</p>
                                </div>
                            </div>

                            <hr style={{ opacity: 0.1 }} />
                            
                            <div className="mt-4">
                                <h6 className="fw-bold mb-2">Follow Us</h6>
                                <div className="d-flex gap-3 text-muted" style={{ fontSize: '1.2rem' }}>
                                    <span style={{ cursor: 'pointer' }}>📷</span>
                                    <span style={{ cursor: 'pointer' }}>📘</span>
                                    <span style={{ cursor: 'pointer' }}>📌</span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Column: Message Form */}
                <Col md={6}>
                    <Card className="border-0 shadow-lg">
                        <Card.Body className="p-4 p-md-5">
                            <h3 className="mb-4">Send us a Message</h3>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Name</Form.Label>
                                            <Form.Control type="text" placeholder="Your Name" required />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control type="email" placeholder="Your Email" required />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Subject</Form.Label>
                                    <Form.Control type="text" placeholder="Order Inquiry / Product Question" />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Message</Form.Label>
                                    <Form.Control as="textarea" rows={4} placeholder="How can we help you?" required />
                                </Form.Group>

                                <Button variant="primary" type="submit" size="lg" className="w-100">
                                    Send Message
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Contact;