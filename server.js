import express from "express";

const app = express();
app.use(express.json());

app.post("/webhook/order", (req, res) => {
  const order = req.body;

  console.log("🔥 Order Received:", order);

  res.status(200).send("OK");
});

app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
