import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export const chat = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!groq) {
            console.error('AI Chat Error: GROQ_API_KEY is not set in environment variables');
            return res.status(500).json({ 
                success: false, 
                error: 'AI service is not configured. Please add GROQ_API_KEY to environment variables.' 
            });
        }

        const modelNames = [
            "llama-3.1-8b-instant",
            "mixtral-8x7b-32768",
            "llama3-70b-8192"
        ];

        let responseText = '';
        let lastError = null;

        // Convert history format if needed (Groq uses { role: 'user'|'assistant'|'system', content: '' })
        let rawHistory = (history || [])
            .filter(msg => msg.content && msg.content.trim()) // filter empty messages
            .map(msg => ({
                role: msg.role === 'ai' || msg.role === 'model' ? 'assistant' : 'user',
                content: msg.content
            }));

        let chatHistory = [
            {
                role: "system",
                content: "You are CastUp AI Assistant, a helpful companion for cinema industry professionals. Help users find talent, prepare for auditions, and answer questions about filmmaking. Be concise and professional."
            },
            ...rawHistory,
            {
                role: "user",
                content: message
            }
        ];

        for (const name of modelNames) {
            try {
                // Try each model until one works
                const chatCompletion = await groq.chat.completions.create({
                    messages: chatHistory,
                    model: name,
                    temperature: 0.7,
                    max_tokens: 1024,
                    top_p: 1,
                    stream: false,
                });

                responseText = chatCompletion.choices[0]?.message?.content || "";
                lastError = null;
                console.log(`AI Success with model: ${name}`);
                break; // Success!
            } catch (error) {
                console.error(`AI Model [${name}] failed:`, error.message);
                lastError = error;
                // If it fails, continue to the next fallback model.
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

