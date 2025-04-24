import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import "./styling/Dashboard.css";
import DashboardModal from './modals/DashboardModal';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const URL = process.env.REACT_APP_URL;
  const [showModal, setShowModal] = useState(false);
  const [topSoldItems, setTopSoldItems] = useState([]);
  const [revenueData, setRevenueData] = useState({});
  const [showWeeklyRevenue, setShowWeeklyRevenue] = useState(false);

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
  
    // Fetch revenue data
    const fetchRevenueData = async () => {
      try {
        const response = await fetch(`${URL}/api/Dashboard/revenue?period=week`);
        const data = await response.json();
        setRevenueData(data);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      }
    };
  
    fetchTopSoldItems();
    fetchRevenueData();
  }, [URL]);  // Add URL to the dependency array

  const handleIconClick = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const toggleRevenueView = async () => {
    try {
      const period = showWeeklyRevenue ? 'week' : 'weekly-revenue';
      const response = await fetch(`${URL}/api/Dashboard/revenue?period=${period}`);
      const data = await response.json();
      setRevenueData(data);
      setShowWeeklyRevenue(!showWeeklyRevenue);
    } catch (error) {
      console.error("Error toggling revenue view:", error);
    }
  };

  // Prepare data for the pie chart
  const pieChartData = {
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

  // Prepare data for the bar chart
  const barChartData = {
    labels: showWeeklyRevenue 
      ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
      : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    datasets: [
      {
        label: showWeeklyRevenue ? 'Weekly Revenue' : 'Daily Revenue',
        data: showWeeklyRevenue ? revenueData.weeklyRevenue || Array(4).fill(0) : revenueData.dailyRevenue || Array(7).fill(0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: showWeeklyRevenue ? 'Weekly Revenue' : 'Daily Revenue',
      },
    },
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-icon" onClick={handleIconClick} style={{ cursor: 'pointer' }}>
        <i className="bi bi-cart3"></i>
      </div>

      {/* Layout for charts */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        {/* Pie chart on the left */}
        <div style={{ width: '50%', height: '510px' }}>
          <Pie data={pieChartData} />
        </div>

        {/* Bar chart on the right */}
        <div style={{ width: '50%', height: '600px', marginTop: '50px' }} onClick={toggleRevenueView}>
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>

      {/* Use the DashboardModal component */}
      <DashboardModal show={showModal} onHide={handleCloseModal} />
    </div>
  );
};

export default Dashboard;