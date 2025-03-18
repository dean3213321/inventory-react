import React from 'react';
import logo from "../assets/wislogo.png";
import "bootstrap-icons/font/bootstrap-icons.css";


const Navbar = ({ toggleSidebar }) => {
  return (

    <div className="navbar">
      
      <img src={logo} className="wislogo" alt="logo" />
      <div className="burgericon" onClick={toggleSidebar}>
        <i className="bi bi-list"></i>
      </div>
      <div className="user-info">
        <i className="bi bi-person-circle user-icon"></i>
      </div>
    </div>
  );
};

export default Navbar;