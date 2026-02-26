import React from 'react';
import './FloatingAddButton.css';

function FloatingAddButton({ onClick }) {
  return (
    <button className="floating-add-btn" onClick={onClick} title="Add Expense">
      <span className="fab-pulse"></span>
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );
}

export default FloatingAddButton;