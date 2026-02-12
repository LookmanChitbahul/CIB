const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.chat = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "Gemini API Key is missing in server .env" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using gemini-2.0-flash for faster and more capable responses
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // System instruction to keep it focused on the CIB system
        const systemPrompt = `
      You are the official AI assistant for the CIB Projects Management System.
      
      CONTEXT:
      - This system is used by government officials to manage internal infrastructure and service projects.
      - Core fields: PID (Unique ID), Project Name, Lead Manager, Ministry, Type (NEW, ONGOING, ON_HOLD, COMPLETED), Status (Narrative Progress), Funding (YES/NO/FUNDED), and Contract Value.
      - Key Features: Total project dashboard, filtering, searching, and exporting reports to Excel/PDF.
      
      INSTRUCTIONS:
      - Be helpful, professional, and concise.
      - Use bullet points for steps or lists.
      - If the user asks how to do something, explain the steps (e.g., "Go to the Projects page and click the 'New Project' button").
      - Only discuss topics related to this management system or project management.
      - Current user message: ${message}
    `;

        // We can use startChat for better conversation flow
        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(systemPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ text });
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "Failed to get AI response", details: error.message });
    }
};
