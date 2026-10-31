const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  email: String,
}));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/users", async (req, res) => {
  res.json(await User.find());
});

app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: "Invalid id" });
  }
});

app.post("/users", async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("user-service connected to MongoDB");
    app.listen(PORT, () => console.log(`user-service on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });