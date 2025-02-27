import { supabase } from "../config/supabaseClient.js";
import bcrypt from "bcrypt";
import { redisManager } from "../redisManager.js";

export const voteHandler = async (req, res) => {
  const { name, email, password, candidateId, score } = req.body;
  if (!name || !email || !password || !candidateId || !score) {
    res.status(400).send({ message: "all fileds are required" });
    return;
  }

  //check if candidate id exists
  console.log(name, email, password, candidateId);

  const { data: candidateUser, error: candidateError } = await supabase
    .from("participants")
    .select("id")
    .eq("userId", candidateId);
  if (candidateError || candidateUser.length === 0) {
    res.status(400).send({ message: "Invalid candidateId" });
    return;
  }

  const { data: user, error: userError } = await supabase
    .from("User")
    .select("id")
    .eq("email", email);
  let userId;
  if (user.length > 0) {
    userId = user[0].id;
    console.log("existing user Id", user);
  } else {
    let hashedPassword = await bcrypt.hash(password, 10);
    const { data: newUser, error: userError } = await supabase
      .from("User")
      .insert([{ name, email, password: hashedPassword }])
      .select("id")
      .single();
    if (userError) {
      res.status(400).send({ error: userError });
      return;
    }
    userId = newUser.id;
  }
  const { data: vote, error: voteError } = await supabase
    .from("votes")
    .select("*")
    .eq("userId", userId);
  if (voteError) {
    res
      .status(400)
      .send({ error: voteError, message: "error in vote line 68" });
    return;
  }
  console.log("this is vote obkext", vote);
  if (vote.length === 0) {
    const { data: newVoter, error: newVoterError } = await supabase
      .from("votes")
      .insert([{ userId, voterId: candidateId, score }]);
    if (newVoterError) {
      res.status(400).send({ error: newVoterError });
      return;
    }
    const redisHandler = new redisManager();
    // const totalScore = await getTotalScoreForParticipant(candidateId);
    const data = {
      type: "update",
      updates: [{ id: candidateId, score }],
    };
    redisHandler.publisher.publish("leaderboard", JSON.stringify(data));

    res.status(200).send({ ...newVoter, message: "Vote casted successfully" });
  } else {
    const { data: updateVoter, error: errorUpdateVoter } = await supabase
      .from("votes")
      .update({ voterId: candidateId, score: score })
      .eq("userId", userId);
    if (errorUpdateVoter) {
      res.status.send({ data: errorUpdateVoter });
    }

    const redisHandler = new redisManager();
    // const totalScore = await getTotalScoreForParticipant(candidateId);
    const numScore = parseInt(score, 10);
    const data = {
      type: "update",
      updates: [
        { id: candidateId, score: numScore },
        { id: vote[0].voterId, score: vote[0].score * -1 },
      ],
    };
    redisHandler.publisher.publish("leaderboard", JSON.stringify(data));

    res
      .status(200)
      .send({ ...updateVoter, message: "Vote updated successfully" });
  }
};
