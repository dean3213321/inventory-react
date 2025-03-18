import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import "../styling/Dashboard.css";
import DashboardModal from '../modals/DashboardModal';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const URL = process.env.REACT_APP_URL;
  const [showModal, setShowModal] = useState(false);
  const [topSoldItems, setTopSoldItems] = useState([]);

  useEffect(() => {
    // Fetch top 5 sold items
    const fetchTopSoldItems = async () => {
      try {
        const response = await fetch(`${URL}/api/Dashboard/gettopsolditems`);
        const data = await response.json();
        setTopSoldItems(data);
      } catch (error) {
        console.error("Error fetching top sold items:", error);
      }
    };

    fetchTopSoldItems();
  }, []);

  const handleIconClick = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Prepare data for the pie chart
  const chartData = {
    labels: topSoldItems.map(item => item.product_name),
    datasets: [
      {
        label: 'Total Quantity Sold',
        data: topSoldItems.map(item => item.total_quantity),
        backgroundColor: [
          'rgba(255, 0, 0, 0.6)',
          'rgba(145, 0, 0, 0.6)',
          'rgba(144, 240, 66, 0.6)',
          'rgba(0, 138, 0, 0.6)',
          'rgba(9, 255, 0, 0.6)',
        ],
        borderColor: [
          'rgb(0, 0, 0)',
          'rgb(0, 0, 0)',
          'rgb(0, 0, 0)',
          'rgb(0, 0, 0)',
          'rgb(0, 0, 0)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-icon" onClick={handleIconClick} style={{ cursor: 'pointer' }}>
        <i className="bi bi-cart3"></i>
      </div>

      {/* Display the pie chart */}
      <div style={{  height: '510px', width: '600px', margin: 'left', marginTop: '20px' }}>
        <Pie data={chartData} />
      </div>

      {/* Use the DashboardModal component */}
      <DashboardModal show={showModal} onHide={handleCloseModal} />
    </div>
  );
};

export default Dashboard;