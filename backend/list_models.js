import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        console.log('Fetching models...');
        const models = await genAI.listModels();
        console.log('Available Models:');
        models.models.forEach(m => {
            console.log(`- ${m.name} (supports: ${m.supportedGenerationMethods})`);
        });
    } catch (error) {
        console.error('Error listing models:', error.message);
    }
}

listModels();
