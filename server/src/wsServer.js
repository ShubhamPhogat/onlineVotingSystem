import { WebSocketServer, WebSocket } from "ws";
import { redisManager } from "./redisManager.js";

export const initilizeWebSocketServer = async () => {
  const wss = new WebSocketServer({ port: 8002 });
  console.log("WebSocket server started on port 8002");

  // Create a Set to store all connected WebSocket clients
  const clients = new Set();

  const redisHandler = await redisManager.getInstance();

  // Set up Redis subscription once (outside the connection handler)
  if (redisHandler && redisHandler.subscriber) {
    redisHandler.subscriber.subscribe("leaderboard", (message) => {
      console.log("Received new leaderboard update:", message);

      // Parse the message from Redis
      try {
        const leaderboard = JSON.parse(message);

        // Broadcast the message to all connected clients
        console.log("Broadcasting to", clients.size, "clients");
        clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            console.log("Broadcasting to client:", message);
            client.send(JSON.stringify(leaderboard));
          }
        });
      } catch (error) {
        console.error("Error parsing leaderboard message:", error);
      }
    });
  }

  wss.on("connection", async (ws, req) => {
    console.log("New client connected");

    // Add the new client to the Set
    clients.add(ws);

    // Handle incoming messages from the client
    ws.on("message", (msg) => {
      console.log("Received message from client:", msg);
    });

    // Handle client disconnection
    ws.on("close", () => {
      console.log("Client disconnected");

      // Remove the client from the Set when it disconnects
      clients.delete(ws);
    });
    ws.on("error", (err) => {
      console.error("WebSocket error:", err);
    });
  });
};
