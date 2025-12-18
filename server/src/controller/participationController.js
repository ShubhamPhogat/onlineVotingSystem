import { pool } from "../config/dbClient.js";
import bcrypt from "bcrypt";
import { redisManager } from "../redisManager.js";

export const participateHandler = async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  const client = await pool.connect();
  try {
    // Check if user already exists
    const checkUserQuery = "SELECT * FROM users WHERE email = $1";
    const existingUser = await client.query(checkUserQuery, [email]);

    if (existingUser.rows.length > 0) {
      res.status(409).json({ error: "User already exists" });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Creating user:", name, email);

    // Insert new user
    const insertUserQuery = `
      INSERT INTO users (name, email, password) 
      VALUES ($1, $2, $3) 
      RETURNING id, name, email
    `;
    const newUserResult = await client.query(insertUserQuery, [
      name,
      email,
      hashedPassword,
    ]);
    const newUser = newUserResult.rows[0];

    console.log("Created new user:", newUser);

    // Insert into participants table
    const insertParticipantQuery = `
      INSERT INTO participants (user_id) 
      VALUES ($1) 
      RETURNING id, user_id
    `;
    const newParticipantResult = await client.query(insertParticipantQuery, [
      newUser.id,
    ]);
    const newParticipant = newParticipantResult.rows[0];

    // Publish to Redis
    const redisHandler = await redisManager.getInstance();
    if (redisHandler && redisHandler.publisher) {
      console.log("Publishing to Redis");
      const data = {
        type: "newParticipant",
        update: { name, userId: newUser.id },
      };
      redisHandler.publisher.publish("leaderboard", JSON.stringify(data));
      console.log("Published to leaderboard");
    }

    res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email });
  } catch (error) {
    console.error("Error in participateHandler:", error);
    res.status(500).json({ error: "Failed to create user" });
  } finally {
    client.release();
  }
};

export const getParticipants = async (req, res) => {
  const client = await pool.connect();
  try {
    // Get all participants with their user info and total votes in one query
    const query = `
      SELECT 
        u.id, 
        u.name,
        COALESCE(SUM(v.score), 0) as score
      FROM participants p
      INNER JOIN users u ON p.user_id = u.id
      LEFT JOIN votes v ON v.voter_id = u.id
      GROUP BY u.id, u.name
      ORDER BY score DESC
    `;
    
    const result = await client.query(query);
    
    res.status(200).send({ data: result.rows });
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ error: "Failed to get participants" });
  } finally {
    client.release();
  }
};

async function getTotalScoreForParticipant(participantId) {
  const client = await pool.connect();
  try {
    const query = `
      SELECT COALESCE(SUM(score), 0) as total_score 
      FROM votes 
      WHERE voter_id = $1
    `;
    const result = await client.query(query, [participantId]);
    const totalScore = parseInt(result.rows[0].total_score);
    console.log("Total score for participant", participantId, ":", totalScore);
    return totalScore;
  } catch (error) {
    console.error("Error fetching votes:", error);
    return 0;
  } finally {
    client.release();
  }
}
