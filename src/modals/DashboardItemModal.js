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
    const [availableProducts, setAvailableProducts] = useState([]); // Track available quantities

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${URL}/api/Products`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setProducts(data);

                // Initialize availableProducts with initial quantities
                const initialAvailable = data.reduce((acc, product) => {
                    acc[product.id] = product.quantity;
                    return acc;
                }, {});
                setAvailableProducts(initialAvailable);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        if (show) {
            fetchProducts();
            setCart([]); // Clear cart
        }
    }, [show]);


    useEffect(() => {
      const selected = products.find(p => p.product_name === selectedProduct);
      if (selected) {
          // Use availableProducts to determine maxQuantity
          const availableQuantity = availableProducts[selected.id] || 0;
          setMaxQuantity(availableQuantity);
          setTotalPrice(selected.selling_price * Math.min(quantity, availableQuantity)); // Limit quantity to available
      } else {
          setTotalPrice(0);
          setMaxQuantity(0);
      }
  }, [selectedProduct, quantity, products, availableProducts]);

    const handleProductChange = (e) => {
        setSelectedProduct(e.target.value);
        setQuantity(1); // Reset quantity
    };

    const handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value, 10);
        setQuantity(Math.max(1, Math.min(newQuantity, maxQuantity))); // Keep within [1, maxQuantity]
    };

    const handleAddToCart = () => {
        const selected = products.find(p => p.product_name === selectedProduct);
        if (!selected) {
            console.warn("Selected product not found.");
            return;
        }

        const availableQuantity = availableProducts[selected.id] || 0;
        if (availableQuantity === 0) return;  // Don't add if no stock


        const quantityToAdd = Math.min(quantity, availableQuantity);
        const existingCartItemIndex = cart.findIndex(item => item.id === selected.id);

        if (existingCartItemIndex > -1) {
            // Update existing cart item
            const updatedCart = [...cart];
            const currentCartQuantity = updatedCart[existingCartItemIndex].quantity;
            const newTotalQuantity = currentCartQuantity + quantityToAdd;

              // Check if adding exceeds available quantity.
              if (newTotalQuantity > selected.quantity){
                return;
              }

            updatedCart[existingCartItemIndex] = {
                ...updatedCart[existingCartItemIndex],
                quantity: newTotalQuantity,
                totalPrice: newTotalQuantity * selected.selling_price,
            };
            setCart(updatedCart);
        } else {
            // Add new item to cart
            setCart([...cart, {
                id: selected.id,
                product_name: selected.product_name,
                quantity: quantityToAdd,
                price: selected.selling_price,
                totalPrice: quantityToAdd * selected.selling_price
            }]);
        }


        // Update availableProducts
        setAvailableProducts(prevAvailable => ({
            ...prevAvailable,
            [selected.id]: availableQuantity - quantityToAdd
        }));

        // Reset
        setSelectedProduct('');
        setQuantity(1);
    };
    const handleRemoveFromCart = (productId) => {
      const removedItem = cart.find(item => item.id === productId);
      const updatedCart = cart.filter(item => item.id !== productId);
      setCart(updatedCart);

      // Restore quantity to availableProducts
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
                                        disabled={availableQuantity === 0} // Disable if no stock
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
            />
        </>
    );
};

export default DashboardItemModal;