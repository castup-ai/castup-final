const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testKey() {
    const key = "AIzaSyB-oTv5lL2mJQe0Fk3W1CLQqVrhcbU5hCw";
    const genAI = new GoogleGenerativeAI(key);
    
    try {
        console.log("Testing Gemini 1.5 Flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello, are you working?");
        console.log("Response:", result.response.text());
        console.log("✅ Success!");
    } catch (error) {
        console.error("❌ Error encountered:");
        console.error("Message:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
    }
}

testKey();
