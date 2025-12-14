import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Row, Col, Spinner, Alert, Form, Badge, Dropdown, Button } from 'react-bootstrap';
import { FaFilter, FaStar, FaEllipsisV, FaCheckCircle, FaEyeSlash, FaTrashAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Helper to render star icons
const StarRating = ({ rating }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <FaStar 
                key={i} 
                className={i <= rating ? 'text-warning' : 'text-muted opacity-50'} 
            />
        );
    }
    return <span className="d-flex align-items-center">{stars}</span>;
};

// Helper to get status badge color
const getStatusVariant = (status) => {
    switch (status) {
        case 'APPROVED': return 'success';
        case 'PENDING': return 'warning';
        case 'HIDDEN': return 'secondary';
        default: return 'light';
    }
};

function ReviewManager() {
    // 1. STATE MANAGEMENT
    const [reviews, setReviews] = useState([]); // Now starts empty, fetching real data
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [ratingFilter, setRatingFilter] = useState('ALL');

    // 2. FETCH FUNCTION (UPDATED)
    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            // CALLING THE NEW API ROUTE
            const res = await fetch('/api/admin/reviews'); 
            const data = await res.json();
            
            if (res.ok) {
                setReviews(data);
            } else {
                // Display error message from the server if fetching failed
                toast.error(data.error || "Failed to fetch reviews from API.");
                setReviews([]);
            }
        } catch (error) {
            console.error('Network or Parse Error:', error);
            toast.error("Network error while loading reviews.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);
    
    // 3. MODERATION HANDLER (UPDATED)
    const handleAction = async (reviewId, action) => {
        const url = `/api/admin/reviews/${reviewId}/status`;
        let method = 'PUT';
        let body = {};
        let successMessage = '';
        let newStatus = '';

        if (action === 'approve') {
            newStatus = 'APPROVED';
            successMessage = `Review ${reviewId} Approved!`;
            body = { status: newStatus };
        } else if (action === 'hide') {
            newStatus = 'HIDDEN';
            successMessage = `Review ${reviewId} Hidden.`;
            body = { status: newStatus };
        } else if (action === 'delete') {
            method = 'DELETE';
            successMessage = `Review ${reviewId} Deleted permanently.`;
        }

        try {
            const options = {
                method: method,
                headers: { 'Content-Type': 'application/json' },
            };
            // Only add body for PUT requests
            if (method === 'PUT') {
                 options.body = JSON.stringify(body);
            }

            const res = await fetch(action === 'delete' ? `/api/admin/reviews/${reviewId}` : url, options);
            const data = await res.json();

            if (res.ok) {
                toast.success(successMessage);
                // Optimistically update the UI or refetch for consistency
                if (action === 'delete') {
                    setReviews(prev => prev.filter(r => r.review_id !== reviewId));
                } else {
                    // Update status locally for PUT request
                    setReviews(prev => prev.map(r => 
                        r.review_id === reviewId ? {...r, status: newStatus} : r
                    ));
                }
            } else {
                toast.error(data.error || `Failed to perform ${action} action.`);
            }

        } catch (error) {
            toast.error("Network error during moderation.");
        }
    };

    // Filter Logic (Same as before)
    const filteredReviews = reviews.filter(review => {
        const matchesStatus = statusFilter === 'ALL' || review.status === statusFilter;
        const matchesRating = ratingFilter === 'ALL' || review.rating.toString() === ratingFilter;
        return matchesStatus && matchesRating;
    });

    if (loading) {
        return <Container fluid className="py-5 text-center"><Spinner animation="border" className='text-success' /></Container>;
    }

    // 4. RENDER FUNCTION (Same as before, now using real data)
    return (
        <Container fluid className="p-0">
            <h2 className="mb-5 fw-bold">Review Management</h2>

            {/* Filter and Stats Bar */}
            <Card className="mb-4 shadow-sm border-0 p-3">
                <Row className="g-3 align-items-center">
                    <Col md={4} className="d-flex align-items-center">
                        <FaFilter className="me-2 text-muted" />
                        <span className="fw-bold me-3">Filters:</span>
                    </Col>
                    
                    {/* Status Filter */}
                    <Col md={4}>
                        <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="ALL">All Statuses</option>
                            <option value="PENDING">Pending ({reviews.filter(r => r.status === 'PENDING').length})</option>
                            <option value="APPROVED">Approved</option>
                            <option value="HIDDEN">Hidden</option>
                        </Form.Select>
                    </Col>

                    {/* Rating Filter */}
                    <Col md={4}>
                        <Form.Select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
                            <option value="ALL">All Ratings</option>
                            <option value="5">★★★★★ (5 Stars)</option>
                            <option value="4">★★★★☆ (4 Stars)</option>
                            <option value="3">★★★☆☆ (3 Stars)</option>
                            <option value="2">★★☆☆☆ (2 Stars)</option>
                            <option value="1">★☆☆☆☆ (1 Star)</option>
                        </Form.Select>
                    </Col>
                </Row>
            </Card>

            {/* Review List */}
            {filteredReviews.length === 0 ? (
                <Alert variant="info" className="shadow-sm">No reviews match the current filter criteria.</Alert>
            ) : (
                <div className="d-grid gap-3">
                    {filteredReviews.map(review => (
                        <Card key={review.review_id} className="border-0 shadow-sm">
                            <Card.Body className="d-flex justify-content-between align-items-start">
                                {/* Review Details */}
                                <div style={{ flexGrow: 1, paddingRight: '20px' }}>
                                    <p className="mb-1">
                                        <StarRating rating={review.rating} /> 
                                        <Badge bg={getStatusVariant(review.status)} className="ms-3 py-1 px-2 fw-normal">{review.status}</Badge>
                                    </p>
                                    
                                    <p className="fw-bold mb-1 text-dark">{review.content}</p>
                                    <small className="text-muted d-block">
                                        by <span className="fw-semibold">{review.customer_name}</span> on **{review.product_name}**
                                    </small>
                                </div>

                                {/* Actions */}
                                <div className="text-end">
                                    <small className="text-muted d-block mb-2">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </small>
                                    <Dropdown align="end">
                                        <Dropdown.Toggle variant="light" size="sm" id={`dropdown-actions-${review.review_id}`}>
                                            <FaEllipsisV />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item 
                                                onClick={() => handleAction(review.review_id, 'approve')} 
                                                disabled={review.status === 'APPROVED'}
                                                className="text-success"
                                            >
                                                <FaCheckCircle className="me-2" /> Approve
                                            </Dropdown.Item>
                                            <Dropdown.Item 
                                                onClick={() => handleAction(review.review_id, 'hide')}
                                                disabled={review.status === 'HIDDEN'}
                                                className="text-secondary"
                                            >
                                                <FaEyeSlash className="me-2" /> Hide
                                            </Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Dropdown.Item 
                                                onClick={() => window.confirm(`Are you sure you want to permanently delete review #${review.review_id}?`) && handleAction(review.review_id, 'delete')} 
                                                className="text-danger"
                                            >
                                                <FaTrashAlt className="me-2" /> Delete
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}
        </Container>
    );
}

export default ReviewManager;