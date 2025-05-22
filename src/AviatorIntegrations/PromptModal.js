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
    "name": "Generate Subtasks",
    "description": "Generate a checklist of subtasks needed to complete the ticket.",
    "template": "Given the ticket titled '{title}' with description '{description}', generate a list of technical or process-related subtasks.",
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
    "name": "Summarize Ticket for Standup",
    "description": "Generate a quick summary of the ticket suitable for a daily standup update.",
    "template": "Provide a concise summary of the ticket for a daily standup:\nTitle: {{title}}\nDescription: {{description}}",
    "variables": [
      { "name": "title", "selector": "#ticket-title" },
      { "name": "description", "selector": "#ticket-description" }
    ]
  },
  {
    "name": "Generate Acceptance Criteria",
    "description": "Suggest detailed and testable acceptance criteria based on the ticket description.",
    "template": "Based on the following ticket description, suggest detailed and testable acceptance criteria:\n'{{description}}'",
    "variables": [
      { "name": "description", "selector": "#ticket-description" }
    ]
  },
    {
    "name": "Suggest Documentation Update",
    "description": "Propose documentation that might need updates based on the change described.",
    "template": "Based on the following ticket, suggest if any documentation (e.g. user guides, API references) needs updating:\n'{{description}}'",
    "variables": [
      { "name": "description", "selector": "#ticket-description" }
    ]
  },
    {
    "name": "Check for Definition of Ready",
    "description": "Verify if the ticket meets Definition of Ready (DoR) and suggest improvements if not.",
    "template": "Evaluate whether this ticket is ready for development based on common Definition of Ready criteria. Suggest improvements if any are missing.\n'{{description}}'",
    "variables": [
      { "name": "description", "selector": "#ticket-description" }
    ]
  },
    {
    "name": "Evaluate Story Size",
    "description": "Assess if the story is too large and could be split.",
    "template": "Based on the following ticket, assess whether the story might be too large or complex and suggest if it could be split:\nTitle: {{title}}\nDescription: {{description}}",
    "variables": [
      { "name": "title", "selector": "#ticket-title" },
      { "name": "description", "selector": "#ticket-description" }
    ]
  },
  {
  "name": "Check Root Cause Summary",
  "description": "Verify if the root cause summary is logical, coherent, and relevant to the issue. Suggest improvements if it is unclear or incomplete.",
  "template": "Carefully review the following root cause summary and determine:\n1. Does it logically explain the underlying cause of the issue?\n2. Is it specific, clear, and technically sound?\n3. Does it align with the issue title and description?\n\nIf the summary is vague, confusing, or misaligned, suggest modifications to improve clarity, accuracy, and completeness.\n\nTitle: '{{title}}'\n\nDescription: '{{description}}'\n\nRoot Cause Summary: '{{root_cause}}'",
  "variables": [
    { "name": "title", "selector": "#ticket-title" },
    { "name": "description", "selector": "#ticket-description" },
    { "name": "root_cause", "selector": "#root-cause-summary" }
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

function getInstructionsToAvoidHallucinations(unresolved) {
  return `
Instructions:
- Extract each variable (${unresolved.join(', ')}) exactly as provided in my input
- Do not infer, guess, or add information not explicitly stated
- If any variable is missing, unclear, or incomplete, simply respond with:
  "Please provide the following: ${unresolved.join(', ')}"
- Only proceed with validation when all required information is provided`
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
   <ul class="veX-variable-list">
      ${prompt.variables.map(
      (v) =>
      `
      <li>${v.name}</li>
      <li><textarea class="veX-variable-input" placeholder="Enter ${v.name} here..."></textarea></li>
      `
      )
      .join("")}
   </ul>
</div>
`;
}
function onExpandBtnClick(btn, index) {
  const section = document.getElementById(`expand-${index}`);
  section.style.display = section.style.display === "none" ? "block" : "none";
  btn.innerText = section.style.display === "none" ? "expand_more" : "expand_less";
}

function onSendBtnClick(btn, index) {
  const prompt = prompts[index];
  const filledPrompt = fillPromptTemplate(prompt.template, prompt.variables);
  Util.setNativeValue(document.querySelector("[data-aid='chat-with-entity-panel-bottom-section-textarea']"), filledPrompt);
  document.querySelector("[data-aid='chat-with-entity-panel-bottom-section-send-button']").click();
}

function attachPromptListEvents(container, prompts) {
  container.querySelectorAll(".expand-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      onExpandBtnClick(btn, btn.getAttribute("data-index"));
    });
  });

  container.querySelectorAll(".send-btn").forEach( (btn) => {
    btn.addEventListener("click", async() => {
      onSendBtnClick(btn, btn.getAttribute("data-index"));
    });
  });
}

function fillPromptTemplate(template, variables) {
  const unresolved = [];

  variables.forEach(({ name, selector }) => {
    const element = document.querySelector(selector);
    let value = null;

    if (element) {
      if ('value' in element) {
        value = element.value;
      } else {
        value = element.textContent;
      }

      value = (value || '').trim().replace(/\s+/g, ' ');

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
    ${getInstructionsToAvoidHallucinations(unresolved)}
`;
    template += message;
  }

  return template;
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

chrome.runtime.onMessage.addListener(handleMessagesFromServiceWorker);

export { initialize, openPromptsPopup, closePromptsPopup };