import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors({
  origin: "*"
}));
app.use(express.json());

// Initialize the official Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Health check endpoint
app.get("/", (req, res) => {
  res.send("Backend with Live Gemini AI is running!");
});

// ==========================================================================
// ROUTE 1: Bulletproof JSON Flashcards (Home Page)
// ==========================================================================
app.post("/summary", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "No text or topic content provided" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert study assistant. Break down the following topic into a list of 5 to 7 crucial study concepts.
      
      Return the response as a JSON array of objects with the structure:
      [{ "q": "Short Concept Name", "a": "Detailed explanation sentence" }]

      Topic/Text to summarize:
      ${text}

      Return ONLY valid JSON. Do not include any markdown styling or \`\`\`json blocks.`,
    });

    // Clean text response and parse safely to avoid syntax issues
    const cleanText = response.text.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    const parsedCards = JSON.parse(cleanText);

    res.json({ flashcards: parsedCards });
  } catch (error) {
    console.error("Summary API Error:", error);
    res.status(500).json({ error: "Failed to generate structured flashcards." });
  }
});

// ==========================================================================
// ROUTE 2: Quiz Generation (Quiz Page)
// ==========================================================================
app.post("/quiz", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic || topic.trim() === "") {
      return res.status(400).json({ error: "No topic provided" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a 5-question multiple-choice quiz about "${topic}". 
      Return the response as a JSON array of objects with the structure:
      [{ "question": "string", "options": ["a", "b", "c", "d"], "correctAnswer": number }]
      - "correctAnswer" should be the index (0-3) of the correct option.
      Return ONLY valid JSON. Do not include any markdown styling or \`\`\`json blocks.`,
    });

    const cleanText = response.text.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    const quizData = JSON.parse(cleanText);
    
    res.json({ quiz: quizData });
  } catch (error) {
    console.error("Quiz API Error:", error);
    res.status(500).json({ error: "Failed to generate quiz." });
  }
});

// ==========================================================================
// ROUTE 3: General Chat (Chat Page)
// ==========================================================================
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "No message provided" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Failed to get AI response." });
  }
});

// Start the server configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server securely running on port ${PORT}`);
});