import React from 'react';
import './loading.css';

const Loading = () => {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <p>Processing...</p>
    </div>
  );
};

export default Loading;