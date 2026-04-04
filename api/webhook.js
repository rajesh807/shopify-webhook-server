export default async function handler(req, res) {
  if (req.method === "POST") {
    const order = req.body;

    console.log("Order Received:", order);

    return res.status(200).json({ success: true });
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
