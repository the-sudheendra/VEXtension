// src/Utility/aviator_integration.js

function displayPrompts(prompts) {
  const modalId = 'aviator-prompt-modal';
  let modal = document.getElementById(modalId);
  if (modal) {
    modal.remove(); // Remove previous modal if it exists
  }

  modal = document.createElement('div');
  modal.id = modalId;
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.backgroundColor = 'white';
  modal.style.border = '1px solid #ccc';
  modal.style.padding = '20px';
  modal.style.zIndex = '10000';
  modal.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';

  const title = document.createElement('h4');
  title.textContent = 'Select a Prompt for Aviator';
  modal.appendChild(title);

  prompts.forEach(promptData => {
    const button = document.createElement('button');
    button.textContent = promptData.label;
    button.style.display = 'block';
    button.style.margin = '10px 0';
    button.style.padding = '10px';
    button.style.width = '100%';
    button.style.cursor = 'pointer';
    button.addEventListener('click', () => {
      injectPromptIntoAviator(promptData.prompt);
      modal.remove();
    });
    modal.appendChild(button);
  });

  document.body.appendChild(modal);

  // Close modal when clicking outside
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.remove();
    }
  });
}

function injectPromptIntoAviator(promptText) {
  let inputField = null;

  // Attempt to find the Aviator input field
  // This is a generic approach; specific selectors might be needed depending on Aviator's DOM
  const possibleContainers = document.querySelectorAll('iframe, div');
  for (const container of possibleContainers) {
    try {
      let searchContext = container;
      if (container.tagName === 'IFRAME' && container.contentDocument) {
        searchContext = container.contentDocument;
      }
      inputField = searchContext.querySelector('input[type="text"], textarea, [role="textbox"]');
      if (inputField) {
        break; // Found a potential input field
      }
    } catch (e) {
      console.error("Error accessing iframe or container:", e);
    }
  }

  if (inputField) {
    inputField.value = promptText;
  } else {
    console.error("Aviator input field not found.");
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in aviator_integration.js:", request);

  if (request.action === "showAviatorPrompts") {
    chrome.storage.local.get(['prompts'], (result) => {
      const prompts = result.prompts || [];
      displayPrompts(prompts);
    });
  }

  // Return true to indicate that you want to send a response asynchronously
  return true;
});