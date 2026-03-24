const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("GEMINI_API_KEY is missing in .env");
        return;
    }
    console.log("Using key starting with:", key.substring(0, 10));
    const genAI = new GoogleGenerativeAI(key);
    
    try {
        // Unfortunately standard JS SDK doesn't expose listModels nicely in older versions.
        // We'll just fetch directly.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        if (data.models) {
            console.log("Available models:");
            data.models.forEach(m => console.log(`- ${m.name} (methods: ${m.supportedGenerationMethods.join(', ')})`));
        } else {
            console.error("Failed to fetch models:", data);
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
