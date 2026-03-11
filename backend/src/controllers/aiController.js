import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini AI SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const chat = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
             return res.status(500).json({ error: 'Gemini API key is not configured' });
        }

        // Get the model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Map frontend "ai" and "user" roles to Gemini "model" and "user" roles
        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // System instructions to guide the AI's persona
        const systemPrompt = `You are CastUp's AI Assistant, an intelligent cinema industry companion. 
You help users with finding talent, giving profile improvement tips, industry standards, and answering cinema-related questions.
You are concise, professional, and knowledgeable about the film and entertainment industry (actors, crew, directors, cinematographers, rates, etc.).
Keep your answers formatted in a very clean, brief, modern way without rambling. Use bullet points when helpful.`;

        // We can inject the system prompt as the first message if history is empty,
        // or just prepend it to the current message if the SDK handles it differently.
        // For simple chat completion:
        
        const chatSession = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: "SYSTEM INSTRUCTION: " + systemPrompt }]
                },
                {
                    role: 'model',
                    parts: [{ text: "Understood. I am CastUp's intelligent cinema industry AI companion. How can I help you today?" }]
                },
                ...formattedHistory
            ]
        });

        const result = await chatSession.sendMessage(message);
        const responseText = result.response.text();

        res.json({
            success: true,
            response: responseText
        });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: 'Failed to communicate with AI Assistant' });
    }
};
