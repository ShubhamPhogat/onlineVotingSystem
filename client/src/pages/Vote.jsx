import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../styles/voting.css";

const Vote = () => {
  // State for candidates
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the form display
  const [showForm, setShowForm] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    score: 5,
    candidateId: "",
  });

  // State for search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCandidates, setFilteredCandidates] = useState([]);

  // Fetch candidates data from API
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        // Replace with your API endpoint
        const response = await axios.get(
          `${import.meta.env.VITE_API_BACKEND_URL}/participate/get`
        );
        console.log("Fetched candidates:", response.data.data);
        setCandidates(response.data.data);
        setFilteredCandidates(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching candidates:", err);
        setError("Failed to load participants. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle search with debouncing
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Debouncing function
  const debouncedSearch = useCallback(
    debounce((term) => {
      const filtered = candidates.filter((candidate) =>
        candidate.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredCandidates(filtered);
    }, 300),
    [candidates]
  );

  // Apply debouncing to search
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Open form for a candidate
  const openForm = (candidate) => {
    setSelectedCandidate(candidate);
    setShowForm(true);
    document.body.classList.add("voting-no-scroll");
    console.log("this is a candidate", candidate.id);
    setFormData((prev) => {
      return {
        ...prev,
        candidateId: candidate.id,
      };
    });
  };

  // Close form
  const closeForm = () => {
    setShowForm(false);
    document.body.classList.remove("voting-no-scroll");
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create the final form data object
    const finalFormData = {
      ...formData,
      candidateId: selectedCandidate.id,
      candidateName: selectedCandidate.name,
    };

    try {
      console.log("Submitting vote:", finalFormData);

      // In a real application, you would send this data to your API
      const response = await axios.post(
        `${import.meta.env.VITE_API_BACKEND_URL}/vote`,
        finalFormData
      );
      console.log("Vote submitted successfully:", response.data);

      // Reset form and close it
      setFormData({
        name: "",
        email: "",
        password: "",
        score: 5,
      });
      closeForm();

      // Show success message
      alert(`Vote for ${selectedCandidate.name} submitted successfully!`);
    } catch (err) {
      console.error("Error submitting vote:", err);
      alert(`Failed to submit vote: ${err.message}`);
    }
  };

  return (
    <div className="voting-container">
      {/* Background Image */}
      <div className="voting-background"></div>

      {/* Main Content */}
      <div className="voting-content">
        <h1 className="voting-title">Cast Your Vote</h1>

        {/* Search Bar */}
        <div className="voting-search-container">
          <input
            type="text"
            className="voting-search"
            placeholder="Search participants..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="voting-loading">Loading participants...</div>
        )}

        {/* Error State */}
        {error && <div className="voting-error">{error}</div>}

        {/* Empty State */}
        {!loading && !error && filteredCandidates.length === 0 && (
          <div className="voting-empty">
            {searchTerm
              ? "No participants match your search."
              : "No participants available."}
          </div>
        )}

        {/* Candidate Cards */}
        {!loading && !error && (
          <div className="voting-cards-grid">
            {filteredCandidates.map((candidate) => (
              <div
                onClick={() => openForm(candidate)}
                className="voting-card"
                key={candidate.id}
              >
                <div className="voting-card-content">
                  <h2 className="voting-card-name">{candidate.name}</h2>
                  <button className="voting-card-button">Vote Now</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Voting Form Modal */}
      {showForm && selectedCandidate && (
        <>
          <div className="voting-overlay" onClick={closeForm}></div>
          <div className="voting-form-container">
            <button className="voting-close-button" onClick={closeForm}>
              ×
            </button>
            <h2 className="voting-form-title">
              Vote for {selectedCandidate.name}
            </h2>

            <form onSubmit={handleSubmit} className="voting-form">
              <div className="voting-form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="voting-input"
                />
              </div>

              <div className="voting-form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="voting-input"
                />
              </div>

              <div className="voting-form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="voting-input"
                />
              </div>

              <div className="voting-form-group">
                <label htmlFor="score">Score (1-10)</label>
                <input
                  type="range"
                  id="score"
                  name="score"
                  min="1"
                  max="10"
                  value={formData.score}
                  onChange={handleInputChange}
                  className="voting-input-range"
                />
                <span className="voting-score-value">{formData.score}</span>
              </div>

              <button type="submit" className="voting-submit-button">
                Submit Vote
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

// Debounce function implementation
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

export default Vote;
