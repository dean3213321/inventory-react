// src/modals/AddSupplierModal.js
import React from "react";
import { Modal, Button, Form } from '../utils/bootstrap-imports.js';

const AddSupplierModal = ({ show, onHide, onSave }) => {
    const [formData, setFormData] = React.useState({
        companyName: '',
        itemsProvided: '',
        address: '',
        phoneNumber: '',
        email: '',
        rating: 0
    });
    const [hover, setHover] = React.useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Add New Supplier</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Company Name *</Form.Label>
                        <Form.Control
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Items Provided</Form.Label>
                        <Form.Control
                            type="text"
                            name="itemsProvided"
                            value={formData.itemsProvided}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Rating</Form.Label>
                        <div className="star-rating">
                            {[...Array(5)].map((_, i) => {
                                const ratingValue = i + 1;
                                return (
                                    <label key={i} className="star-label">
                                        <input
                                            type="radio"
                                            name="rating"
                                            value={ratingValue}
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                rating: ratingValue
                                            }))}
                                            className="d-none"
                                        />
                                        <i
                                            className={`bi ${ratingValue <= (hover || formData.rating) ? "bi-star-fill text-warning" : "bi-star text-secondary"}`}
                                            onMouseEnter={() => setHover(ratingValue)}
                                            onMouseLeave={() => setHover(null)}
                                            style={{ fontSize: "1.5rem", cursor: "pointer" }}
                                        />
                                    </label>
                                );
                            })}
                        </div>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Close
                    </Button>
                    <Button variant="primary" type="submit">
                        Save Supplier
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddSupplierModal;