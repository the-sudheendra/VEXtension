var veXPromptsPopupNode = document.createElement("div");
var veXPromptsPopupOverlay = document.createElement("div");

async function loadModules() {
  let URL = chrome.runtime.getURL("src/Utility/Util.js");
  if (!Util)
    Util = await import(URL);
  URL = chrome.runtime.getURL("src/Utility/Constants.js");
  if (!Constants)
    Constants = await import(URL);
  veXSelectors = Constants.VEChecklistNodeSelectors;
}

const prompts = [
  {
    "name": "Clarify Requirements",
    "description": "Identify vague or unclear parts of the ticket and suggest clarifying questions.",
    "template": "Review the following description: '{description}'. Identify any ambiguous or unclear requirements and suggest clarifying questions the team should ask.",
    "variables": [
      { "name": "description", "selector": "#ticket-description" }
    ]
  },
  {
    "name": "Generate Subtasks",
    "description": "Generate a checklist of subtasks needed to complete the ticket.",
    "template": "Given the ticket titled '{title}' with description '{description}', generate a list of technical or process-related subtasks.",
    "variables": [
      { "name": "title", "selector": "#ticket-title" },
      { "name": "description", "selector": "#ticket-description" }
    ]
  },
  {
    "name": "Draft User-Facing Release Note",
    "description": "Create a short, clear release note for end users based on the ticket.",
    "template": "Write a user-facing release note for the following feature or fix:\nTitle: {title}\nDescription: {description}",
    "variables": [
      { "name": "title", "selector": "#ticket-title" },
      { "name": "description", "selector": "#ticket-description" }
    ]
  },
  {
    "name": "Generate QA Scenarios",
    "description": "Generate test scenarios and expected outcomes based on the description and acceptance criteria.",
    "template": "Generate QA test scenarios for the following ticket:\nDescription: {description}\nAcceptance Criteria: {acceptanceCriteria}",
    "variables": [
      { "name": "description", "selector": "#ticket-description" },
      { "name": "acceptanceCriteria", "selector": ".acceptance-criteria" }
    ]
  },
  {
    "name": "Analyze Bug Root Cause",
    "description": "Review defect description and suggest possible root causes.",
    "template": "Review the following defect:\nTitle: {title}\nDescription: {description}\nSuggest potential root causes based on the description and steps to reproduce.",
    "variables": [
      { "name": "title", "selector": "#ticket-title" },
      { "name": "description", "selector": "#ticket-description" }
    ]
  },
  {
    "name": "Estimate Task Duration",
    "description": "Estimate the time or complexity based on the work described.",
    "template": "Estimate the level of effort and time needed for this task:\n'{description}'",
    "variables": [
      { "name": "description", "selector": "#ticket-description" }
    ]
  },
  {
    "name": "Customer Update Message",
    "description": "Generate a short status update to send to a customer about the issue.",
    "template": "Draft a customer-facing update for the issue titled '{title}' with description '{description}'. Be clear and non-technical.",
    "variables": [
      { "name": "title", "selector": "#ticket-title" },
      { "name": "description", "selector": "#ticket-description" }
    ]
  },
  {
    "name": "Summarize Change Impact",
    "description": "Analyze the change described and explain what parts of the product could be affected.",
    "template": "Based on the following change description, summarize potential areas of impact:\n'{description}'",
    "variables": [
      { "name": "description", "selector": "#ticket-description" }
    ]
  },
  {
    "name": "Write Pull Request Description",
    "description": "Generate a professional pull request message based on the ticket.",
    "template": "Write a pull request message for:\nTicket: {ticketId} - {title}\nDetails: {description}",
    "variables": [
      { "name": "ticketId", "selector": "#ticket-id", "attribute": "data-ticket-id" },
      { "name": "title", "selector": "#ticket-title" },
      { "name": "description", "selector": "#ticket-description" }
    ]
  },
  {
    "name": "Suggest Automation",
    "description": "Analyze the workflow described and suggest what steps could be automated.",
    "template": "Based on this workflow description, identify parts that could be automated:\n'{description}'",
    "variables": [
      { "name": "description", "selector": "#ticket-description" }
    ]
  },
  {
    "name": "Analyze Defect Root Cause",
    "description": "Make sense of the defect description and suggest possible root causes.",
    "template": "Validate my explanation of the defect root cause {{rootCause}}",
    "variables": [
      { "name": "rootCause", "selector": "#ticket-root-cause" },
    ]
  }
]
;


