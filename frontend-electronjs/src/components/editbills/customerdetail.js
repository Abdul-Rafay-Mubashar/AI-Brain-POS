import React from 'react';

const CustomerDetails = ({id, date}) => {


  const containerStyle = {
    backgroundColor: '#242424',
    borderRadius: '12px',
    padding: '1.25rem',
    color: '#ffffff',
    // Removed minWidth to allow it to shrink on mobile
    width: '100%', 
    maxWidth: '500px' // Limits size on large screens
  };

  const cardStyle = {
    backgroundColor: '#2F2F2F',
    borderRadius: '8px',
    padding: '10px 15px',
    border: 'none',
    height: '100%' // Ensures cards stay equal height when side-by-side
  };

  const labelStyle = {
    fontSize: '0.75rem',
    color: '#b0b0b0',
    marginBottom: '2px'
  };

  return (
    <div style={containerStyle} className="shadow-lg mx-auto">
      <h6 className="mb-3 fw-bold">Bill Details</h6>
      
      <div className="row g-2"> 
        {/* col-12: Full width on mobile */}
        {/* col-md-6: Half width on tablets/desktop */}
        <div className="col-12 col-md-6">
          <div style={cardStyle}>
            <div style={labelStyle}>Bill ID:</div>
            <div className="fw-normal">{id}</div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div style={cardStyle}>
            <div style={labelStyle}>Bill Date:</div>
            <div className="fw-normal">{date}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;