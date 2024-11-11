// content.js (Example - adapt as needed.  You might not need this at all)

// Listen for messages from the background script.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "injectCustomCode") {  // Example: Inject code at a specific location
      try {
          const targetElement = findWixElement(request.wixSelector); // Replace with your Wix element selection logic

          if (targetElement) {
              const script = document.createElement('script');
              script.textContent = request.code;
              targetElement.appendChild(script);
              sendResponse({ success: true });
          } else {
              sendResponse({ success: false, error: "Wix element not found" });
          }
      } catch (error) {
          sendResponse({ success: false, error: error.message });
      }

        // Important: Return true to indicate you'll send a response asynchronously.
      return true;


    }
});




// Example helper function to find a Wix element.
// You'll NEED to adapt this based on Wix's actual structure.
function findWixElement(selector) {
    // This is a VERY basic example.  You'll likely need a much more robust
    // method to find specific Wix elements reliably.
    return document.querySelector(selector);
}


// Example of a function that modifies something in the Wix Editor
function modifyWixEditor() {
  // Inject the Generate Code With Gemini Button, into its assumed location based on the provided GitHub repo, https://github.com/Coloroflaw/wix-code-injector-coloroflaw :
      // Function to dynamically add button in a better manner (with error handling and fallback behavior in case the original web element locations/attributes happen to change in future). 
  const GenerateWithGeminiButton = createGeminiButton(false); // Creates a Generate With Gemini Button if doesn't exist:
    if (GenerateWithGeminiButton !== null){
    const editorToolbar = document.querySelector(".wix-editor-toolbar"); // Replaces/provides the missing logic found in the repo's files (originally using an undefined object: editorToolbar, assumed to be created later/elsewhere/absent by default, causing potential DOM related call stack and browser security violation/page modification/CORS etc related issues). 
        if(editorToolbar!==null && GenerateWithGeminiButton !==null){ 
            // Inject the Gemini Generate button:
                editorToolbar.appendChild(GenerateWithGeminiButton); // Appends/attaches to document after toolbar's been confirmed to exist and after the creation/insertion checks above on Gemini Generate With Button.
      }
    }


}

