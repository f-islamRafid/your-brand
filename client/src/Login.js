import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // The Secret PIN is "932808"
        if (password === '932808') {
            localStorage.setItem('admin_token', 'true');
            navigate('/admin'); 
        } else {
            setError('Invalid Access PIN');
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <Card className="shadow-lg border-0 p-4 animate__animated animate__fadeInDown" style={{ maxWidth: '400px', width: '100%', borderRadius: '15px' }}>
                <Card.Body>
                    <div className="text-center mb-4">
                        <h2 className="mb-1">Admin Access</h2>
                        <p className="text-muted small">Restricted Area</p>
                    </div>

                    {error && <Alert variant="danger" className="py-2 text-center">{error}</Alert>}

                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-4">
                            <Form.Label className="text-muted small fw-bold text-uppercase">Security PIN</Form.Label>
                            <Form.Control 
                                type="password" 
                                placeholder="••••••••" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ fontSize: '1.2rem', letterSpacing: '2px', textAlign: 'center', padding: '10px' }}
                                autoFocus
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100 py-2">
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