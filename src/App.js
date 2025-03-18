import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Router, Routes, and Route
import './App.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Products from './components/Products';
import Sales from './components/Sales';

function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Navbar toggleSidebar={toggleSidebar} />
        </header>
        <Sidebar isExpanded={isSidebarExpanded} />
        <div className={`main-content ${isSidebarExpanded ? 'expanded' : ''}`}>
          <Routes>
            <Route  exact path="/" element={<Dashboard />} />
            <Route  exact path="/Users" element={<Users />} />
            <Route  exact path="/Products" element={<Products />} />
            <Route  exact path="/Sales" element={<Sales />} />

          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;