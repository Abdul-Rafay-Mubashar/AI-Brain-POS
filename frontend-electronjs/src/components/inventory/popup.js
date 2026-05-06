import React, { useEffect, useState } from 'react';
import './popup.css'; // Use the CSS provided in the previous step
import Loading from '../loading';
import { useNavigate } from "react-router-dom";


const Popup = ({ isOpen, onClose, isNew, triggerRefresh }) => {
  const [quantity, setQuantity] = useState(0);
  const [cost, setCost] = useState(0);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/product/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.toUpperCase(),
            quantity: Number(quantity),
            price: Number(cost),
          }),
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        navigate('/login');
        return []
      }
      if (!response.ok) {
        alert(data.error || "Failed to add product");
        return;
      }

      alert("Product Added Successfully!");
      setCost(0)
      setName('')
      setQuantity(0)
      triggerRefresh();


      onClose();

    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      {isLoading ?
        <Loading /> : null
      }
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>New Product</h2>

        <div className="form-group">
          <label>Product Name</label>
          <input type="text" placeholder="Enter name..." onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Initial Quantity</label>
          <input type="number" placeholder='Enter Quantity' min='1' onKeyDown={(e) => {
            if (e.key === "-" || e.key === "e") {
              e.preventDefault();
            }
          }} onChange={(e) => setQuantity(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Cost Price</label>
          <input type="number" placeholder='Enter Cost Price' min='1' onKeyDown={(e) => {
            // block minus and scientific notation
            if (e.key === "-" || e.key === "e") {
              e.preventDefault();
            }
          }} onChange={(e) => setCost(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button className="save-btn" onClick={handleSave}>Save</button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default Popup;