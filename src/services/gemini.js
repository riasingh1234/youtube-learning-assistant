import axios from "axios";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
console.log("API KEY:", API_KEY);

export async function generateSummary(text) {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
    {
      contents: [
        {
          parts: [
            {
              text: `Summarize this in 5 bullet points:\n${text}`
            }
          ]
        }
      ]
    }
  );

  return response.data.candidates[0].content.parts[0].text;
}