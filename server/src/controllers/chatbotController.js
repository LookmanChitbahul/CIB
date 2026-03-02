const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.chat = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "Gemini API Key is missing in server .env" });
        }

        console.log("Chatbot: Initializing for Gemini 3 Flash Preview");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // System instruction to keep it focused on the CIB system
        const systemInstruction = `
          You are the official AI assistant for the CIB Projects Management System.
          GOAL: Provide extremely concise, bulleted information about the CIB system.
          
          CONTEXT:
          - System manages government infrastructure/service projects.
          - Key Fields: PID, Project Name, Lead Manager, Ministry/Dept, Type, Status, Funding, Contract Value.
          
          STRICT CONSTRAINTS:
          - ALWAYS keep responses short and direct.
          - ALWAYS use standard Markdown bullet points (e.g., * Item) on separate lines for steps, lists, or features.
          - NEVER use long paragraphs. Limit responses to 3-4 bullet points where possible.
          - Only discuss CIB system or project management topics.
        `;

        // Using gemini-3-flash-preview for faster and more capable responses
        // We pass systemInstruction here for better performance
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            systemInstruction: systemInstruction
        });

        console.log("Chatbot: Starting chat session with initial history length:", history?.length || 0);

        // Safety: Gemini history MUST start with role: 'user'
        let safeHistory = history || [];
        while (safeHistory.length > 0 && safeHistory[0].role === 'model') {
            console.log("Chatbot: Trimming leading 'model' message from history");
            safeHistory.shift();
        }

        const chat = model.startChat({
            history: safeHistory,
            generationConfig: {
                maxOutputTokens: 512,
            },
        });

        console.log("Chatbot: Sending message...");
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();
        console.log("Chatbot: Success.");

        res.json({ text });
    } catch (error) {
        console.error("Gemini Technical Hiccup Details:", error);

        // Provide more context on the error to the frontend
        res.status(500).json({
            error: "Failed to get AI response",
            details: error.message,
            name: error.name,
            status: error.status || 500
        });
    }
};
