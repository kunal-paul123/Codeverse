import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-dark text-center">
      <div
        className="p-5 rounded shadow"
        style={{ backgroundColor: "#132030", maxWidth: "500px", width: "90%" }}
      >
        <h1 className="display-1 fw-bold text-light">404</h1>
        <h2 className="mb-3 text-white">Page Not Found</h2>
        <p className="text-secondary mb-4">
          Oops! The page you are looking for doesn’t exist.
        </p>
        <Link
          to="/"
          className="btn btn-success fw-bold w-100"
          style={{ backgroundColor: "#1b873f", border: "none" }}
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
