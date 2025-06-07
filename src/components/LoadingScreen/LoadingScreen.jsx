import React from "react";
import "./LoadingScreen.css";

const LoadingScreen = () => (
  <div className="loading-screen approval-container">
    <div className="loading-approval-card approval-card">
      <div className="spinner"></div>
      <h2 className="loading-title">Cargando...</h2>
      <p className="loading-message">Por favor espere un momento.</p>
    </div>
  </div>
);

export default LoadingScreen;
