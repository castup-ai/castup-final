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

        // Get the model - Using 1.5 Flash for better stability and free tier compatibility
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // System instructions
        const systemPrompt = `You are CastUp's AI Assistant, an cinema industry expert. 
        Help with finding talent, profile tips, and cinema questions. 
        Be professional, brief, and use bullet points.`;

        let fullPrompt = `SYSTEM: ${systemPrompt}\n\n`;
        
        if (history && history.length > 0) {
            history.forEach(msg => {
                fullPrompt += `${msg.role === 'ai' ? 'Assistant' : 'User'}: ${msg.content}\n\n`;
            });
        }
        
        fullPrompt += `User: ${message}\nAssistant:`;

        const result = await model.generateContent(fullPrompt);
        const responseText = result.response.text();

        res.json({ success: true, response: responseText });
    } catch (error) {
        console.error('AI Chat Error:', error);
        
        let errorMessage = "I'm having trouble thinking right now. Please try again later.";
        
        if (error.message?.includes('API key was reported as leaked')) {
            errorMessage = "⚠️ **Security Alert**: Your Google Gemini API key has been deactivated by Google because it was reported as leaked. Please generate a **New API Key** in Google AI Studio and update your configuration.";
        } else if (error.message?.includes('API key not found')) {
            errorMessage = "⚠️ **Configuration Error**: No valid API key found. Please check your Render environment variables.";
        } else if (error.message?.includes('User location is not supported')) {
            errorMessage = "⚠️ **Regional Restriction**: Gemini AI is currently not available in your region with this API key.";
        }

        res.json({ success: true, response: errorMessage });
    }
};
