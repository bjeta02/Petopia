import React from 'react';
import './css/ToggleSwitch.css'; // Import the CSS for styling

const ToggleSwitch = ({ isActive, onToggle }) => {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={isActive} onChange={onToggle} />
      <span className="slider"></span>
    </label>
  );
};

export default ToggleSwitch;