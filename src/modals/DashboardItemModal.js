import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import ReceiptModal from '../modals/DashboardReceiptModal.js';

const URL = process.env.REACT_APP_URL;

const DashboardItemModal = ({ show, onHide, customerData }) => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [maxQuantity, setMaxQuantity] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [cart, setCart] = useState([]);
    const [showReceipt, setShowReceipt] = useState(false);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [userPosition, setUserPosition] = useState(null); // Track user's position

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${URL}/api/Products`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setProducts(data);

                const initialAvailable = data.reduce((acc, product) => {
                    acc[product.id] = product.quantity;
                    return acc;
                }, {});
                setAvailableProducts(initialAvailable);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        const fetchUserPosition = async () => {
            if (customerData?.rfid) {
                try {
                    const response = await fetch(`${URL}/api/Dashboard/getname`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ rfid: customerData.rfid }),
                    });

                    const data = await response.json();
                    if (response.ok) {
                        setUserPosition(data.position);
                    }
                } catch (error) {
                    console.error("Error fetching user position:", error);
                }
            }
        };

        if (show) {
            fetchProducts();
            fetchUserPosition();
            setCart([]);
        }
    }, [show, customerData]);

    useEffect(() => {
        const selected = products.find(p => p.product_name === selectedProduct);
        if (selected) {
            const availableQuantity = availableProducts[selected.id] || 0;
            setMaxQuantity(availableQuantity);
            
            // Check if user has a special position that gets free items
            const isFreeUser = userPosition && ['Student', 'Gatepass', 'Intern'].includes(userPosition);
            const calculatedPrice = isFreeUser ? 0 : selected.selling_price * Math.min(quantity, availableQuantity);
            
            setTotalPrice(calculatedPrice);
        } else {
            setTotalPrice(0);
            setMaxQuantity(0);
        }
    }, [selectedProduct, quantity, products, availableProducts, userPosition]);

    const handleProductChange = (e) => {
        setSelectedProduct(e.target.value);
        setQuantity(1);
    };

    const handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value, 10);
        setQuantity(Math.max(1, Math.min(newQuantity, maxQuantity)));
    };

    const handleAddToCart = () => {
        const selected = products.find(p => p.product_name === selectedProduct);
        if (!selected) {
            console.warn("Selected product not found.");
            return;
        }

        const availableQuantity = availableProducts[selected.id] || 0;
        if (availableQuantity === 0) return;

        const quantityToAdd = Math.min(quantity, availableQuantity);
        const existingCartItemIndex = cart.findIndex(item => item.id === selected.id);

        // Check if user has a special position that gets free items
        const isFreeUser = userPosition && ['Student', 'Gatepass', 'Intern'].includes(userPosition);
        const itemPrice = isFreeUser ? 0 : selected.selling_price;

        if (existingCartItemIndex > -1) {
            const updatedCart = [...cart];
            const currentCartQuantity = updatedCart[existingCartItemIndex].quantity;
            const newTotalQuantity = currentCartQuantity + quantityToAdd;

            if (newTotalQuantity > selected.quantity) {
                return;
            }

            updatedCart[existingCartItemIndex] = {
                ...updatedCart[existingCartItemIndex],
                quantity: newTotalQuantity,
                price: itemPrice, // Update price in case it changed
                totalPrice: newTotalQuantity * itemPrice,
            };
            setCart(updatedCart);
        } else {
            setCart([...cart, {
                id: selected.id,
                product_name: selected.product_name,
                quantity: quantityToAdd,
                price: itemPrice,
                totalPrice: quantityToAdd * itemPrice
            }]);
        }

        setAvailableProducts(prevAvailable => ({
            ...prevAvailable,
            [selected.id]: availableQuantity - quantityToAdd
        }));

        setSelectedProduct('');
        setQuantity(1);
    };

    const handleRemoveFromCart = (productId) => {
        const removedItem = cart.find(item => item.id === productId);
        const updatedCart = cart.filter(item => item.id !== productId);
        setCart(updatedCart);

        if (removedItem) {
            setAvailableProducts(prevAvailable => ({
                ...prevAvailable,
                [productId]: (prevAvailable[productId] || 0) + removedItem.quantity
            }));
        }
    };

    const handleNext = () => {
        setShowReceipt(true);
    };

    const handleReceiptClose = () => {
        setShowReceipt(false);
        onHide();
        setCart([]);
    };

    return (
        <>
            <Modal show={show} onHide={onHide}>
                <Modal.Header closeButton>
                    <Modal.Title>Print Receipt</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {customerData && (
                        <div className="mb-3">
                            <h5>Buyer: {customerData.firstName} {customerData.lastName}</h5>
                            {customerData.rfid && <p><strong>RFID:</strong> {customerData.rfid}</p>}
                            {userPosition && ['Student', 'Gatepass', 'Intern'].includes(userPosition) && (
                                <p className="text-success"><strong>Employee Pricing: FREE</strong></p>
                            )}
                        </div>
                    )}
                    <Form.Group>
                        <Form.Label>Product Name</Form.Label>
                        <Form.Control as="select" value={selectedProduct} onChange={handleProductChange}>
                            <option value="">Select a product</option>
                            {products.map((product) => {
                                const availableQuantity = availableProducts[product.id] || 0;
                                return (
                                    <option
                                        key={product.id}
                                        value={product.product_name}
                                        disabled={availableQuantity === 0}
                                    >
                                        {product.product_name} ({availableQuantity} available)
                                    </option>
                                );
                            })}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Quantity (Max: {maxQuantity})</Form.Label>
                        <Form.Control
                            type="number"
                            value={quantity}
                            onChange={handleQuantityChange}
                            min="1"
                            max={maxQuantity}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Total Price</Form.Label>
                        <Form.Control
                            type="text"
                            value={`₱${totalPrice.toFixed(2)}`}
                            readOnly
                        />
                    </Form.Group>
                    <Button variant="primary" onClick={handleAddToCart} disabled={!selectedProduct || maxQuantity === 0}>
                        Add to Cart
                    </Button>

                    {cart.length > 0 && (
                        <div className="mt-3">
                            <h5>Cart:</h5>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.product_name}</td>
                                            <td>{item.quantity}</td>
                                            <td>₱{item.price.toFixed(2)}</td>
                                            <td>₱{item.totalPrice.toFixed(2)}</td>
                                            <td>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleRemoveFromCart(item.id)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="3"><strong>Grand Total:</strong></td>
                                        <td>
                                            <strong>
                                                ₱{cart.reduce((acc, curr) => acc + curr.totalPrice, 0).toFixed(2)}
                                            </strong>
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Cancel
                    </Button>
                    <Button variant="primary" disabled={cart.length === 0} onClick={handleNext}>
                        Next
                    </Button>
                </Modal.Footer>
            </Modal>

            <ReceiptModal
                show={showReceipt}
                onHide={handleReceiptClose}
                customerData={customerData}
                cart={cart}
                userPosition={userPosition}
            />
        </>
    );
};

export default DashboardItemModal;