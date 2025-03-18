import React, { useState, useEffect } from "react";
import { DataTable, DT } from "../utils/datatables-imports.js";

DataTable.use(DT);

const Sales = () => {
  const URL = process.env.REACT_APP_URL;
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`${URL}/api/Sales/SalesHistory`)
      .then(response => response.ok ? response.json() : Promise.reject("Failed to fetch sales history data"))
      .then(({ salesHistory }) => {
        const uniqueSales = [...new Set(salesHistory.map(record => record.buyer_name || "Unknown Buyer"))]
          .map(buyer => salesHistory.find(record => (record.buyer_name || "Unknown Buyer") === buyer));
        setData(uniqueSales.map(record => ({
          buyerName: record.buyer_name || "Unknown Buyer",
          itemsBought: record.product_name ? `${record.product_name} (${record.quantity})` : "No items",
          date: record.sale_date ? new Date(record.sale_date).toLocaleDateString() : "No date",
          saleId: record.sale_id,
        })));
      })
      .catch(error => console.error("Error fetching sales history data:", error));
  }, [URL]);

  const handleDownload = async (buyerName) => {
    try {
      const response = await fetch(`${URL}/api/Sales/BuyerHistory?buyerName=${encodeURIComponent(buyerName)}`);
      if (!response.ok) throw new Error(`Failed to fetch: ${(await response.json()).error || 'Unknown error'}`);
      const { salesHistory } = await response.json();

      // Format the CSV data
      const csvData = `Buyer: ${buyerName}\n\nItems Bought,Date\n${salesHistory.map(record => 
        `${record.product_name || "No items"} (${record.quantity || 0}),${record.sale_date ? new Date(record.sale_date).toLocaleDateString() : "No date"}`
      ).join('\n')}`;

      // Create and trigger the download
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${buyerName}_sales_history.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading sales history:", error);
      alert(error.message);
    }
  };

  const columns = [
    { title: "Buyer Name", data: "buyerName" },
    { title: "Items Bought", data: "itemsBought" },
    { title: "Date", data: "date" },
    {
      title: "Download",
      data: null,
      render: (data, type, row) =>
        `<i class="bi bi-download download-button" data-buyer="${row.buyerName}" style="cursor: pointer; font-size: 1.5rem;"></i>`,
    },
  ];

  return (
    <div className="sales-page">
      <div className="sales-header"><h1>Sales History</h1></div>
      <div className="sales-table">
        <DataTable
          className="display cell-border"
          columns={columns}
          data={data}
          options={{
            responsive: true, autoWidth: false, select: true,
            dom: '<"d-flex justify-content-between"lf>rt<"d-flex justify-content-between"ip>B',
            buttons: ["copy", "csv", "excel", "pdf", "print", "colvis"],
            initComplete: function () {
              this.api().on('click', '.download-button', (e) => handleDownload(e.target.getAttribute('data-buyer')));
            },
          }}
        />
      </div>
    </div>
  );
};

export default Sales;