const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;
const MONGO_URI = process.env.MONGO_URI;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

const Order = mongoose.model("Order", new mongoose.Schema({
  userId: String,
  product: String,
  quantity: Number,
}));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/orders", async (req, res) => {
  res.json(await Order.find());
});

app.post("/orders", async (req, res) => {
  const { userId, product, quantity } = req.body;

  // Communication entre microservices: on interroge user-service
  try {
    const response = await fetch(`${USER_SERVICE_URL}/users/${userId}`);
    if (!response.ok) {
      return res.status(400).json({ error: "User does not exist" });
    }
  } catch (e) {
    return res.status(503).json({ error: "user-service unreachable" });
  }

  const order = await Order.create({ userId, product, quantity });
  res.status(201).json(order);
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("order-service connected to MongoDB");
    app.listen(PORT, () => console.log(`order-service on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });