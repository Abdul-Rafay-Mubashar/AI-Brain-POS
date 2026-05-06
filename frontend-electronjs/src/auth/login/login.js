import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

import axios from 'axios';
import Loading from '../../components/loading';
import './login.css';
import PasswordVerify from '../../components/inventory/passwordVerify';
// import FaceLogin from '../../components/faceio/loginface';
import FaceLogin from '../../components/faceio/facelogin';


const Login = ({ routeToSignUp }) => {
  const [isPasswordVerify, setIsPasswordVerify] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [faceLoginRender, setFaceLoginRender] = useState(true);

  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);

  const navigate = useNavigate();


  const handleVerifyPassword = async (password) => {
    try {
      if (!password) {
        alert("Password is required");
        return false;
      }

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/auth/verify-password-signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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

      // ✅ success
      return true;

    } catch (error) {
      alert(error.message || "Something went wrong");
      return false;
    }
  };

  // const goBack = () => {
  //   console.log("go back to login")
  //   // add login of going to login page here
  // }

  const handleSignUpClick = (e) => {
    e.preventDefault(); // Prevent page reload/hash change
    setIsPasswordVerify(true); // Open the verification modal
  };
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      let data;

      try {
        data = await response.json();
      } catch (err) {
        alert("Invalid server response");
      }

      if (!response.ok) {
        const message = data?.error || "Login failed";
        alert(message);
        setIsLoading(false);
        return;
      }

      // ✅ success
      localStorage.setItem("token", data.token);
      navigate("/");

    } catch (error) {
      alert(error.message || "Network error");
    } finally {
      setIsLoading(false); // ✅ always runs
    }
  };

  return (

    <>
    {faceLoginRender?
      <div className="login-window">
        {isLoading ?
          <Loading /> : null
        }
        {isPasswordVerify ?
          <PasswordVerify
            isOpen={isPasswordVerify}
            onClose={() => setIsPasswordVerify(false)}
            isNew={handleVerifyPassword}
            onCloseUpdate={routeToSignUp}
            login={true}
          /> : null
        }
        <div className="login-content">
          <div className="logo-icon d-flex align-items-center justify-content-center" style={{ minWidth: "45px" }}>
            <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#5de4ff" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1>INVENTO</h1>

          <form className="login-card" onSubmit={handleSubmit}>
            <h3 className="welcome-text">
              Welcome back to {process.env.REACT_APP_ORGANIZATION_NAME}.<br />
              Please log in to your account.
            </h3>

            <div className="input-group">
              <label>Email or Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter your email or username"
                value={email || ""}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={password || ""}
                onChange={(e) => setPassword(e.target.value)}

              />
              <div className="forgot-container">
                <a href="#forgot" className="forgot-link">Forgot Password?</a>
              </div>
            </div>

            <button type="submit" className="btn-primary-login">Log In</button>

            <div className="separator">
              <hr /> <span>or</span> <hr />
            </div>
            <div className="input-group-face">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5de4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" onClick={() => {setFaceLoginRender(false)}}>
                <circle cx="12" cy="12" r="10" />
                <circle cx="9" cy="10" r="1" fill="currentColor" />
                <circle cx="15" cy="10" r="1" fill="currentColor" />
                <path d="M8 15c2 1 4 1 8 0" />
              </svg>
            </div>
          </form>

          <p className="footer-text">
            New here? <a href="#signup" onClick={handleSignUpClick}>Sign Up</a>
          </p>
        </div>
      </div>      :   <FaceLogin />}
    </>

  );
};

export default Login;