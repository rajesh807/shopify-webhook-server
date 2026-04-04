import express from "express";

const app = express();
app.use(express.json());

app.post("/webhook/order", (req, res) => {
  const order = req.body;

  // 🔥 Extract GCLID
  let gclid = null;

  if (order.note_attributes) {
    const gclidAttr = order.note_attributes.find(
      attr => attr.name === "gclid"
    );
    if (gclidAttr) {
      gclid = gclidAttr.value;
    }
  }

  console.log("🎯 GCLID:", gclid);

  // 🔥 Extract Conversion Value
  const conversionValue = parseFloat(order.current_total_price || 0);
  const currency = order.currency;

  console.log("💰 Conversion Value:", conversionValue);
  console.log("💱 Currency:", currency);

  console.log("🔥 Order Received:", order);

  res.status(200).send("OK");
});

app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
