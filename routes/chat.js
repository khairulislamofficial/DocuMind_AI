const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const buildPrompt = require("../lib/buildPrompt");

router.post("/", async (req, res) => {
  const { extractedText, chatHistory, userMessage } = req.body;

  if (!extractedText) {
    return res.status(400).json({ error: "Missing document text context" });
  }
  if (!userMessage) {
    return res.status(400).json({ error: "Missing user message" });
  }
  if (!process.env.GOOGLE_API_KEY) {
    return res.status(500).json({
      error:
        "Google AI API Key is not configured. Please add GOOGLE_API_KEY to your .env file."
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      // System instruction: document context + strict rules
      systemInstruction: buildPrompt(extractedText)
    });

    // Convert chat history to Gemini format (role: "user" | "model")
    const history = (chatHistory || []).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    // Start chat session with history
    const chat = model.startChat({ history });

    // Stream the response
    const result = await chat.sendMessageStream(userMessage);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(text);
      }
    }

    res.end();
  } catch (error) {
    console.error("Google AI Chat Error:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: error.message || "Failed to generate completion"
      });
    } else {
      res.write(`\n[ERROR: ${error.message || "Stream interrupted"}]`);
      res.end();
    }
  }
});

module.exports = router;
