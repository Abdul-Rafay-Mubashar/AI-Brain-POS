import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from "react-router-dom";


const Heading = ({ heading }) => {


    const navigate = useNavigate();

    const LogOut = async() => {
        localStorage.removeItem("token");
        navigate("/")
        window.location.reload()
    }
    return (
        <div className="container-fluid py-3" style={{ backgroundColor: '#0d1117' }}>
            <div className="d-flex align-items-center justify-content-between px-4 py-2 border-bottom border-secondary">

                {/* Left Side: Heading and Icon */}
                <div className="d-flex align-items-center">
                    <h2 className="text-white fw-bold mb-0 me-3" style={{ letterSpacing: '1px', fontSize: '28px' }}>
                        {heading}
                    </h2>


                </div>

                {/* Right Side: Scan Button */}
                <div>
                    <button className="btn custom-scan-btn" onClick={LogOut}>
                        Log Out
                    </button>
                </div>
            </div>

            <style jsx>{`
        .custom-scan-btn {
          background: linear-gradient(180deg, #2c5e6e 0%, #1a3a45 100%);
          color: #e0f7fa;
          border: 1px solid #5de4ff;
          border-radius: 25px;
          padding: 8px 35px;
          font-weight: 500;
          box-shadow: 0 0 15px rgba(93, 228, 255, 0.2);
          transition: all 0.3s ease;
        }

        .custom-scan-btn:hover {
          box-shadow: 0 0 20px rgba(93, 228, 255, 0.5);
          color: #fff;
          transform: translateY(-1px);
        }
      `}</style>
        </div>
    );
};

export default Heading;