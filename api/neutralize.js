import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { text, userStrikes } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this student grievance: "${text}". 
    1. If abusive or toxic, set isAbusive: true.
    2. Provide normalizedText (professional version, retaining the core meaning but removing emotions/toxicity).
    3. If not abusive, normalizedText should be the same as input with minor grammar fixes.
    Return strictly as JSON: { "isAbusive": boolean, "normalizedText": string }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json|```/g, "").trim();
    const ai = JSON.parse(responseText);

    res.status(200).json(ai);
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "AI Processing Failed" });
  }
}
