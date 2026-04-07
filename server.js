import express from "express";

const app = express();
app.use(express.json());

// 🔐 GOOGLE ADS CONFIG (FROM ENV)
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const DEVELOPER_TOKEN = process.env.DEVELOPER_TOKEN;

// ✅ IDs
const CUSTOMER_ID = "7027262809"; // Client Account
const MCC_ID = "4057780258"; // MCC Account
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

  if (!data.access_token) {
    console.error("❌ Failed to get access token:", data);
    throw new Error("Access token error");
  }

  return data.access_token;
}

// 📩 Shopify Webhook
app.post("/webhook/order", async (req, res) => {
  const order = req.body;

  console.log("🔥 Order Received");

  let gclid = null;

  if (order.note_attributes) {
    const gclidAttr = order.note_attributes.find(
      (attr) => attr.name === "gclid"
    );
    if (gclidAttr) gclid = gclidAttr.value;
  }

  console.log("🎯 GCLID:", gclid);

  if (!gclid) {
    console.log("❌ No GCLID found");
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

    console.log("📤 Sending to Google Ads:", conversionData);

    const response = await fetch(
      `https://googleads.googleapis.com/v14/customers/${CUSTOMER_ID}:uploadClickConversions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "developer-token": DEVELOPER_TOKEN,
          "login-customer-id": MCC_ID, // ✅ FIXED (VERY IMPORTANT)
          "Content-Type": "application/json",
        },
        body: JSON.stringify(conversionData),
      }
    );

    // 🔥 FIX: handle non-JSON response
    const text = await response.text();

    try {
      const result = JSON.parse(text);
      console.log("✅ Google Ads Response:", result);
    } catch (e) {
      console.error("❌ Non-JSON Response:", text);
    }

  } catch (error) {
    console.error("❌ Error sending conversion:", error);
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
