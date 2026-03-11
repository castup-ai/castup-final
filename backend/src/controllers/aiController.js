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

        // System instructions to guide the AI's persona
        const systemPrompt = `You are CastUp's AI Assistant, an intelligent cinema industry companion. 
You help users with finding talent, giving profile improvement tips, industry standards, and answering cinema-related questions.
You are concise, professional, and knowledgeable about the film and entertainment industry (actors, crew, directors, cinematographers, rates, etc.).
Keep your answers formatted in a very clean, brief, modern way without rambling. Use bullet points when helpful.`;

        // Format the entire conversation into one clear text block for the model
        let fullPrompt = `SYSTEM INSTRUCTION: ${systemPrompt}\n\n`;
        
        if (history && history.length > 0) {
            fullPrompt += "PREVIOUS CONVERSATION HISTORY:\n";
            history.forEach(msg => {
                const roleName = msg.role === 'ai' ? 'Assistant' : 'User';
                fullPrompt += `${roleName}: ${msg.content}\n\n`;
            });
        }
        
        fullPrompt += `CURRENT USER MESSAGE:\nUser: ${message}\n\nAssistant:`;

        const result = await model.generateContent(fullPrompt);
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
