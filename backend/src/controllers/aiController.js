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

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: "You are CastUp AI Assistant, a helpful companion for cinema industry professionals. Help users find talent, prepare for auditions, and answer questions about filmmaking. Be concise and professional."
        });

        // Convert history format if needed (Gemini uses { role, parts: [{ text: '' }] })
        const chatHistory = (history || []).map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

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
        console.error('AI Chat Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get AI response' 
        });
    }
};
