import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const InventoryHeader = ({ enable }) => {
    return (
        <div className="container-fluid py-3" style={{ backgroundColor: '#0d1117' }}>
            <div className="d-flex align-items-center justify-content-between px-4 py-2 border-bottom border-secondary">

                {/* Left Side: Heading and Icon */}
                <div className="d-flex align-items-center">
                    <h2 className="text-white fw-bold mb-0 me-3" style={{ letterSpacing: '1px', fontSize: '28px' }}>
                        INVENTORY PRODUCTS
                    </h2>

                    {/* Neon Icon Placeholder */}
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '2px solid #5de4ff',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 10px #5de4ff66'
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5de4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="9" cy="10" r="1" fill="currentColor" />
                            <circle cx="15" cy="10" r="1" fill="currentColor" />
                            <path d="M8 15c2 1 4 1 8 0" />
                        </svg>
                    </div>
                </div>

                {/* Right Side: Scan Button */}
                <div>
                    <button className="btn custom-scan-btn" onClick={enable}>
                        Enable Face Login
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

export default InventoryHeader;