export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const order = req.body;

  console.log("🔥 Order Received:", order);

  // Example: prepare data
  const conversionData = {
    value: order.current_total_price,
    currency: order.currency,
    orderId: order.id
  };

  console.log("✅ Processed Data:", conversionData);

  return res.status(200).json({ success: true });
}