async function initialize() {
  await loadModules();
  veXPromptViewSetup();
}

function veXPromptViewSetup() {
  try {
    setupPromptsPopupNode();
    setupPromptsPopupOverlay();
    initializePromptList();
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Setup Prompt View", err.message), true);
  }
}

function initializePromptList() {
  try {
    const promptList = veXPromptsPopupNode;
    renderPromptList(promptList, prompts);
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Initialize Prompt List", err.message), true);
  }
}

function renderPromptList(container, prompts) {
  if (!prompts.length) {
    container.innerHTML = "<h3>No prompts available. Please upload prompt.json.</h3>";
    return;
  }
  container.innerHTML = getPromptListHTML(prompts);
  attachPromptListEvents(container, prompts);
}

function setupPromptsPopupNode() {
  veXPromptsPopupNode.id = "veX_prompts_popup_container";
  veXPromptsPopupNode.classList.add("veX_prompts_popup_disable");
  veXPromptsPopupNode.innerHTML = Constants.PromptsUI;
  document.body.appendChild(veXPromptsPopupNode);
  Util.makeElementDraggable(veXPromptsPopupNode.querySelector('.veX_prompts_header'));
}

function setupPromptsPopupOverlay() {
  veXPromptsPopupOverlay.id = "veX_prompt_popup_overlay";
  veXPromptsPopupOverlay.addEventListener("click", closePromptsPopup);
  document.body.appendChild(veXPromptsPopupOverlay);
}

function openPromptsPopup() {
  try {
    if (Util.isChecklistPopupOpen()) {
      closeChecklistPopup();
    }
    veXPromptsPopupOverlay.style.visibility = "visible";
    veXPromptsPopupNode.classList.add("veX_checklist_popup_active");
    centerThePopup(veXPromptsPopupNode);
    veXPromptsPopupNode.classList.remove("veX_checklist_popup_disable");
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Opening Prompts Popup", err.message), true);
  }
}

function closePromptsPopup() {
  try {
    if (!veXPromptsPopupOverlay || !veXPromptsPopupNode) return;
    veXPromptsPopupOverlay.style.visibility = "hidden";
    veXPromptsPopupNode.classList.remove("veX_checklist_popup_active");
    veXPromptsPopupNode.classList.add("veX_checklist_popup_disable");
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Closing Checklist Popup", err.message), true);
  }
}

const promptListHtml = prompts.map((prompt, index) => `
    <div class="prompt-row" data-index="${index}">
      <div class="prompt-name">${prompt.name}</div>
      <div class="icons">
        <span class="send-btn" title="Send to AI" data-index="${index}">
          <img src="${Constants.iconUrls.send}" alt="Send Icon" />
        </span>
        <span class="expand-btn" title="Expand" data-index="${index}">
          <img src="${Constants.iconUrls.expand}" alt="Expand Icon" />
        </span>
      </div>
    </div>
    <div class="expand-section" id="expand-${index}" style="display: none;">
      <p><strong>Description:</strong> ${prompt.description}</p>
      <p><strong>Template:</strong></p>
      <pre>${prompt.template}</pre>
      <p><strong>Variables:</strong></p>
      <ul>
        ${prompt.variables.map(v =>
  `<li>${v.name} → <code>${v.selector}</code>${v.attribute ? ` (attr: ${v.attribute})` : ''}</li>`
).join("")}
      </ul>
    </div>
  `).join("");

const PromptUI = `
    <div id="my-extension-ui">
      <h2>
        Aviator Prompts
        <span class="material-icons" style="cursor:pointer;" onclick="document.getElementById('my-extension-ui').remove()">close</span>
      </h2>
      ${prompts.length ? promptListHtml : '<h3>No prompts available. Please upload prompt.json.</h3>'}
    </div>
  `;


