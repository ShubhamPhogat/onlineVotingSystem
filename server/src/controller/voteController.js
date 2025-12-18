import { pool } from "../config/dbClient.js";
import bcrypt from "bcrypt";
import { redisManager } from "../redisManager.js";

export const voteHandler = async (req, res) => {
  const { name, email, password, candidateId, score } = req.body;
  if (!name || !email || !password || !candidateId || !score) {
    res.status(400).send({ message: "all fields are required" });
    return;
  }

  const client = await pool.connect();
  try {
    console.log("Vote request:", name, email, candidateId, score);

    // Check if candidate exists
    const candidateQuery = `
      SELECT id FROM participants WHERE user_id = $1
    `;
    const candidateResult = await client.query(candidateQuery, [candidateId]);
    if (candidateResult.rows.length === 0) {
      res.status(400).send({ message: "Invalid candidateId" });
      return;
    }

    // Check if user exists
    const userQuery = "SELECT id FROM users WHERE email = $1";
    const userResult = await client.query(userQuery, [email]);
    let userId;

    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
      console.log("Existing user ID:", userId);
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertUserQuery = `
        INSERT INTO users (name, email, password) 
        VALUES ($1, $2, $3) 
        RETURNING id
      `;
      const newUserResult = await client.query(insertUserQuery, [
        name,
        email,
        hashedPassword,
      ]);
      userId = newUserResult.rows[0].id;
      console.log("Created new user ID:", userId);
    }

    // Check if user has already voted
    const voteQuery = "SELECT * FROM votes WHERE user_id = $1";
    const voteResult = await client.query(voteQuery, [userId]);

    const redisHandler = await redisManager.getInstance();

    if (voteResult.rows.length === 0) {
      // Cast new vote
      const insertVoteQuery = `
        INSERT INTO votes (user_id, voter_id, score) 
        VALUES ($1, $2, $3) 
        RETURNING id
      `;
      await client.query(insertVoteQuery, [userId, candidateId, score]);

      // Publish to Redis
      if (redisHandler && redisHandler.publisher) {
        const data = {
          type: "update",
          updates: [{ id: candidateId, score: parseInt(score) }],
        };
        redisHandler.publisher.publish("leaderboard", JSON.stringify(data));
      }

      res.status(200).send({ message: "Vote casted successfully" });
    } else {
      // Update existing vote
      const oldVote = voteResult.rows[0];
      const updateVoteQuery = `
        UPDATE votes 
        SET voter_id = $1, score = $2 
        WHERE user_id = $3
      `;
      await client.query(updateVoteQuery, [candidateId, score, userId]);

      // Publish to Redis (subtract old score, add new score)
      if (redisHandler && redisHandler.publisher) {
        const numScore = parseInt(score, 10);
        const data = {
          type: "update",
          updates: [
            { id: candidateId, score: numScore },
            { id: oldVote.voter_id, score: oldVote.score * -1 },
          ],
        };
        redisHandler.publisher.publish("leaderboard", JSON.stringify(data));
      }

      res.status(200).send({ message: "Vote updated successfully" });
    }
  } catch (error) {
    console.error("Error in voteHandler:", error);
    res.status(500).send({ error: "Internal server error" });
  } finally {
    client.release();
  }
};
