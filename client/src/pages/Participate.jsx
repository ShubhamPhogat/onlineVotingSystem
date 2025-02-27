import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Participate.css";

const Participate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post("http://localhost:3000/api/v1/participate", formData);
      navigate("/leaderboard");
    } catch (err) {
      console.error("Error submitting participation:", err);
      setError(
        err.response?.data?.message || "Failed to submit. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="participation-container">
      <div className="participation-backdrop">
        <div className="participation-form-container">
          <h1>Join the Competition</h1>

          {error && <div className="participation-error">{error}</div>}

          <form onSubmit={handleSubmit} className="participation-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Create a password"
              />
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Join Now"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Participate;
