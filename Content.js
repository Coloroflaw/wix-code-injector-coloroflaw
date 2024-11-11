// content.js

async function injectCode(code, target) {  // Make injectCode async
    try {
        // Find the target element.  Provide better error handling if not found.
        const targetElement = document.querySelector(target);
        if (!targetElement) {
            console.error("Injection target not found:", target);
            return; // Or throw an error if you prefer
        }

        const script = document.createElement('script');
        script.textContent = code;
        targetElement.appendChild(script);
    } catch (error) {
        console.error("Error injecting code:", error, code, target); // Include more details in error
    }
}


async function getPrompt() {
    return new Promise((resolve) => {  // Use a Promise for async prompt
        const promptResult = prompt("Enter your prompt for Gemini:");
        resolve(promptResult); // Resolve with the prompt value (or null if canceled)
    });
}

async function generateCodeWithGemini(prompt, apiKey) { // Pass apiKey directly
    try {
        const response = await fetch('https://api.gemini.com/v1/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                prompt: prompt,
                model: "gemini-pro", // Specify the model
                max_tokens: 500      // Important: Limit the response size
            })
        });

        if (!response.ok) {
            const errorText = await response.text(); // Get the error message from Gemini
            throw new Error(`Gemini API Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return data.choices[0].text; // Adjust if necessary

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error; // Re-throw to handle in the calling function
    }
}

// Listener for messages from other parts of the extension (e.g., popup)
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "injectGeminiCode") {
        try {
            const apiKey = await chrome.storage.local.get("apiKey").then(result => result.apiKey);
            if (!apiKey) {
                throw new Error("API key not found.  Please set it in the options.");
            }

            const prompt = await getPrompt();
            if (prompt) {
                const code = await generateCodeWithGemini(prompt, apiKey); // Pass apiKey
                injectCode(code, request.target || "head"); // Default to "head" if no target
                sendResponse({ success: true });
            } else {
                sendResponse({ success: false, error: "Prompt canceled" }); // Handle prompt cancellation
            }
        } catch (error) {
            console.error("Error in injectGeminiCode:", error);
            sendResponse({ success: false, error: error.message });
        }

        return true; // Important: Keep the message channel open for async sendResponse
    }
});


// ... (Context menu and button injection code - see important notes below)
