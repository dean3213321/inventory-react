import React, { useRef } from "react";
import { Modal, Button, Table } from "react-bootstrap";
import logo from "../assets/receiptLogo.png"; // Ensure you have a logo image
import html2canvas from "html2canvas";

const URL = process.env.REACT_APP_URL; // Make sure this is defined in your environment

const ReceiptModal = ({ show, onHide, customerData, cart }) => {
  const receiptRef = useRef(null);

  // Function to create a sales history record in the database
  const createSalesHistory = async () => {
    try {
      const buyerName = customerData
        ? `${customerData.firstName} ${customerData.lastName}`
        : "Guest";
      
      const rfid = customerData?.rfid; // Assuming RFID is part of customerData

      const response = await fetch(`${URL}/api/Dashboard/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ buyerName, itemsBought: cart, rfid }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === "A record with this buyerName already exists") {
          alert("A record with this buyer name already exists. Please use a different name.");
        } else {
          throw new Error(
            `Failed to create sales history: ${response.status} - ${errorData.error || "Unknown error"}`
          );
        }
      }
    } catch (error) {
      console.error("Error creating sales history:", error);
      throw error;
    }
  };

  // Function to update product quantities in the database
  const updateProductQuantities = async (cartItems) => {
    try {
      const response = await fetch(`${URL}/api/Dashboard/subitemquantity`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cartItems),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to update quantities: ${response.status} - ${errorData.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error updating product quantities:", error);
      throw error;
    }
  };

  // Handler for printing the receipt and updating the database
  const handlePrintReceipt = async () => {
    if (receiptRef.current) {
      try {
        // Generate the receipt as an image
        const canvas = await html2canvas(receiptRef.current, { scale: 2 });
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        const fileName = customerData
          ? `${customerData.firstName}_${customerData.lastName}_receipt_inventory.png`
          : "receipt.png";
        link.href = image;
        link.download = fileName;
        link.click();

        // Update product quantities in the database
        await updateProductQuantities(cart);

        // Create the sales history record
        await createSalesHistory();

        // Close the modal
        onHide();
      } catch (error) {
        console.error("Error during print or database update:", error);
        alert("An error occurred while processing the receipt. Please try again.");
      }
    }
  };

  return (
    <Modal show={show} onHide={onHide} contentClassName="no-border-radius">
      {/* Wrap header and body inside a container to capture the receipt */}
      <div ref={receiptRef}>
        <Modal.Header style={{ backgroundColor: "#502d77" }} closeButton>
          <Modal.Title>
            <img src={logo} alt="Receipt Logo" style={{ height: "50px" }} />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {customerData && (
            <div className="mb-3">
              <h5>
                Buyer: {customerData.firstName} {customerData.lastName}
              </h5>
            </div>
          )}
          {cart.length > 0 ? (
            <div>
              <h5>Cart:</h5>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>₱{item.price.toFixed(2)}</td>
                      <td>₱{item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3">
                      <strong>Grand Total:</strong>
                    </td>
                    <td>
                      <strong>
                        ₱
                        {cart
                          .reduce((acc, curr) => acc + curr.totalPrice, 0)
                          .toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          ) : (
            <p>No items in cart.</p>
          )}
        </Modal.Body>
      </div>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handlePrintReceipt}>
          Print Receipt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReceiptModal;