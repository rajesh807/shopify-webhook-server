export default async function handler(req, res) {
  if (req.method === "POST") {
    let body = "";

    await new Promise((resolve) => {
      req.on("data", chunk => {
        body += chunk.toString();
      });
      req.on("end", resolve);
    });

    const data = JSON.parse(body);

    console.log("🔥 Order Received:", data);

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
