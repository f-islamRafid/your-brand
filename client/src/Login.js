import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios'; // Added this

function Login({ setToken }) { // Destructured setToken from props
    const [email, setEmail] = useState(''); // Added email state
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Note: Use your actual backend URL
            const res = await axios.post('http://localhost:5000/api/login', { email, password });
            
            // This updates the token in App.js
            setToken(res.data.token); 
            
        } catch (err) {
            setError(err.response?.data?.message || "Login Failed. Check credentials.");
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <Card className="shadow-lg border-0 p-4 animate__animated animate__fadeInDown" style={{ maxWidth: '400px', width: '100%', borderRadius: '15px' }}>
                <Card.Body>
                    <div className="text-center mb-4">
                        <h2 className="mb-1">Admin Access</h2>
                        <p className="text-muted small">Enter your credentials</p>
                    </div>

                    {error && <Alert variant="danger" className="py-2 text-center">{error}</Alert>}

                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-muted small fw-bold text-uppercase">Email</Form.Label>
                            <Form.Control 
                                type="email" 
                                placeholder="admin@example.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="text-muted small fw-bold text-uppercase">Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                placeholder="••••••••" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button variant="success" type="submit" className="w-100 py-2 fw-bold">
                            Unlock Dashboard
                        </Button>
                    </Form>
                    
                    <div className="text-center mt-4">
                        <a href="/" className="text-muted small text-decoration-none">&larr; Return to Shop</a>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Login;