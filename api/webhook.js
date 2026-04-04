export const config = {
  api: {
    bodyParser: true
  }
};

export default function handler(req, res) {
  if (req.method === "POST") {
    const order = req.body;

    console.log("🔥 Order Received:", order);

    res.status(200).json({ success: true });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
