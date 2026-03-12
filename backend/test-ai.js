import axios from 'axios';

async function testAi() {
    console.log("Testing POST to http://localhost:5000/api/ai/chat...");
    try {
        const res = await axios.post('http://localhost:5000/api/ai/chat', {
            message: "Hello",
            history: []
        });
        console.log("Success! Response:");
        console.log(res.data);
    } catch (e) {
        console.error("HTTP Request Failed:");
        if (e.response) {
            console.error("Status:", e.response.status);
            console.error("Response Body:", JSON.stringify(e.response.data, null, 2));
        } else {
            console.error(e.message);
        }
    }
}

testAi();
