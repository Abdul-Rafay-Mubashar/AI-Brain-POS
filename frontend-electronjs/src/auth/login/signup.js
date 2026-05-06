import React, { useState } from 'react';
import './login.css';
import Loading from '../../components/loading';

const SignUp = ({ routeToLogIn }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(null);

  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please enter name, email and password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        }
      );

      let data;

      try {
        data = await response.json();
      } catch (err) {
        throw new Error("Invalid server response");
      }

      if (!response.ok) {
        const message = data?.error || "Sign Up failed";
        alert(message);
        return;
      }

      alert(data?.message || "Sign Up successful. Please login");
      routeToLogIn();

    } catch (error) {
      alert(error.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-window">
      {isLoading ?
        <Loading /> : null
      }

      <div className="login-content">
        <div className="logo-icon d-flex align-items-center justify-content-center" style={{ minWidth: "45px" }}>
          <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#5de4ff" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1>INVENTO</h1>

        <form className="login-card" onSubmit={handleSubmit}>
          <p className="welcome-text">
            Welcome to {process.env.REACT_APP_ORGANIZATION_NAME}.<br />
            Please Add your detail for sign up account.
          </p>
          <div className="input-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your email or username"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Email or Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your email or username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary-login">Sign Up</button>

          <div className="separator">
            <hr /> <span>or</span> <hr />
          </div>

        </form>

        <p className="footer-text">
          Already have an account? <a href="#login" onClick={routeToLogIn}>Log In</a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;