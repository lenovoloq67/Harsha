const express = require("express");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const app = express();
const port = 3000;

if (!process.env.GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY. Add it to your .env file.");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.use(express.json());
app.use(express.static(__dirname));

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Please enter a message." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite", 
      contents: message.trim(),
      config: {
        systemInstruction:
          "You provide general health information in clear, simple language. " +
          "Do not diagnose, prescribe medication, or replace a healthcare professional. " +
          "Encourage users to contact a qualified healthcare professional for personal medical advice. " +
          "If someone describes a possible emergency, tell them to contact their local emergency service now.",
      },
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error("Gemini API error:", error.message);
    res.status(500).json({
      error: "Sorry, the AI assistant is currently experiencing high demand. Please try again.",
    });
  }
});

app.listen(port, () => {
  console.log(`GHS is running at http://localhost:${port}`);
});