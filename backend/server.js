import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { YoutubeTranscript } from "youtube-transcript";

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
// HELPERS
// ==========================================================================

/**
 * Pull the 11-character video ID out of any YouTube URL shape
 * (watch?v=, youtu.be/, /shorts/, /embed/, /live/, with or without
 * extra query params like timestamps or playlist ids).
 * Returns null if the string isn't a YouTube link at all.
 */
function extractVideoId(rawText) {
  const trimmed = rawText.trim();
  try {
    return YoutubeTranscript.retrieveVideoId(trimmed);
  } catch {
    // The library's own regex misses a few shapes (e.g. /shorts/ID or
    // /live/ID with no trailing slash). Try a more permissive fallback
    // before giving up entirely.
    const fallbackMatch = trimmed.match(
      /(?:youtube\.com\/(?:shorts|live)\/|youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return fallbackMatch ? fallbackMatch[1] : null;
  }
}

/**
 * Lightweight, reliable way to get a video's real title/author even when
 * caption scraping is blocked. Uses YouTube's public oEmbed endpoint -
 * no API key needed and it isn't subject to the same anti-bot blocking
 * that full page/transcript scraping runs into on cloud hosts.
 */
async function fetchVideoMetadata(videoId) {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${videoId}`
  )}&format=json`;

  const resp = await fetch(oembedUrl);
  if (!resp.ok) {
    throw new Error(`oEmbed request failed with status ${resp.status}`);
  }
  const data = await resp.json();
  return { title: data.title, author: data.author_name };
}

/**
 * Parses a JSON array out of a Gemini text response, tolerating stray
 * markdown fences or extra commentary the model might add despite
 * instructions not to.
 */
function safeParseJsonArray(rawText) {
  const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Model response did not contain valid JSON.");
  }
}

// ==========================================================================
// ROUTE 1: Flashcards (from a YouTube link OR a plain study topic)
// ==========================================================================
app.post("/summary", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "No text or topic content provided" });
    }

    const videoId = extractVideoId(text);

    let finalInputText = text;
    let source = "topic";       // "topic" | "transcript" | "title"
    let videoTitle = null;

    if (videoId) {
      console.log(`Detected YouTube link. Video ID: ${videoId}`);

      // 1) Try to get the real transcript first - this gives the most
      //    accurate flashcards since it's based on actual spoken content.
      let transcriptText = null;
      try {
        const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
        transcriptText = transcriptItems.map((item) => item.text).join(" ");
        console.log(`Transcript fetched. Length: ${transcriptText.length} chars`);
      } catch (transcriptError) {
        console.warn(`Transcript fetch failed: ${transcriptError.message}`);
      }

      if (transcriptText && transcriptText.trim().length > 50) {
        source = "transcript";
        // Cap length so we don't blow past the model's comfortable context.
        finalInputText = transcriptText.slice(0, 18000);

        // Non-essential: also grab the real title for display/history naming.
        // Failure here shouldn't block the main flow since we already have
        // the transcript we actually need.
        try {
          const meta = await fetchVideoMetadata(videoId);
          videoTitle = meta.title;
        } catch {
          // ignore - title is cosmetic when we already have the transcript
        }
      } else {
        // 2) Transcript wasn't available (captions off, blocked, etc).
        //    Fall back to the video's real title/author via oEmbed instead
        //    of guessing blindly from the ID - this is what previously
        //    caused flashcards on a completely unrelated topic.
        try {
          const meta = await fetchVideoMetadata(videoId);
          videoTitle = meta.title;
          source = "title";
          finalInputText = `Video title: "${meta.title}"${
            meta.author ? ` (channel: ${meta.author})` : ""
          }`;
          console.log(`Falling back to video title: "${meta.title}"`);
        } catch (metaError) {
          console.warn(`oEmbed fetch also failed: ${metaError.message}`);
          // 3) Both signals failed - be honest instead of inventing content.
          return res.status(422).json({
            error:
              "Couldn't read this video's captions or details. It may have captions disabled, be private/age-restricted, or YouTube is temporarily blocking automated requests. Try a different video, or paste the topic as plain text instead.",
          });
        }
      }
    } else {
      console.log("Processing direct topic/text input.");
    }

    const prompt =
      source === "transcript"
        ? `You are an expert study assistant. Using ONLY the actual video transcript content below, break it down into a clean study deck of 5 to 7 crucial study concepts that are genuinely covered in this transcript.

Return the response as a JSON array of objects with the exact structure:
[{ "q": "Short Concept Name", "a": "Detailed explanation sentence" }]

Video Transcript:
${finalInputText}

Return ONLY valid JSON. Do not include any markdown styling or \`\`\`json blocks.`
        : source === "title"
        ? `You are an expert study assistant. The video's transcript isn't available, so base your answer strictly on this real video title (do not invent an unrelated subject): ${finalInputText}

Generate a study deck of 5 to 7 crucial concepts that someone would expect to learn from a video with this exact title.

Return the response as a JSON array of objects with the exact structure:
[{ "q": "Short Concept Name", "a": "Detailed explanation sentence" }]

Return ONLY valid JSON. Do not include any markdown styling or \`\`\`json blocks.`
        : `You are an expert study assistant. Break down the following educational topic into a clean study deck of 5 to 7 crucial study concepts.

Return the response as a JSON array of objects with the exact structure:
[{ "q": "Short Concept Name", "a": "Detailed explanation sentence" }]

Topic:
${finalInputText}

Return ONLY valid JSON. Do not include any markdown styling or \`\`\`json blocks.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const parsedCards = safeParseJsonArray(response.text);

    res.json({
      flashcards: parsedCards,
      meta: { source, videoTitle },
    });
  } catch (error) {
    console.error("Summary API Error:", error);
    res.status(500).json({ error: "Failed to generate structured flashcards from content." });
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

    const quizData = safeParseJsonArray(response.text);

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