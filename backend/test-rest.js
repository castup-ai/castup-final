async function listModels() {
    console.log("Fetching allowed models...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyBCiD733DEnJ_Lu_YYGrfEukGJO0vKoxm4`);
        const data = await response.json();
        
        console.log("Status:", response.status);
        if (data.models) {
            console.log("Allowed Models:");
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log("Response:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}
listModels();
