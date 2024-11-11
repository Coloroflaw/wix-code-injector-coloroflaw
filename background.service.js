async function injectCode(code, injectionTarget) {
  try {
    let activeTab = await chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => tabs[0]);

    await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      function: (codeToInject, target) => {
        // Determine where to inject the code
        let targetElement;
        if (target === 'head') {
          targetElement = document.head;
        } else if (target === 'body') {
          targetElement = document.body;
        } else {
          // Assume it's a CSS selector
          targetElement = document.querySelector(target);
        }

        if (targetElement) {
          const scriptElement = document.createElement('script');
          scriptElement.textContent = codeToInject;
          targetElement.appendChild(scriptElement);
        } else {
          console.error("Target element not found.");
        }
      },
      args: [code, injectionTarget]
    });

  } catch (error) {
    console.error("Error injecting code:", error);
  }
}

async function fetchCodeFromGemini(prompt, apiKey) {
  const response = await fetch('https://api.gemini.com/v1/completions', { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      prompt: prompt,
      // ... other Gemini API parameters like model, temperature, etc.
    })
  });

  const data = await response.json();
  // Extract the code from the data object, adjust based on the actual response
  return data.choices[0].text; 
}

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "injectCode") {
    if (request.code) {
      // Inject user-provided code
      injectCode(request.code, request.target);
    } else if (request.prompt) {
      try {
        // Get the API key (you might store this using Chrome extension storage)
        const apiKey = await chrome.storage.local.get("apiKey").then(result => result.apiKey); 
        const code = await fetchCodeFromGemini(request.prompt, apiKey);
        injectCode(code, request.target);
      } catch (error) {
        console.error("Error fetching code from Gemini:", error);
      }
    }
  }
});
