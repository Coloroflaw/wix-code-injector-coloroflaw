// background.js
async function injectCode(code, injectionTarget) { // Improved with error handling
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        if (!activeTab || !activeTab.id) {
            console.error("No active tab found.");
            return;
        }
        await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: (codeToInject, target) => {
                let targetElement;
                try {
                    if (target === 'head') {
                      targetElement = document.head;
                    } else if (target === 'body') {
                      targetElement = document.body;
                    } else {
                      targetElement = document.querySelector(target);
                      if (!targetElement) {
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
    try {
      const response = await fetch('https://api.gemini.com/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          prompt: prompt,
          model: "gemini-pro", // Or the correct Gemini model name
          max_tokens: 512       // Adjust the max tokens as needed
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text(); // Get the error message from Gemini
        throw new Error(`Gemini API Error ${response.status}: ${errorText}`);
      }
  
      const data = await response.json();
      if (!data.choices || !data.choices.length || !data.choices[0].text) {
        throw new Error("Unexpected response format from Gemini API"); // Handle unexpected response formats
      }
  
      return data.choices[0].text;
  
    } catch (error) {
      console.error("Gemini API error:", error);
      throw error;
    }
}



// Define your functions with signatures
const generateWixCodeFunction = { // ... (As defined in the previous response) };

// ... other function signatures if needed

async function handleFunctionCall(functionName, args, apiKey) {
    if (functionName === "generate_wix_code") {
        // Combine arguments into a prompt
        const prompt = `Generate Wix Velo code for:\n${args.prompt}\n Inject into: ${args.target || 'body'}`;
        const code = await fetchCodeFromGemini(prompt, apiKey);
        injectCode(code, args.target || 'body'); // Inject with a default target
    }
    // ...handle calls to other functions if you have them

}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {

    if (request.action === "callFunction" && request.functionName && request.arguments) {
        const apiKey = await chrome.storage.local.get("apiKey").then(result => result.apiKey);
        try {
            await handleFunctionCall(request.functionName, request.arguments, apiKey); // Make the parameters an object
            sendResponse({success: true });
        } catch (error) {
            console.error("Function call error:", error)
            sendResponse({success: false, error: error.message});

        }
        return true; // Very Important, for async messaging!
    }
    if (request.action === "injectCode") { // ... handle injectCode ... }; // Code for direct injection
    // other message listeners ...
});
