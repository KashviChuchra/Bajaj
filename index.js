require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const EMAIL = process.env.OFFICIAL_EMAIL;



const fibonacci = (n) => {
  const res = [];
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) {
    res.push(a);
    [a, b] = [b, a + b];
  }
  return res;
};

const isPrime = (num) => {
  if (num < 2) return false;
  for (let i = 2; i * i <= num; i++)
    if (num % i === 0) return false;
  return true;
};

const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);

const lcm = (a, b) => (a * b) / gcd(a, b);

// ---------- Health API ----------
app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL
  });
});


app.post("/bfhl", async (req, res) => {
  try {
    const keys = Object.keys(req.body);

    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        official_email: EMAIL,
        error: "Request must contain exactly one key"
      });
    }

    const key = keys[0];
    const value = req.body[key];

    let data;

    switch (key) {
      case "fibonacci":
        if (!Number.isInteger(value) || value < 0)
          throw new Error("Invalid fibonacci input");
        data = fibonacci(value);
        break;

      case "prime":
        if (!Array.isArray(value))
          throw new Error("Invalid prime input");
        data = value.filter(isPrime);
        break;

      case "lcm":
        if (!Array.isArray(value) || value.length === 0)
          throw new Error("Invalid lcm input");
        data = value.reduce((a, b) => lcm(a, b));
        break;

      case "hcf":
        if (!Array.isArray(value) || value.length === 0)
          throw new Error("Invalid hcf input");
        data = value.reduce((a, b) => gcd(a, b));
        break;

         case "AI":
        if (typeof value !== "string") {
          throw new Error("Invalid AI input");
        }

        const aiResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [
              {
                parts: [{ text: value }]
              }
            ]
          }
        );

        data =
  aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text
    ?.replace(/\*\*/g, "")
    ?.trim() || "Unavailable";


        break;

      default:
        throw new Error("Invalid key");
    }

    return res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data
    });

  } catch (err) {
    return res.status(400).json({
      is_success: false,
      official_email: EMAIL,
      error: err.message
    });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
