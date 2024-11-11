async function injectCode(code, injectionTarget) {
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
        model: "gemini-pro", // Or the appropriate Gemini model
        max_tokens: 500 // Adjust as needed
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices.length || !data.choices[0].text) {
       throw new Error("Unexpected Gemini API response format.");
    }
    return data.choices[0].text;

  } catch (error) {
    console.error("Error fetching from Gemini:", error);
    throw error; 
  }
}


chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "injectCode") {
    try {
      let code;
      if (request.code) {
        code = request.code;
      } else if (request.prompt) {
        const apiKey = await chrome.storage.local.get("apiKey").then(result => result.apiKey);
        if (!apiKey) { throw new Error("Gemini API key missing. Please set it in the extension options."); }
        code = await fetchCodeFromGemini(request.prompt, apiKey);
      }

      if (code) {
         injectCode(code, request.target || 'body'); 
      } else {
        console.error("No code provided or generated.");
      }
      sendResponse({ success: true }); 

    } catch (error) {
      console.error("Error handling injection request:", error);
      sendResponse({ success: false, error: error.message });
    }
 }
});
