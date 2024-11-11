// options.js
document.addEventListener('DOMContentLoaded', () => {
    loadApiKey(); // Load the saved API key when the page loads

    document.getElementById('saveApiKey').addEventListener('click', () => {
        const apiKey = document.getElementById('apiKey').value;
        saveApiKey(apiKey);
    });
});

function saveApiKey(apiKey) {
    chrome.storage.local.set({ apiKey: apiKey }, () => {
        const statusMessage = document.getElementById('statusMessage');
        statusMessage.textContent = "API key saved!";
        setTimeout(() => { statusMessage.textContent = ""; }, 2000); // Clear message after 2 seconds
    });
}

function loadApiKey() {
    chrome.storage.local.get("apiKey", (result) => {
        document.getElementById('apiKey').value = result.apiKey || "";
    });
}
