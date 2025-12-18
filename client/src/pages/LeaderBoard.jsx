import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/leaderboard.css";

const LeaderBoard = () => {
  const [participants, setParticipants] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  const sortedParticipants = [...participants].sort(
    (a, b) => b.score - a.score
  );

  // Fetch initial participant data
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        console.log(
          "Fetching participants",
          import.meta.env.VITE_API_BACKEND_URL
        );
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_BACKEND_URL}/participate/get`
        );
        console.log("Initial participants data:", response.data.data);

        // Assuming the API returns an array of participants with id, name, and score properties
        setParticipants(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching participants:", err);
        setError(`Failed to load participants: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, []);

  // Set up WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        socketRef.current = new WebSocket("ws://localhost:8002");

        socketRef.current.addEventListener("open", (event) => {
          console.log("Connected to WebSocket server");
          setConnectionStatus("Connected");
          setError(null);
        });

        socketRef.current.addEventListener("message", (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("Data received:", data);
            handleWebSocketMessage(data);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
            setError("Error parsing message from server");
          }
        });

        socketRef.current.addEventListener("close", (event) => {
          console.log("Disconnected from WebSocket server");
          setConnectionStatus("Disconnected");

          // Attempt to reconnect after a delay
          setTimeout(connectWebSocket, 3000);
        });

        socketRef.current.addEventListener("error", (event) => {
          console.error("WebSocket error:", event);
          setError("Failed to connect to server. Retrying...");
          setConnectionStatus("Error");
        });
      } catch (err) {
        console.error("WebSocket connection error:", err);
        setError(`Connection error: ${err.message}`);
        setConnectionStatus("Error");

        setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const handleWebSocketMessage = (data) => {
    console.log("Handling WebSocket message:", data);
    switch (data.type) {
      case "update":
        setParticipants((prevParticipants) => {
          const updatedParticipants = [...prevParticipants];

          data.updates.forEach((update) => {
            const participantIndex = updatedParticipants.findIndex(
              (p) => p.id === update.id
            );

            if (participantIndex !== -1) {
              // Update existing participant score
              updatedParticipants[participantIndex] = {
                ...updatedParticipants[participantIndex],
                score:
                  updatedParticipants[participantIndex].score + update.score,
              };
            }
          });

          return updatedParticipants;
        });

        break;

      case "newParticipant":
        // Add new participant
        setParticipants((prevParticipants) => [
          ...prevParticipants,
          {
            id: data.update.newParticipant[0].userId,
            name: data.update.name,
            score: 0,
          },
        ]);
        break;

      default:
        console.warn("Unknown message type:", data.type);
    }
  };

  const renderScoreWithAnimation = (score, index) => {
    return (
      <div className="leaderboard-score" key={index}>
        <span>{score}</span>
      </div>
    );
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-background"></div>

      <div className="leaderboard-content">
        <h1 className="leaderboard-title">Live Leaderboard</h1>

        <div
          className={`leaderboard-status leaderboard-status-${connectionStatus.toLowerCase()}`}
        >
          {connectionStatus}
          {error && <div className="leaderboard-error">{error}</div>}
        </div>

        <div className="leaderboard-table-container">
          {loading ? (
            <div className="leaderboard-loading">Loading participants...</div>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th className="leaderboard-rank">Rank</th>
                  <th className="leaderboard-name">Participant</th>
                  <th className="leaderboard-score-header">Score</th>
                </tr>
              </thead>
              <tbody>
                {sortedParticipants.length > 0 ? (
                  sortedParticipants.map((participant, index) => (
                    <tr
                      key={participant.id}
                      className={`leaderboard-row ${
                        index < 3 ? `leaderboard-top-${index + 1}` : ""
                      }`}
                    >
                      <td className="leaderboard-rank">
                        {index + 1}
                        {index < 3 && (
                          <span className="leaderboard-crown">👑</span>
                        )}
                      </td>
                      <td className="leaderboard-name">{participant.name}</td>
                      <td className="leaderboard-score-cell">
                        {renderScoreWithAnimation(participant.score, index)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="leaderboard-empty">
                      No participants found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderBoard;