function getPromptListHTML(prompts) {
  let html = `<h2>Aviator Prompts <span class="material-icons" style="cursor:pointer;" onclick="document.getElementById('veX-Prompts-Container').remove()">close</span></h2>`;
  prompts.forEach((prompt, index) => {
    html += getPromptRowHTML(prompt, index);
    html += getPromptExpandHTML(prompt, index);
  });
  return html;
}

function getPromptRowHTML(prompt, index) {
  return `
            <div class="prompt-row" data-index="${index}">
                <div class="prompt-name">${prompt.name}</div>
                <div class="icons">
<span class="send-btn" title="Send to AI" data-index="${index}">
          <img src="${Constants.iconUrls.send}" alt="Send Icon" />
        </span>
        <span class="expand-btn" title="Expand" data-index="${index}">
          <img src="${Constants.iconUrls.expand}" alt="Expand Icon" />
        </span>
                </div>
            </div>
        `;
}

function getPromptExpandHTML(prompt, index) {
  return `
            <div class="expand-section" id="expand-${index}" style="display: none;">
                <p><strong>Description:</strong> ${prompt.description}</p>
                <p><strong>Template:</strong></p>
                <pre>${prompt.template}</pre>
                <p><strong>Variables:</strong></p>
                <ul>
                    ${prompt.variables
      .map(
        (v) =>
          `<li>${v.name} → <code>${v.selector}</code>${v.attribute ? ` (attr: ${v.attribute})` : ""
          }</li>`
      )
      .join("")}
                </ul>
            </div>
        `;
}

function attachPromptListEvents(container, prompts) {
  container.querySelectorAll(".expand-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = btn.getAttribute("data-index");
      const section = document.getElementById(`expand-${index}`);
      section.style.display = section.style.display === "none" ? "block" : "none";
      btn.innerText = section.style.display === "none" ? "expand_more" : "expand_less";
    });
  });

  container.querySelectorAll(".send-btn").forEach( (btn) => {
    btn.addEventListener("click", async() => {
      const index = btn.getAttribute("data-index");
      const prompt = prompts[index];

      const filledPrompt = fillPromptTemplate(prompt.template, prompt.variables);

      Util.setNativeValue(document.querySelector("[data-aid='chat-with-entity-panel-bottom-section-textarea']"), filledPrompt);
      document.querySelector("[data-aid='chat-with-entity-panel-bottom-section-send-button']").click();
        await Util.delay(500);
      document.querySelector("[data-aid = 'chat-with-entity-panel-bottom-section-on-submit-btn']").click()
    });
  });
}
function handleMessagesFromServiceWorker(request, sender, sendResponse) {
  try {
    switch (request) {
      case "openPromptsPopup":
        openPromptsPopup();
        break;
    }
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Handle Messages From Service Worker", err.message), true);
  }
}

function fillPromptTemplate(template, variables) {
  const unresolved = [];

  variables.forEach(({ name, selector }) => {
    const element = document.querySelector(selector);
    let value = null;

    if (element) {
      // Use .value for inputs/textareas, fallback to textContent
      if ('value' in element) {
        value = element.value;
      } else {
        value = element.textContent;
      }

      // Clean whitespace
      value = (value || '').trim().replace(/\s+/g, ' ');

      // Replace all {name} with the cleaned value
      const placeholder = new RegExp(`{\\s*${name}\\s*}`, 'g');
      template = template.replace(placeholder, value);
    } else {
      value = `${name}`;
      unresolved.push(name); // Don’t replace unresolved variable
    }
  });

  // Append AI instruction if any variables were unresolved
  if (unresolved.length > 0) {
    const message = `\n\n
Instructions:
- Extract each variable (${unresolved.join(', ')}) exactly as provided in my input
- Do not infer, guess, or add information not explicitly stated
- If any variable is missing, unclear, or incomplete, simply respond with:
  "Please provide the following: ${unresolved.join(', ')}"
- Only proceed with validation when all required information is provided
`;
    template += message;

  }

  return template;
}

chrome.runtime.onMessage.addListener(handleMessagesFromServiceWorker);

export { initialize, openPromptsPopup, closePromptsPopup };