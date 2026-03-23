import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const chat = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error('AI Chat Error: GEMINI_API_KEY is not set in environment variables');
            return res.status(500).json({ 
                success: false, 
                error: 'AI service is not configured. Please add GEMINI_API_KEY to environment variables.' 
            });
        }

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: "You are CastUp AI Assistant, a helpful companion for cinema industry professionals. Help users find talent, prepare for auditions, and answer questions about filmmaking. Be concise and professional."
        });

        // Convert history format if needed (Gemini uses { role, parts: [{ text: '' }] })
        let chatHistory = (history || [])
            .filter(msg => msg.content && msg.content.trim()) // filter empty messages
            .map(msg => ({
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

        // CRITICAL: Gemini history MUST start with a 'user' message.
        // If the frontend sends the initial AI greeting as the first history item, skip it.
        while (chatHistory.length > 0 && chatHistory[0].role === 'model') {
            chatHistory.shift();
        }

        const chatSession = model.startChat({
            history: chatHistory,
        });

        const result = await chatSession.sendMessage(message);
        const responseText = result.response.text();

        res.json({
            success: true,
            response: responseText
        });
    } catch (error) {
        console.error('AI Chat Error:', error.message || error);
        res.status(500).json({ 
            success: false, 
            error: `AI error: ${error.message || 'Failed to get AI response'}` 
        });
    }
};

