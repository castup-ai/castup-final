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
            "gemini-1.5-pro",
            "gemini-1.5-pro-latest",
            "gemini-pro"
        ];

        let responseText = '';
        let lastError = null;

        for (const name of modelNames) {
            try {
                // Try each model until one works
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
                console.log(`AI Success with model: ${name}`);
                break; // Success!
            } catch (error) {
                console.error(`AI Model [${name}] failed:`, error.message);
                lastError = error;
                // If it's a 404, we continue to the next model. 
                // If it's something else (like 401 Unauthorized), we might want to stop, 
                // but for now we try all to be safe.
            }
        }

        if (lastError && !responseText) {
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

