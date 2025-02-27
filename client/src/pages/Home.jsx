import React from "react";
import "../styles/home.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const navigatetovote = () => {
    navigate("/vote");
  };
  const navigateToLeaderBoard = () => {
    navigate("/leaderBoard");
  };

  const navigateToParticipate = () => {
    navigate("/participate");
  };

  return (
    <div className="home-container">
      <div className="home-background"></div>

      <div className="home-content">
        <h1 className="home-title">Welcome</h1>

        <div className="home-buttons">
          <button
            onClick={navigatetovote}
            className="home-button home-button-vote"
          >
            Vote
          </button>

          <button
            onClick={navigateToParticipate}
            className="home-button home-button-participate"
          >
            Participate
          </button>

          <button
            onClick={navigateToLeaderBoard}
            className="home-button home-button-leaderboard"
          >
            Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
