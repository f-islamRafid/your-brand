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
                        <Card.Body className="p-4 text-center">
                            <h3 className="mb-4" style={{ color: '#4A5D45', fontFamily: 'Playfair Display, serif' }}>Contact Information</h3>
                            
                            {/* TRICK: Use d-inline-block + text-start.
                                This centers the whole block inside the card, 
                                but keeps the icons on the left of the text! 
                            */}
                            <div className="d-inline-block text-start">
                                
                                {/* 1. ADDRESS */}
                                <div className="d-flex align-items-start mb-4">
                                    <div className="me-3 mt-1" style={{ fontSize: '1.5rem' }}>📍</div>
                                    <div>
                                        <h6 className="fw-bold mb-1">Our Showroom</h6>
                                        <p className="text-muted mb-0">
                                            698 North Shahjahanpur<br />
                                            Dhaka, Bangladesh
                                        </p>
                                    </div>
                                </div>

                                {/* 2. PHONE */}
                                <div className="d-flex align-items-start mb-4">
                                    <div className="me-3 mt-1" style={{ fontSize: '1.5rem' }}>📞</div>
                                    <div>
                                        <h6 className="fw-bold mb-1">Phone</h6>
                                        <p className="text-muted mb-0" style={{fontSize: '1.1rem', fontWeight: '500'}}>
                                            01715-287749
                                        </p>
                                        <small className="text-muted d-block">Open: Friday - Wednesday</small>
                                        <small className="text-danger fw-bold">Off Day: Thursday</small>
                                    </div>
                                </div>

                                {/* 3. EMAIL (New Visible Icon) */}
                                <div className="d-flex align-items-center mb-4">
                                    <div className="me-3">
                                        {/* High Visibility SVG Icon */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#6f42c1" className="bi bi-envelope-fill" viewBox="0 0 16 16">
                                            <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-1">Email</h6>
                                        <p className="text-muted mb-0">
                                            homedecor1975@gmail.com
                                        </p>
                                    </div>
                                </div>

                            </div>

                            <hr style={{ opacity: 0.1, margin: '1rem 0 2rem 0' }} />
                            
                            {/* 4. SOCIAL MEDIA (Centered) */}
                            <div>
                                <h6 className="fw-bold mb-3">Follow Us</h6>
                                <div className="d-flex gap-3 justify-content-center">
                                    
                                    {/* FACEBOOK */}
                                    <a href="https://www.facebook.com/HOMEDECOR998" target="_blank" rel="noreferrer" title="Follow us on Facebook" style={{ transition: 'transform 0.2s' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="#1877F2" viewBox="0 0 16 16">
                                            <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                                        </svg>
                                    </a>

                                    {/* Instagram Placeholder */}
                                    <div style={{ opacity: 0.3, cursor: 'not-allowed' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.281.11-.705.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.047-1.096-.047-3.232 0-2.136.009-2.388.047-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.09-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Column: Message Form (Unchanged) */}
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