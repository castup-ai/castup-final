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

        const modelNames = [
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-pro"
        ];

        let responseText = '';
        let lastError = null;

        for (const name of modelNames) {
            try {
                const model = genAI.getGenerativeModel({ 
                    model: name,
                    systemInstruction: "You are CastUp AI Assistant, a helpful companion for cinema industry professionals. Help users find talent, prepare for auditions, and answer questions about filmmaking. Be concise and professional."
                });

                const chatSession = model.startChat({
                    history: chatHistory,
                });

                const result = await chatSession.sendMessage(message);
                responseText = result.response.text();
                lastError = null;
                break; // Success!
            } catch (error) {
                console.error(`AI Model [${name}] failed:`, error.message);
                lastError = error;
            }
        }

        if (lastError) {
            throw lastError;
        }

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

