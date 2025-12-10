const API_KEY = "AIzaSyBHYVoW_JJDgPXXJ_RLcvOWq_sAYANdPiM";
const MODEL_ID = "gemini-flash-latest";
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}`;

export const initializeGemini = (apiKey: string) => {
    // No-op for direct fetch implementation, validation happens at call time
    if (!apiKey) console.warn("initializeGemini: API Key missing");
};

export const generateResponse = async (prompt: string, context?: string) => {
    if (!API_KEY) {
        return "Configuration Error: API Key missing.";
    }

    try {
        const fullPrompt = context
            ? `Context: ${context}\n\nUser: ${prompt}\n\nAI:`
            : prompt;

        const response = await fetch(`${BASE_URL}:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: fullPrompt }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error:", data);
            return `I apologize, I'm having trouble connecting. (Error: ${data.error?.message || response.status})`;
        }

        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.warn("Unexpected Gemini response structure:", data);
            return "I couldn't understand the response from my brain.";
        }

    } catch (error) {
        console.error("Error generating Gemini response:", error);
        return "I apologize, but I'm unable to process your request at the moment.";
    }
};

export const generateImageResponse = async (prompt: string, base64Image: string) => {
    if (!API_KEY) {
        return "Configuration Error: API Key missing.";
    }

    try {
        const response = await fetch(`${BASE_URL}:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: base64Image
                            }
                        }
                    ]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini Image API Error:", data);
            return `I apologize, I'm having trouble analyzing the image. (Error: ${data.error?.message || response.status})`;
        }

        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.warn("Unexpected Gemini image response structure:", data);
            return "I couldn't analyze the image properly.";
        }
    } catch (error) {
        console.error("Error analyzing image:", error);
        return "I had trouble analyzing that image.";
    }
}
