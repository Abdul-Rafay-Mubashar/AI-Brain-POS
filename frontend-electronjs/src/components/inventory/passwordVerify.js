import React, { useEffect, useState } from 'react';
import './popup.css'; // Use the CSS provided in the previous step
import Loading from '../loading';

const PasswordVerify = ({ isOpen, onClose, isNew, onCloseUpdate, login }) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const verify = async () => {
    if (!password) {
      alert("Please enter Password");
      return;
    }
    setIsLoading(true);    // Start loading
    var response = await isNew(password)

    if (response) {
      setIsLoading(false); // Stop loading
      alert("Password Correct");

      onClose()
      if (login) {
        onCloseUpdate()
      }
    }
    else {
      setIsLoading(false); // Stop loading
      onClose()
        window.location.reload();
      if (!login) {

        onCloseUpdate()
      }
    }

  };

  const onCancel = async() => {
      if (!login) {
        onClose()
        onCloseUpdate()
        window.location.reload();
        return
      }
      onClose()
  }
  if (!isOpen) return null;
  return (
    <div className="modal-overlay-verify-password" onClick={onCancel}>
      {isLoading ?
        <Loading /> : null
      }
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Verify Password</h2>

        <div className="form-group">
          <label>Please add password</label>
          <input type="password" placeholder="Enter password..." onChange={(e) => { setPassword(e.target.value) }} />
        </div>



        <div className="modal-actions">
          <button className="save-btn" onClick={verify}>Verify</button>
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default PasswordVerify;