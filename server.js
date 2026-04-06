import express from "express";

const app = express();
app.use(express.json());

// 🔐 GOOGLE ADS CONFIG
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const DEVELOPER_TOKEN = process.env.DEVELOPER_TOKEN;

const CUSTOMER_ID = "7027262809";
const CONVERSION_ID = "17552421490";

// 🔁 Get Access Token
async function getAccessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  return data.access_token;
}

// 📩 Shopify Webhook
app.post("/webhook/order", async (req, res) => {
  const order = req.body;

  console.log("🔥 Order Received:", order);

  let gclid = null;

  if (order.note_attributes) {
    const gclidAttr = order.note_attributes.find(
      (attr) => attr.name === "gclid"
    );
    if (gclidAttr) gclid = gclidAttr.value;
  }

  console.log("🎯 GCLID:", gclid);

  if (!gclid) {
    return res.status(200).send("No GCLID");
  }

  try {
    const accessToken = await getAccessToken();

    const conversionData = {
      conversions: [
        {
          gclid: gclid,
          conversionAction: `customers/${CUSTOMER_ID}/conversionActions/${CONVERSION_ID}`,
          conversionDateTime: new Date().toISOString(),
          conversionValue: parseFloat(order.total_price || 0),
          currencyCode: order.currency || "INR",
        },
      ],
      partialFailure: true,
    };

    const response = await fetch(
      `https://googleads.googleapis.com/v14/customers/${CUSTOMER_ID}:uploadClickConversions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "developer-token": DEVELOPER_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(conversionData),
      }
    );

    const result = await response.json();
    console.log("✅ Google Ads Response:", result);

  } catch (error) {
    console.error("❌ Error:", error);
  }

  res.status(200).send("OK");
});

// Health check
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
