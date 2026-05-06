import React, { useEffect, useState } from 'react';
import './popup.css'; // Use the CSS provided in the previous step
import Loading from '../loading';
import PasswordVerify from './passwordVerify';
import { useNavigate } from "react-router-dom";

const UpdatePopup = ({ isOpen, onClose, name, quantity, cost, id, triggerRefresh }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isQuantityChange, setIsQuantityChange] = useState(false);
    const [isQuantityChangeVerify, setIsQuantityChangeVerify] = useState(false);
    const [productName, setProductName] = useState(name || "");
    const [productQuantity, setProductQuantity] = useState(quantity || 0);
    const [productCost, setProductCost] = useState(cost || 0);
    const [productStock, setProductStock] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        setProductName(name || "");
        setProductQuantity(quantity || 0);
        setProductCost(cost || 0);
        setProductStock(0);
    }, [name, quantity, cost]);

    const handleSave = async () => {
        if (!productName || productName.trim() === "") {
            alert("Product name is required");
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
                `${process.env.REACT_APP_BASE_URL}/api/product/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: productName.toUpperCase(),
                        quantity: Number(productQuantity),
                        price: Number(productCost),
                        stock: Number(productStock)
                    }),
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

            alert("Product Updated Successfully!");
            triggerRefresh();
            onClose();

        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };
    const handleQuantityClick = () => {
        setIsQuantityChangeVerify(true)

    };
    useEffect(() => {
        if (isQuantityChangeVerify) {
            setIsQuantityChange(true);

        }
    }, [isQuantityChangeVerify])
    const handleVerifyPassword = async (password) => {
        try {
            if (!password) {
                alert("Password is required");
                return false;
            }
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/api/auth/verify-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,

                    },
                    body: JSON.stringify({ password }),
                }
            );

            let data;

            try {
                data = await response.json();
            } catch (err) {
                alert("Invalid server response");
            }

            if (!response.ok) {
                const message = data?.error || "Verification failed";
                alert(message);


                return false;
            }

            return true;

        } catch (error) {
            console.error("Error:", error);
            alert(error.message || "Something went wrong");
            return false;
        }
    };
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            {isLoading ?
                <Loading /> : null
            }
            {isQuantityChange ?
                <PasswordVerify
                    isOpen={isQuantityChange}
                    onClose={() => setIsQuantityChange(false)}
                    isNew={handleVerifyPassword}
                    onCloseUpdate={onClose}
                    login={false}
                /> : null
            }
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Update Product</h2>

                <div className="form-group">
                    <label>Product Name</label>
                    <input type="text" placeholder="Enter name..." value={productName} onChange={(e) => { setProductName(e.target.value) }} />
                </div>

                <div className="form-group">
                    <label>Quantity</label>
                    <input type="number" value={productQuantity} min='1' onKeyDown={(e) => {
                        // block minus and scientific notation
                        if (e.key === "-" || e.key === "e") {
                            e.preventDefault();
                        }
                    }} onClick={handleQuantityClick} onChange={(e) => { setProductQuantity(e.target.value) }} />
                </div>
                <div className="form-group">
                    <label>Stock</label>
                    <input type="number" min='1' onKeyDown={(e) => {
                        // block minus and scientific notation
                        if (e.key === "-" || e.key === "e") {
                            e.preventDefault();
                        }
                    }} onChange={(e) => { setProductStock(e.target.value) }} />
                </div>
                <div className="form-group">
                    <label>Cost Price</label>
                    <input type="number" value={productCost} min='1' onKeyDown={(e) => {
                        // block minus and scientific notation
                        if (e.key === "-" || e.key === "e") {
                            e.preventDefault();
                        }
                    }} onChange={(e) => { setProductCost(e.target.value) }} />
                </div>

                {/* <div className="form-group">
          <label>Sale Price</label>
          <input type="number" defaultValue={sale} />
        </div> */}

                <div className="modal-actions">
                    <button className="save-btn" onClick={handleSave}>Save</button>
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default UpdatePopup;