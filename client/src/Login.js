import React, { useState } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import axios from 'axios';
import toast from 'react-hot-toast';

function Login({ setToken }) { // Receive setToken from App.js
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            
            if (res.data.token) {
                // This updates App.js and triggers the useEffect to save it
                setToken(res.data.token); 
                toast.success("Welcome, Admin!");
            }
        } catch (err) {
            toast.error("Invalid Credentials");
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <Card className="shadow-lg border-0" style={{ width: '400px' }}>
                <Card.Body className="p-5">
                    <h2 className="text-center mb-4 fw-bold">Admin Login</h2>
                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" onChange={(e) => setEmail(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" onChange={(e) => setPassword(e.target.value)} required />
                        </Form.Group>
                        <Button variant="success" type="submit" className="w-100">Login</Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Login;