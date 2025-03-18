import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import DashboardItemModal from './DashboardItemModal.js';

const URL = process.env.REACT_APP_URL;

const DashboardModal = ({ show, onHide }) => {
  const [view, setView] = useState('initial'); // 'initial', 'withRFID', 'withoutRFID'
  const [rfidInput, setRfidInput] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [showExistingUsersDropdown, setShowExistingUsersDropdown] = useState(false);
  const [existingBuyers, setExistingBuyers] = useState([]);

  // Fetch existing buyers when the modal is shown and the view is 'withRFID'
  useEffect(() => {
    if (view === 'withRFID') {
      fetchExistingBuyers();
    }
  }, [view]);

  const handleWithRFIDClick = () => {
    setView('withRFID');
  };

  const handleWithoutRFIDClick = () => {
    setView('withoutRFID');
  };

  const handleRFIDInput = (e) => {
    setRfidInput(e.target.value);
  };

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
  };

  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
  };

  const handleNext = async () => {
    let newCustomerData;

    if (view === 'withRFID') {
      try {
        const response = await fetch(`${URL}/api/Dashboard/getname`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rfid: rfidInput }),
        });

        const data = await response.json();
        if (!response.ok) {
          alert(data.error || "User not found");
          return;
        }
        newCustomerData = { firstName: data.fname, lastName: data.lname, rfid: rfidInput };
      } catch (error) {
        console.error("Error fetching user data:", error);
        return;
      }
    } else {
      newCustomerData = { firstName, lastName };
    }

    setCustomerData(newCustomerData);
    setShowPrintModal(true); // Open the item selection modal
  };

  const handleBack = () => {
    setView('initial');
    setShowExistingUsersDropdown(false);
  };

  const handlePrintModalClose = () => {
    setShowPrintModal(false);
    onHide(); // Close the initial modal after closing PrintReceiptModal
    setView('initial');

    // Reset the forms
    setRfidInput('');
    setFirstName('');
    setLastName('');
  };

  const fetchExistingBuyers = async () => {
    try {
      const response = await fetch(`${URL}/api/Dashboard/Buyerdropdown`);
      const data = await response.json();
      if (response.ok) {
        setExistingBuyers(data);
      } else {
        alert(data.error || "Failed to fetch existing buyers");
      }
    } catch (error) {
      console.error("Error fetching existing buyers:", error);
    }
  };

  const handleExistingBuyerSelect = (buyer) => {
    setFirstName(buyer.fname);
    setLastName(buyer.lname);
    setShowExistingUsersDropdown(false);

    // Set customer data and open the item selection modal
    const newCustomerData = { firstName: buyer.fname, lastName: buyer.lname };
    setCustomerData(newCustomerData);
    setShowPrintModal(true); // Open the item selection modal
  };

  return (
    <>
      <Modal show={show} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Print Receipt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {view === 'initial' && <p>Select a Payment Method:</p>}

          {view === 'withRFID' && (
            <Form.Group>
              <Form.Label>RFID Input</Form.Label>
              <Form.Control
                type="text"
                placeholder="Scan RFID"
                autoFocus
                value={rfidInput}
                onChange={handleRFIDInput}
              />
            </Form.Group>
          )}

          {view === 'withoutRFID' && (
            <>
              <Form.Group>
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={handleFirstNameChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={handleLastNameChange}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {view === 'initial' && (
            <>
              <Button variant="primary" onClick={handleWithRFIDClick}>
                WITH RFID
              </Button>
              <Button variant="secondary" onClick={handleWithoutRFIDClick}>
                WITHOUT RFID
              </Button>
            </>
          )}

          {view === 'withRFID' && (
            <>
              <Button variant="info" onClick={() => setShowExistingUsersDropdown(!showExistingUsersDropdown)}>
                Existing Users
              </Button>
              {showExistingUsersDropdown && (
                <Form.Control
                  as="select"
                  onChange={(e) => handleExistingBuyerSelect(JSON.parse(e.target.value))}
                >
                  <option value="">Select an existing buyer</option>
                  {existingBuyers.map((buyer) => (
                    <option key={buyer.buyer_id} value={JSON.stringify(buyer)}>
                      {buyer.fname} {buyer.lname}
                    </option>
                  ))}
                </Form.Control>
              )}
              <Button variant="secondary" onClick={handleBack}>
                Back
              </Button>
              <Button variant="primary" onClick={handleNext}>
                Next
              </Button>
            </>
          )}

          {view === 'withoutRFID' && (
            <>
              <Button variant="secondary" onClick={handleBack}>
                Back
              </Button>
              <Button variant="primary" onClick={handleNext}>
                Next
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
      <DashboardItemModal
        show={showPrintModal}
        onHide={handlePrintModalClose}
        customerData={customerData}
      />
    </>
  );
};

export default DashboardModal;