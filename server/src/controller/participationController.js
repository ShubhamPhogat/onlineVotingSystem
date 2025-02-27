import { supabase } from "../config/supabaseClient.js";
import bcrypt from "bcrypt";
import { redisManager } from "../redisManager.js";

export const participateHandler = async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  // Check if user already exists
  const { data: existingUser, error: existingUserError } = await supabase
    .from("User")
    .select("*")
    .eq("email", email);

  if (existingUser.length > 1) {
    res.status(409).json({ error: "User already exists" });
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword, name, email);
  const { data: newUser, error: newUserError } = await supabase
    .from("User")
    .insert({ name, email, password: hashedPassword })
    .select("id")
    .single();
  if (newUserError) {
    let error = JSON.stringify(newUserError);
    console.log(error);
    res.status(500).json({ error: `Failed to create user ${newUserError}` });
    return;
  }
  if (newUser) {
    console.log("this is nrew user", newUser);
    let newUserId = newUser.id;
    const { data: newParticipant, error: newParticipantError } = await supabase
      .from("participants")
      .insert({ userId: newUserId })
      .select("userId");
    if (newParticipantError) {
      res.status(500).json({ error: "Failed to create participant" });
      return;
    }

    const redisHandler = await redisManager.getInstance();
    if (redisHandler && redisHandler.publisher) {
      console.log("redis is connected");
      const data = {
        type: "newParticipant",
        update: { name, newParticipant, name },
      };
      redisHandler.publisher.publish("leaderboard", JSON.stringify(data));
      console.log("conpleted");
    }
  }
  res.status(201).json(newUser);
};

export const getParticipants = async (req, res) => {
  const { data: participants, error: error } = await supabase
    .from("participants")
    .select("*");
  if (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to get participants" });
  }
  let allParticpants = [];

  for (const participant of participants) {
    try {
      const { data: candidates, error } = await supabase
        .from("User")
        .select("id, name")
        .eq("id", participant.userId);

      if (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get candidates" });
        return;
      }

      allParticpants.push(candidates[0]);
    } catch (err) {
      console.error("Error fetching candidate:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
  }
  let data = [];
  for (const candidate of allParticpants) {
    try {
      const totalScore = await getTotalScoreForParticipant(candidate.id);

      data.push({ ...candidate, score: totalScore });
    } catch (error) {}
  }

  res.status(200).send({ data });
};

async function getTotalScoreForParticipant(participantId) {
  const { data: votes, error } = await supabase
    .from("votes")
    .select("score")
    .eq("voterId", participantId);

  if (error) {
    console.error("Error fetching votes:", error);
    return;
  }

  const totalScore = votes.reduce((sum, vote) => sum + vote.score, 0);
  console.log("Total score:", totalScore);
  return totalScore;
}
