import OpenAI from 'openai';

// Initialize the OpenAI SDK
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'missing-key',
});

export const chat = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // System instructions (prepended to history)
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

        const response = await openai.responses.create({
            model: "gpt-5-nano",
            input: fullPrompt,
            store: true,
        });

        res.json({ success: true, response: response.output_text });
    } catch (error) {
        console.error('AI Chat Error:', error);
        
        let errorMessage = "I'm having trouble thinking right now. Please try again later.";
        
        if (error.message) {
             console.error("OpenAI Details:", error.message);
        }

        res.json({ success: true, response: errorMessage });
    }
};
