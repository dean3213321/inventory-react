import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-bootstrap";
import "../styling/Products.css";

// Import DataTable and DT from the utils folder
import { DataTable, DT } from "../utils/datatables-imports.js";

// Bootstrap CSS and icons imported for styling
import { Button, Modal } from '../utils/bootstrap-imports.js';


DataTable.use(DT);

const Products = () => {
  const URL = process.env.REACT_APP_URL;

  const [showAlert, setShowAlert] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [newProductName, setNewProductName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newSellingPrice, setNewSellingPrice] = useState("");
  const [updateProductName, setUpdateProductName] = useState("");
  const [updateQuantity, setUpdateQuantity] = useState("");
  const [updateSellingPrice, setUpdateSellingPrice] = useState("");
  const [updateId, setUpdateId] = useState(null);
  const [error, setError] = useState(null);
  const [totalSupplies, setTotalSupplies] = useState(0);
  const [lowStockItems, setLowStockItems] = useState(0);
  const [message, setMessage] = useState("");

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const columns = [
    { title: "Item", data: "product_name" },
    { title: "Quantity", data: "quantity" },
    {
      title: "Date",
      data: "date",
      render: function (data) {
        return formatDate(data);
      },
    },
    { title: "Selling Price", data: "selling_price" },
    {
      title: "Actions",
      data: null,
      render: function (data, type, row) {
        return `
                    <button class="btn btn-primary btn-sm update-button" data-id="${row.id}">
                        <i class="bi bi-pencil-fill"></i> Update
                    </button>
                    <button class="btn btn-danger btn-sm delete-button" data-id="${row.id}">
                        <i class="bi bi-trash-fill"></i> Delete
                    </button>
                `;
      },
      orderable: false,
      searchable: false,
    },
  ];

    const validateInputs = (productName, quantity, sellingPrice) => { // Added productName
    if (!productName.trim()) {
      throw new Error("Item name cannot be empty.");
    }
    if (isNaN(quantity) || quantity < 0) {
      throw new Error("Quantity must be a valid, non-negative number.");
    }
    if (isNaN(sellingPrice) || sellingPrice < 0) {
      throw new Error("Selling price must be a valid, non-negative number.");
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const productsResponse = await fetch(`${URL}/api/Products`);
      if (!productsResponse.ok) {
        throw new Error(`HTTP error! status: ${productsResponse.status}`);
      }
      const productsData = await productsResponse.json();
      setProducts(productsData);

      const totalSuppliesResponse = await fetch(`${URL}/api/Products/total`);
      if (!totalSuppliesResponse.ok) {
        throw new Error(`HTTP error! status: ${totalSuppliesResponse.status}`);
      }
      const totalSuppliesData = await totalSuppliesResponse.json();
      setTotalSupplies(totalSuppliesData.totalSupplies);

      const lowStockResponse = await fetch(`${URL}/api/Products/low-stock`);
      if (!lowStockResponse.ok) {
        throw new Error(`HTTP error! status: ${lowStockResponse.status}`);
      }
      const lowStockData = await lowStockResponse.json();
      setLowStockItems(lowStockData.lowStockItems);

      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    }
  }, [URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = useCallback(async () => {
    try {
      const quantity = parseInt(newQuantity, 10);
      const sellingPrice = parseFloat(newSellingPrice);
      validateInputs(newProductName, quantity, sellingPrice); // Pass productName
      const requestBody = {
        product_name: newProductName,
        quantity: quantity,
        selling_price: sellingPrice,
      };

      const response = await fetch(`${URL}/api/Products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      await fetchData();
      setNewProductName("");
      setNewQuantity("");
      setNewSellingPrice("");
      setShowAddModal(false);
      setError(null);
      setMessage("Product added successfully!");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error submitting data:", error);
      setError(error.message);
    }
  }, [newProductName, newQuantity, newSellingPrice, fetchData, URL]);

  const handleUpdate = useCallback(async () => {
    try {
      const quantity = parseInt(updateQuantity, 10);
      const sellingPrice = parseFloat(updateSellingPrice);
      validateInputs(updateProductName, quantity, sellingPrice); // Pass updateProductName

      console.log("Updating product with:", {
        updateId,
        updateProductName,
        updateQuantity,
        updateSellingPrice,
      }); // Log before update

      const response = await fetch(`${URL}/api/Products/${updateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_name: updateProductName,
          quantity: quantity,
          selling_price: sellingPrice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      fetchData();
      setShowUpdateModal(false);
      setUpdateProductName("");
      setUpdateQuantity("");
      setUpdateSellingPrice("");
      setUpdateId(null);
      setError(null);
      setMessage("Product updated successfully!");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error updating product:", error);
      setError(error.message);
    }
  }, [
    updateProductName,
    updateQuantity,
    updateSellingPrice,
    updateId,
    fetchData,
    URL,
  ]);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Are you sure you want to delete this item?")) {
        return;
      }

      try {
        const response = await fetch(`${URL}/api/Products/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        fetchData();
        setError(null);
        setMessage("Product deleted successfully!");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      } catch (error) {
        console.error("Error deleting product:", error);
        setError(error.message);
      }
    },
    [fetchData, URL]
  );

  const openUpdateModal = useCallback((rowData) => {
    console.log("Opening update modal with rowData:", rowData); // CRITICAL LOG
    setUpdateId(rowData.id);
    setUpdateProductName(rowData.product_name); // Verify this line
    setUpdateQuantity(rowData.quantity);
    setUpdateSellingPrice(rowData.selling_price);
    setShowUpdateModal(true);
  }, []); // Empty dependency array means this function is created once and never recreated
  
  useEffect(() => {
    const table = document.querySelector(".products-table table");
  
    if (table) {
      const handleClick = (event) => {
        const updateButton = event.target.closest(".update-button");
        const deleteButton = event.target.closest(".delete-button");
  
        if (updateButton) {
          const id = updateButton.dataset.id;
          const rowData = products.find((row) => row.id === parseInt(id, 10));
          if (rowData) {
            openUpdateModal(rowData);
          }
        } else if (deleteButton) {
          const id = deleteButton.dataset.id;
          handleDelete(parseInt(id, 10));
        }
      };
  
      table.addEventListener("click", handleClick);
  
      return () => {
        table.removeEventListener("click", handleClick);
      };
    }
  }, [products, handleDelete, openUpdateModal]); // Now openUpdateModal is stable and won't cause unnecessary re-renders

  return (
    <div className="products-page">
      <div className="products-header">
        <h2>Products</h2>
        <h3
          className="Addproducts"
          onClick={() => setShowAddModal(true)}
          style={{ cursor: "pointer" }}
        >
          <i
            className="bi bi-cart-plus-fill"
            style={{ fontSize: "1.8rem", marginRight: "8px" }}
          ></i>
          Add Products
        </h3>
      </div>

      <div className="products-box">
        <div className="product-box">
          <i
            className="bi bi-box-fill"
            style={{ fontSize: "2rem", marginBottom: "1rem" }}
          ></i>
          <h4>Total Supplies</h4>
          <p>{totalSupplies}</p>
        </div>
        <div className="product-box">
          <i
            className="bi bi-exclamation-triangle-fill"
            style={{ fontSize: "2rem", marginBottom: "1rem" }}
          ></i>
          <h4>Low Stock Items</h4>
          <p>{lowStockItems}</p>
        </div>
      </div>

      <div className="products-table">
        {error && <p className="error-message">Error: {error}</p>}

        {showAlert && (
          <Alert
            variant="success"
            onClose={() => setShowAlert(false)}
            dismissible
            className="w-50 mx-auto text-center"
          >
            {message}
          </Alert>
        )}

        <DataTable
          className="display cell-border"
          columns={columns}
          data={products}
          options={{
            responsive: true,
            select: true,
            dom:
              '<"d-flex justify-content-between"lf>rt<"d-flex justify-content-between"ip>B',
            buttons: ["copy", "csv", "excel", "pdf", "print", "colvis"],
          }}
        />
      </div>

      {/* Add Product Modal */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        centered
        className="modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-1">Item Name</p>
          <input
            type="text"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
            className="form-control w-75"
          />

          <p className="mt-3 mb-1">Quantity</p>
          <input
            type="number"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            className="form-control w-75"
          />
          <p className="mt-3 mb-1">Selling Price</p>
          <input
            type="number"
            value={newSellingPrice}
            onChange={(e) => setNewSellingPrice(e.target.value)}
            className="form-control w-75"
          />

          {error && <p className="text-danger mt-2">Error: {error}</p>}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update Product Modal */}
      <Modal
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-1">Item Name</p>
          <input
            type="text"
            value={updateProductName}
            onChange={(e) => setUpdateProductName(e.target.value)}
            className="form-control w-75"
          />

          <p className="mt-3 mb-1">Quantity</p>
          <input
            type="number"
            value={updateQuantity}
            onChange={(e) => setUpdateQuantity(e.target.value)}
            className="form-control w-75"
          />
          <p className="mt-3 mb-1">Selling Price</p>
          <input
            type="text"
            value={updateSellingPrice}
            onChange={(e) => setUpdateSellingPrice(e.target.value)}
            className="form-control w-75"
          />
          {error && <p className="text-danger mt-2">Error: {error}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Products;