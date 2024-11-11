document.getElementById('injectCodeButton').addEventListener('click', () => {
    const code = document.getElementById('codeInput').value;
    injectCode(code); // Helper function below
});

document.getElementById('generateCodeButton').addEventListener('click', () => {
    const prompt = document.getElementById('promptInput').value;
    const target = getTarget();

    generateAndInjectCode(prompt, target)
});


document.getElementById('optionsButton').addEventListener('click', () => {
  if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
 }

});

document.getElementById('targetSelect').addEventListener('change', () => {
  const customTargetInput = document.getElementById('customTarget');
  customTargetInput.style.display = (document.getElementById('targetSelect').value === 'custom') ? 'block' : 'none';
});



function getTarget() {
    const selectElement = document.getElementById('targetSelect');
    if (selectElement.value === "custom") {
        return document.getElementById('customTarget').value; // If custom, use textbox value. Check it's not empty.
    }
    return selectElement.value;
}

function injectCode(code, target) {
  chrome.runtime.sendMessage({ action: "injectCode", code: code, target: target || 'body'}, (response) => {
        // Handle response from background script (optional)
  });
}

function generateAndInjectCode(prompt, target) {
  chrome.runtime.sendMessage({ action: "callFunction", functionName: "generate_wix_code", arguments: { prompt: prompt, target: target } }, (response) => {
        // ...Handle response
 });
}
