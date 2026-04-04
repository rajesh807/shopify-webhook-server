export default function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).send("Webhook is live ✅");
  }

  if (req.method === "POST") {
    console.log("🔥 Order Received:", req.body);
    return res.status(200).json({ success: true });
  }

  return res.status(405).send("Method Not Allowed");
}
