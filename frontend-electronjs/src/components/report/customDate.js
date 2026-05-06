import React, { useState } from 'react';
import './customDate.css';
import Loading from '../loading';
import { useNavigate } from "react-router-dom";

const CustomDate = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const navigate = useNavigate();

  const handleSave = async () => {
    if (!startDate || !endDate) {
      alert("Please select both dates");
      return;
    }

    try {
      setIsLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/reports/custom?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 401) {
        navigate('/login');
        return []
      }
      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      // CSV download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${startDate}-to-${endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error(error);
      alert("Error generating report");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      {isLoading && <Loading />}

      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Enter Start & End Date</h2>

        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button className="save-btn" onClick={handleSave}>
            Download Report
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomDate;