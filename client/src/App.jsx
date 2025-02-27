import { useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Vote from "./pages/Vote.jsx";
import LeaderBoard from "./pages/LeaderBoard.jsx";
import Participate from "./pages/Participate.jsx";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/vote" element={<Vote />} />
        <Route path="/leaderBoard" element={<LeaderBoard />} />
        <Route path="/participate" element={<Participate />} />
      </Routes>
    </Router>
  );
};

export default App;
