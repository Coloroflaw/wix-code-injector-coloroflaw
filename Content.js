// content.js

function injectCode(code, target) {
  const script = document.createElement('script');
  script.textContent = code;
  document.querySelector(target).appendChild(script);
}

function getPrompt() {
  // 1.  Elegant Prompt Input: Instead of a simple prompt, use a modal or sidebar for a better user experience.
  const prompt = prompt("Enter your prompt for Gemini:"); // Replace with your input method
  return prompt;
}

async function generateCodeWithGemini(prompt) {
  const apiKey = await chrome.storage.local.get("apiKey").then(result => result.apiKey);
  const response = await fetch('https://api.gemini.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      prompt: prompt,
      // ... other Gemini API parameters
    })
  });
  const data = await response.json();
  return data.choices[0].text; // Adjust if necessary
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "injectGeminiCode") {
    const prompt = getPrompt();
    if (prompt) {
      try {
        const code = await generateCodeWithGemini(prompt);
        injectCode(code, request.target); // Inject into the requested target
      } catch (error) {
        console.error("Error generating or injecting code:", error);
      }
    }
  }
});

// 2.  Contextual Integration:  Add an option to generate code from selected text in the Wix editor.
// Example (using a context menu):

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "geminiGenerate",
    title: "Generate Code with Gemini",
    contexts: ["selection"] // Show when text is selected
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "geminiGenerate" && info.selectionText) {
    const prompt = `Generate Wix Velo code for: ${info.selectionText}`;
    try {
      const code = await generateCodeWithGemini(prompt);
      // Determine injection target based on context (e.g., within a function, in the <head>)
      const target = "head"; // Replace with your logic
      injectCode(code, target);
    } catch (error) {
      console.error("Error generating or injecting code:", error);
    }
  }
});

// 3.  Streamlined Workflow: Add a button directly in the Wix Editor UI for quick access.
// You'll need to find a suitable place and method to inject this button into the Wix Editor.

const geminiButton = document.createElement('button');
geminiButton.textContent = 'Generate with Gemini';
geminiButton.style.position = 'fixed'; // Example styling
geminiButton.style.top = '10px';
geminiButton.style.right = '10px';
geminiButton.addEventListener('click', async () => {
  const prompt = getPrompt();
  if (prompt) {
    try {
      const code = await generateCodeWithGemini(prompt);
      const target = "head"; // Or get the target from user input
      injectCode(code, target);
    } catch (error) {
      console.error("Error generating or injecting code:", error);
    }
  }
});

// Inject the button (you'll need to find the appropriate parent element in Wix)
const wixEditorToolbar = document.querySelector('.wix-editor-toolbar'); // Example
if (wixEditorToolbar) {
  wixEditorToolbar.appendChild(geminiButton);
}
