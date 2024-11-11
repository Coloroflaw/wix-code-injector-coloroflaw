async function injectCode(code, injectionTarget) {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];

    if (!activeTab || !activeTab.id) {  // Handle potential missing tab
      console.error("No active tab found.");
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: (codeToInject, target) => { // Use 'func' instead of 'function' (deprecated)
        let targetElement;
        try { // Add a try-catch inside the injected script for robustness.
            if (target === 'head') {
              targetElement = document.head;
            } else if (target === 'body') {
              targetElement = document.body;
            } else {
              targetElement = document.querySelector(target);
              if (!targetElement) { // More specific error
                throw new Error(`Target element not found: ${target}`);
              }
            }

            const scriptElement = document.createElement('script');
            scriptElement.textContent = codeToInject;
            targetElement.appendChild(scriptElement);
        } catch (injectionError) {
            console.error("Code injection error:", injectionError);
        }

      },
      args: [code, injectionTarget]
    });

  } catch (error) {
    console.error("Error injecting code:", error);
  }
}

async function fetchCodeFromGemini(prompt, apiKey) {
  try { // Important to handle network errors
    const response = await fetch('https://api.gemini.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: prompt,
        // Add other Gemini API parameters as needed (model, temperature, max_tokens, etc.)
        model: "gemini-pro", // or other model names
        max_tokens: 500 // Example: limit generated code length, adjust as required
      })
    });

    if (!response.ok) { // Check for HTTP errors
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices.length || !data.choices[0].text) { // Check for expected data structure
       throw new Error("Unexpected Gemini API response format.");
    }
    return data.choices[0].text;
  } catch (error) {
    console.error("Error fetching from Gemini:", error);
    throw error; // Re-throw so the calling function can handle the error
  }
}

// Listen for messages
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "injectCode") {
    try { // Handle potential errors in fetching or injecting code
      let code;
      if (request.code) {
        code = request.code;
      } else if (request.prompt) {
        const apiKey = await chrome.storage.local.get("apiKey").then(result => result.apiKey);
        if (!apiKey) { throw new Error("Gemini API key missing. Please set it in the extension options."); }
        code = await fetchCodeFromGemini(request.prompt, apiKey);
      }

      if (code) {
         injectCode(code, request.target || 'body'); // Default to 'body' if no target
      } else {
        console.error("No code provided or generated.");
      }
      sendResponse({ success: true });  // Optional: Send a response to confirm success

    } catch (error) {
      console.error("Error handling injection request:", error);
      sendResponse({ success: false, error: error.message }); // Inform the sender about the error
    }
 }
});
