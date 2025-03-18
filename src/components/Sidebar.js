import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import "bootstrap-icons/font/bootstrap-icons.css";

const menuItems = [
  { icon: 'bi-house-door', text: 'Dashboard', path: '/' },
  { icon: 'bi-people-fill', text: 'Users', path: '/users' },
  { icon: 'bi-box-seam', text: 'Products', path: '/products' },
  { icon: 'bi-coin', text: 'Sales', path: '/sales' },
  { icon: 'bi-bar-chart-line', text: 'Borrowers', path: '/borrowers' },
];

const Sidebar = ({ isExpanded }) => {
  return (
    <div className={`sidebar ${isExpanded ? 'expanded' : ''}`} role="navigation" aria-label="Main navigation">
      <ul className="list-unstyled">
        {menuItems.map((item, index) => (
          <li key={index}>
            <i className={`bi ${item.icon}`} aria-hidden="true"></i>
            <span className="sidebar-text">
              <Link to={item.path}>{item.text}</Link>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

Sidebar.propTypes = {
  isExpanded: PropTypes.bool.isRequired,
};

export default Sidebar;