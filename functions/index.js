const functions = require("firebase-functions");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
// Note: Ensure GEMINI_KEY is set in functions/.env or config
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || process.env.VITE_GEMINI_KEY);

exports.neutralize = functions.https.onCall(async (data, context) => {
    const { text, userStrikes } = data;

    if (!text) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "text" argument.');
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `You are a Trust & Safety AI. Your job is to neutralize toxic or informal student grievances into professional, formal office language.
            
            Input: "${text}"
            
            Rules:
            1. Identify if the text contains toxic, gross (e.g. "pee", "vomit"), abusive, or highly informal language. Set "isAbusive": true if found.
            2. "normalizedText": REWRITE the entire input to be professional, polite, and actionable. 
               - "Food is like pee" -> "The quality of the food served in the mess is unsatisfactory and requires improvement."
               - "Warden is stupid" -> "There are concerns regarding the warden's conduct."
               - "Wifi sucks" -> "The connectivity in the hostel is unreliable."
            3. If the input is already clean, "normalizedText" should be the polished version of the input.
            
            Output JSON ONLY: { "isAbusive": boolean, "normalizedText": string }`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().replace(/```json|```/g, "").trim();
        const ai = JSON.parse(responseText);

        return ai;
    } catch (error) {
        console.error("Gemini Error:", error);
        // Return a fallback so the app doesn't crash
        return {
            isAbusive: false,
            normalizedText: text,
            error: "AI processing unavailable"
        };
    }
});
