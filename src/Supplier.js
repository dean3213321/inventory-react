import React, { useState, useEffect } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DataTable, DT } from "./utils/datatables-imports.js";
import AddSupplierModal from './modals/AddSupplierModal.js';
import './styling/Supplier.css';

DataTable.use(DT);

const Supplier = () => {
    const URL = process.env.REACT_APP_URL;

    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const columns = [
        { title: "Company Name", data: "companyName" },
        { title: "Items Provided", data: "itemsProvided" },
        { title: "Address", data: "address" },
        { title: "Phone Number", data: "phoneNumber" },
        { title: "Email", data: "email" },
        { 
            title: "Rating", 
            data: "rating",
            render: (data) => {
                let ratingValue = 0;
                
                if (typeof data === 'number') {
                    ratingValue = data;
                } else if (typeof data === 'string') {
                    const numMatch = data.match(/\d+/);
                    ratingValue = numMatch ? parseInt(numMatch[0], 10) : 0;
                } else if (data && typeof data === 'object') {
                    ratingValue = data.value || data.rating || data.stars || 0;
                }
                
                ratingValue = Math.max(0, Math.min(5, ratingValue));
                
                const starIcons = (
                    <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <i
                                key={star}
                                className={`bi ${
                                    star <= ratingValue 
                                        ? "bi-star-fill text-warning" 
                                        : "bi-star text-secondary"
                                }`}
                                style={{ fontSize: "1.2rem", marginRight: "2px" }}
                            />
                        ))}
                    </div>
                );
                
                // Convert the React element to a static HTML string so DataTable can render it
                return renderToStaticMarkup(starIcons);
            }
        },
    ];

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await fetch(`${URL}/api/Supplier`);
                if (!response.ok) {
                    throw new Error("Failed to fetch suppliers");
                }
                const data = await response.json();
                
                const transformedData = data.map(supplier => ({
                    ...supplier,
                    rating: supplier.rating || 0
                }));
                
                setSuppliers(transformedData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSuppliers();
    }, [URL]);

    const handleAddSupplier = async (supplierData) => {
        try {
            const response = await fetch(`${URL}/api/addSupplier`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(supplierData),
            });

            if (!response.ok) {
                throw new Error('Failed to add supplier');
            }

            const newSupplier = await response.json();
            setSuppliers(prev => [...prev, newSupplier]);
            setShowModal(false);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return <div className="loading-message">Loading suppliers...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="supplier-page">
            <div className="supplier-header">
                <h2>Suppliers</h2>
                <span 
                    className="add-supplier-text" 
                    onClick={() => setShowModal(true)}
                    style={{
                        cursor: 'pointer',
                        color: '#007bff',
                        textDecoration: 'underline',
                        fontSize: '1.2em'
                    }}
                >
                    Add Supplier
                </span>
            </div>
            
            <DataTable
                className="display cell-border"
                columns={columns}
                data={suppliers}
                options={{
                    responsive: true,
                    select: true,
                    dom: '<"d-flex justify-content-between"lf>rt<"d-flex justify-content-between"ip>B',
                    buttons: ["copy", "csv", "excel", "pdf", "print", "colvis"],
                }}
            />
            
            <AddSupplierModal
                show={showModal}
                onHide={() => setShowModal(false)}
                onSave={handleAddSupplier}
            />
        </div>
    );
};

export default Supplier;
