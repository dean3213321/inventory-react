import React, { useState, useEffect } from "react";

// Import the DataTable and the required DataTable components
import { DataTable, DT } from "./utils/datatables-imports.js";

// Import the users CSS file
import "./styling/Users.css";

DataTable.use(DT);

const Users = () => {
  // For Local Host port
  const URL = process.env.REACT_APP_URL;

  const [data, setData] = useState([]);

  // Fetch teacher data from the API endpoint
  useEffect(() => {
    fetch(`${URL}/api/Users`)
      .then(response => response.json())
      .then(teacherData => setData(teacherData))
      .catch(error => console.error("Error fetching teacher data:", error));
  }, [URL]); // Add URL to the dependency array

  // Define columns including the position field
  const columns = [
    { title: "First Name", data: "fname" },
    { title: "Last Name", data: "lname" },
    { title: "Email", data: "email" },
    { title: "Position", data: "position" },
  ];

  return (
    <div className="users-page">
      <div className="users-header">
        <h3>Teacher Users</h3>
      </div>
      <div className="users-table">
      <DataTable
        className="display cell-border"
        columns={columns}
        data={data}
        options={{
          responsive: true, // Disable responsive feature
          autoWidth: false,  // Disable auto width
          select: true,
          dom: '<"d-flex justify-content-between"lf>rt<"d-flex justify-content-between"ip>B',
          buttons: ["copy", "csv", "excel", "pdf", "print", "colvis"],
        }}
      />
      </div>
    </div>
  );
};

export default Users;