function createGeminiButton(){
    let GenerateWithGeminiButton = document.querySelector("#geminiGenerateCodeButton");
    const wixEditorToolbar = document.querySelector(".wix-editor-toolbar");
  if (wixEditorToolbar) {  // Wix editor toolbar exists - this conditional appears to be intended/implied in code, as the .wix -editor-toolbar and undefined usage of its elements (without prior check or handling) is unsafe and a potential security issue. This makes insertion reliable in comparison, with only 1 element insertion (button).
       // If a pre-existing GenerateWithGeminiButton has not been identified so far within Wix Velo, try dynamically setting/appending it (and passing argument true indicating it has been pre-setup in content's functions, below): 
      if (!GenerateWithGeminiButton){
            GenerateWithGeminiButton = createGeminiButton(true); // This branch's pre-setup of GenerateWithGeminiButton is created inside `createGeminiButton()` definition using helper function and DOM modification call, instead of using the assumed to exist undefined object `GenerateWithGeminiButton` passed straight to another function: `modifyWixEditor(GenerateWithGeminiButton)`, with a likely undefined error: "Uncaught TypeError: Cannot set properties of undefined (setting 'onclick'), on setting/using: `GenerateWithGeminiButton.onclick = ...`.
      }
  } 
  return GenerateWithGeminiButton; // In cases with invalid DOM location and absence of elements for Generate button and editor toolbar to attach into: error handled internally inside `createGeminiButton()` and it simply passes `null` out.

  // This function definition was outside createGeminiButton in the original provided github file and needed to be internally placed as an argument and part of this block instead.  
    function createGeminiButton(buttonPresetUp) { // Define within parent's closure to allow it to create an element from within as argument, preventing likely invalid undefined property of error by using return values and performing pre-validation/creation of child's required elements, internally inside its scope rather than external functions' contexts passing straight to it, without proper DOM modification stage error handling by confirming editor toolbar is both present, correctly located on page first. Only after all this checks out does `createGeminiButton()` add to page. The default argument value of null button for cases where a valid instance of editor is available but element was already added (such that only buttonPresetUp flag is passed in with existing precreated elements within this outer closure and no DOM operations required again), means the original conditional tests, functions calling `modifyWixEditor` in the background/context where there isn't even a valid instance of editor element location confirmed to be detected is very important to prevent page update-rendering performance issues/memory leaks, in the later stages and also avoid potential document tree security breaches by accidentally re-injecting same button too many times (once per popup or browser tab instance, for instance) in different or worse overwriting already attached events - the original example from linked code in post has these potentially dangerous security and runtime issues:
          if(!buttonPresetUp){ // No prior instance has been created yet in another function, create element locally as inner child to be appended into this:
              GenerateWithGeminiButton = document.createElement('button');
            GenerateWithGeminiButton.textContent = 'Generate with Gemini';
                GenerateWithGeminiButton.id = 'geminiGenerateCodeButton'; // Give the element a unique identifier to retrieve existing instances next time more efficiently - prevent duplicates
          GenerateWithGeminiButton.addEventListener('click', async () => { // Add listener internally within parent functions closure:
        const userPrompt = prompt("Enter your prompt for Gemini:"); // Helper functions from original example to prevent undefined issues.
      if (userPrompt) {
        const target = prompt("Enter the target element (e.g., 'body', '.my-element'):", "body");
          if (target) {
             chrome.runtime.sendMessage({
            action: "callFunction", // For any other listeners or types. 
              functionName: "generate_wix_code", 
             arguments: { prompt: userPrompt, target: target }, // Send args object, more manageable
                  });  
                }
             }
          }); // Original logic maintained, fixed and refactored - note that target may not always refer to elements, selectors (if a URL/string/text has same value). Ensure proper handling in other functions.  
          }    
          return GenerateWithGeminiButton; // Can use this return val internally and pass from main to conditionally add (to check valid editor location exists/found - then adds at a certain trigger timing, after).
}



// Call the function (you'll need to determine the appropriate timing/trigger)
// Example (if your logic determines a valid instance/correct iframe exists to run):
    if(createGeminiButton()===null){ // Not present yet
    const validIframeOfWixEditorPresent = isValidWixEditorIframePresent(); // This needs to be defined based on how you detect the iframe. Assume present if a true response on load.
    if (validIframeOfWixEditorPresent) {
          modifyWixEditor();  // Attach the button and check the document.
           }
   }



//VERY IMPORTANT - Missing in Provided GitHub Code logic for injection
function isValidWixEditorIframePresent(){ // Checks for iframes and Wix editor. Prevents re-adding same button accidentally. IMPORTANT: Handle corner-cases. The logic below needs work and isn't comprehensive - do testing and check multiple iframe nesting to debug further for valid use-cases.   
 let wixEditorIframeFound = false;
 const iframes = document.querySelectorAll('iframe'); // Gets iframe tags on load

 iframes.forEach(iframe => {
  try {  // Error handle CORS or unexpected issues like same origin conflicts
          const iframeContent = iframe.contentDocument || iframe.contentWindow.document;
      if(iframeContent !== undefined) {
              const editorToolbar = iframeContent.querySelector(".wix-editor-toolbar");  // Or any reliable selectors that are less likely to cause issues: ids, data elements attributes (if set explicitly for iframes that Wix Velo may provide/expose within document structure of the web pages using editor embed code) for iframes instead using just ".wix-editor-toolbar", since this can break as class attributes and structures within external wix code updates without warning, so best use another validation approach with it to detect right one in future. Example: a particular wix element id containing all this within - use devtools console to debug your own logic.
      // Wix iframe likely has origin restrictions. In development/local environments, it may need temporary CSP edits with disable eval rules from content in HTTP or if self isn't localhost: etc. 
         if (editorToolbar) {
            wixEditorIframeFound = true;
                    // Example actions once the Wix editor frame has been found 
                         console.log("Valid iframe with Wix Editor toolbar found: Executing function calls safely only on matching selectors within Wix documents, rather than random HTML iframes.");
                    injectCustomCode(myCustomCodeToWixIframe, yourWixSelectorInsideFrame); // ... now inject the custom generated or normal function code safely once iframe of wix been properly validated and only target it's particular elements based on expected and detected structure at specific index/locator etc within Wix document to work only within the given valid instance to avoid causing document related changes across every random iframe! 
                    } 
                 // ... more advanced iframe handling based on more robust attributes detection, index filtering. Test this further... 
           }
        } catch (error) { // To handle security errors and permission-denied edge-cases and avoid accidentally injecting across document origins when invalidated in cases like that on specific invalid instance number
                 console.error("Iframe error.  Check CORS permissions.", error); // Log it and skip iframe  
               wixEditorIframeFound= false; // Mark explicitly. Note: iframeContent and other nested checks with typeof or instance to help confirm within this loop at iframe array iteration level too.
           } 
    }); 

    return wixEditorIframeFound; // Checks using inner wixEditorIframeFound true/false setting above. Note that additional filtering for checking other attributes may further allow multiple matching document or iframe elements using another condition around it too. Also avoid false-positive matches based on dynamic conditions like contentEditable at deeper nested levels or from nested third-party embed elements at deeper document layers' inner indexes. Note also the assumption on specific query selectors is based on Wix structure - if this changes in future code update you will need to revisit target elements like wix iframes/div/code inside document areas' structures in the extension. Handle these potential error cases for when injection breaks, too. 
 }


//Helper to prevent undefined issues 
const prompt= (message, defaultValue) => {
const userInput = window.prompt(message, defaultValue);
    return userInput === null ? null : String(userInput) // Pass return null from prompt if an invalid null object was present on return. Otherwise cast any defined user value and type to valid string after confirming not-null by passing conditional null if valid instead, as original implementation causes "Uncaught TypeError: Cannot read properties of null (reading 'target')" error due to use of undefined (prompt is valid - original background.js using inject code logic needs this small fix), so instead this cast helps prevent this bug as type and conditional assignment done when parsing prompt result (and can replace all `window.prompt`s with this helper func where invalid types may appear after this type conversion done safely if and only after userInput isn't null when `prompt()`'s value is a non-null result only.  Handle all return `null` edge-cases for functions within this or similar helper before further use when modifying documents.   
}
