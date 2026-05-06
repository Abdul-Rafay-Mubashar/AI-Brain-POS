import React, { useEffect, useState } from 'react';
import Loading from '../loading';
import { useNavigate } from "react-router-dom";


import './popup.css';

const DeletePopup = ({ isOpen, onClose, name, id, triggerRefresh }) => {
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/product/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (response.status === 401) {
        navigate('/login');
        return []
      }
      if (!response.ok) {
        alert(data.error || "Failed to update product");
        return;
      }

      alert("Product Deleted Successfully!");
      triggerRefresh();
      onClose();

    } catch (error) {
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {isLoading ?
          <Loading /> : null
        }
        <h2>Delete Product</h2>

        <div className="form-group">
          <label>Are you sure you want to delete {name} from products</label>
        </div>


        <div className="modal-actions">
          <button className="save-btn" onClick={handleDelete}>Delete</button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DeletePopup;