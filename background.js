// background.js (Final version - Gemini API calls using fetch)

// ... (injectCode function - same as before)

async function fetchCodeFromGemini(prompt, apiKey) {
    try {
        const response = await fetch('https://api.gemini.com/v1/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                prompt: prompt,
                model: "gemini-pro", // Or the appropriate Gemini model
                max_tokens: 512     // Important: Set a reasonable limit
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        if (!data.choices || !data.choices.length || !data.choices[0].text) {
            throw new Error("Unexpected response format from Gemini API");
        }
        return data.choices[0].text;
    } catch (error) {
        console.error("Gemini API error:", error);
        throw error; // Re-throw for outer handling
    }
}

// ... (generateWixCodeFunction, handleFunctionCall, message listener - same as the final version)
