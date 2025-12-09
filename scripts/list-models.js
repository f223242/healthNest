const API_KEY = "AIzaSyBHYVoW_JJDgPXXJ_RLcvOWq_sAYANdPiM";

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(model => {
                if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${model.name}`);
                }
            });
        } else {
            console.error("Error listing models:", data);
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

listModels();
