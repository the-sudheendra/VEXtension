var veXPromptsPopupNode = document.createElement("div");
var veXPromptsPopupOverlay = document.createElement("div");
var currentPromptTone = null;


async function loadModules() {
  let URL = chrome.runtime.getURL("src/Utility/Util.js");
  if (!Util)
    Util = await import(URL);
  URL = chrome.runtime.getURL("src/Utility/Constants.js");
  if (!Constants)
    Constants = await import(URL);
  veXSelectors = Constants.VEChecklistNodeSelectors;
}

const prompts = Constants.veXDefaultPrompts;
const promptTones = Constants.veXDefaultPromptsTone;

let promptVariableData = [];

async function initialize() {
  await loadModules();
  veXPromptViewSetup();
  initializePromptVariableData();
}

function initializePromptTonesDropdown() {
  const dropdown = veXPromptsPopupNode.querySelector('.veX_prompts_tone_selector');
  const options = dropdown.querySelector('.veX_dropdown_options');
  Object.keys(promptTones).forEach(tone => {
    let option = document.createElement('div');
    option.classList.add('veX_dropdown_option');
    option.classList.add('veX_truncate');
    option.setAttribute('data-value', promptTones[tone]);
    option.setAttribute('title', tone);
    option.textContent = tone;
    options.appendChild(option);
  });
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
function setupPromptsPopupNode() {
  veXPromptsPopupNode.id = "veX_prompts_popup_container";
  veXPromptsPopupNode.classList.add("veX_prompts_popup_disable");
  veXPromptsPopupNode.innerHTML = Constants.PromptsUI;
  document.body.appendChild(veXPromptsPopupNode);
  initializePromptTonesDropdown();
  attachToneSelectorEvents();
  Util.makeElementDraggable(veXPromptsPopupNode.querySelector('.veX_prompts_header'));
}
function attachToneSelectorEvents() {
  const dropdown = veXPromptsPopupNode.querySelector('.veX_prompts_tone_selector');
  const selected = dropdown.querySelector('.veX_dropdown_selected');
  const options = dropdown.querySelector('.veX_dropdown_options');
  const allOptions = dropdown.querySelectorAll('.veX_dropdown_option');
  allOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      selected.innerText = `${option.textContent.trim()}`;
      let target=e.target;
      currentPromptTone = target.getAttribute('data-value') || option.textContent.trim();
      options.classList.remove('veX_show');
    });
  });

  dropdown.addEventListener('click', (e) => {
      options.classList.toggle('veX_show');
  });
}
function setupPromptsPopupOverlay() {
  veXPromptsPopupOverlay.id = "veX_prompt_popup_overlay";
  veXPromptsPopupOverlay.addEventListener("click", closePromptsPopup);
  document.body.appendChild(veXPromptsPopupOverlay);
}
function initializePromptList() {
  try {
    const promptList = veXPromptsPopupNode.querySelector("#veX_prompts_list_container");
    renderPromptList(promptList, prompts);
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Initialize Prompt List", err.message), true);
  }
}

function initializePromptVariableData() {
  prompts.forEach((promptData, index) => {
    let variables = promptData["variables"];
    promptVariableData[index] = {};
    variables.forEach((variableData) => {
      promptVariableData[index][variableData["name"]] = extractValueFromElement(variableData["selector"]) || "";
    });
  });
}


function extractValueFromElement(selector) {
  const element = document.querySelector(selector);
  let value = '';
  if (element) {
    if ('value' in element) {
      value = element.value;
    } else {
      value = element.textContent;
    }
  }
  value = value.trim().replace(/\s+/g, ' ');
  return value;
}

function renderPromptList(container, prompts) {
  if (!prompts.length) {
    container.innerHTML = "<h3>No prompts available. Please upload prompt.json.</h3>";
    return;
  }
  container.innerHTML = getPromptListHTML(prompts);
  attachPromptListEvents(container, prompts);
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

function draftInstructions(unresolved = [], currentPromptTone = '') {
  let instructions = 'Instructions:\n';

  if (unresolved.length > 0) {
    instructions += `- If any of the following required variables are missing: ${unresolved.join(', ')}, prompt the user to provide them.\n`;
    instructions += `- Do **not** infer, assume, or fabricate any information not explicitly provided by the user.\n`;
    instructions += `- Proceed only after all required context and variables are available.\n`;
  }

  if (currentPromptTone) {
    instructions += `- Maintain **${currentPromptTone}** tone throughout your response.\n`;
  }

  return instructions.trim();
}


const promptListHtml = prompts.map((prompt, index) => `
    <div class="prompt-row" data-index="${index}">
      <div class="prompt-name">${prompt.name}</div>
      <div class="icons">
        <span class="send-btn" title="Send to AI" data-index="${index}">
          <img src="${Constants.checklistIconsUrl.send}" alt="Send Icon" />
        </span>
        <span class="expand-btn" title="Expand" data-index="${index}">
          <img src="${Constants.checklistIconsUrl.expand}" alt="Expand Icon" />
        </span>
      </div>
    </div>
    <div class="expand-section gradient-border-left veX_selectable" id="expand-${index}" style="display: none;">
      <p><strong>Description:</strong> ${prompt.description}</p>
      <p><strong>Template:</strong></p>
      <pre class="veX_selectable">${prompt.template}</pre>
      <p><strong>Variables:</strong></p>
      <ul class="veX_selectable">
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
  let html = ``;
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
          <img src="${Constants.checklistIconsUrl.send}" alt="Send Icon" />
          </span>
          <span class="expand-btn" title="Expand" data-index="${index}">
          <img src="${Constants.checklistIconsUrl.expand}" alt="Expand Icon" />
          </span>
      </div>
    </div>
    `;
}
function onVariableChange(event, index, name) {
  const textarea = event.target;
  promptVariableData[index][name] = textarea.value;
}
function getPromptExpandHTML(prompt, index) {
  return `
<div class="expand-section gradient-border-left veX_selectable" id="expand-${index}" style="display: none;">
   <p><strong>Description:</strong> ${prompt.description}</p>
   <p><strong>Template:</strong></p>
   <pre>${prompt.template}</pre>
   <p><strong>Variables:</strong></p>
   <ul class="veX-variable-list">
      ${prompt.variables.map(
    (v) =>
      `
      <li>${v.name}</li>
      <li><textarea class="veX-variable-input veX_selectable" placeholder="Enter ${v.name} here..." data-index="${index}" data-name="${v.name}" onchange="onVariableChange(event,${index})">${promptVariableData[index] || ""}</textarea></li>
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
  btn.innerHTML = section.style.display === "none" ? `<img src="${Constants.promptIconsUrl.expand}" alt="Expand Icon" />` : `<img src="${Constants.promptIconsUrl.close}" alt="Close Icon" />`;
}

async function onSendBtnClick(index) {
  const prompt = prompts[index];
  const filledPrompt = draftPromptTemplate(prompt.template,index, prompt.variables, promptVariableData);
  Util.openRightSidebar();
  document.querySelector(Constants.ValueEdgeNodeSelectors.AviatorButton).click();
  Util.delay(1000);
  Util.setNativeValue(document.querySelector("[data-aid='chat-with-entity-panel-bottom-section-textarea']"), filledPrompt);
  //document.querySelector("[data-aid='chat-with-entity-panel-bottom-section-send-button']").click();
}

function attachPromptListEvents(container, prompts) {
  container.querySelectorAll(".expand-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      onExpandBtnClick(btn, btn.getAttribute("data-index"));
    });
  });
  container.querySelectorAll(".veX-variable-input").forEach((element) => {
    element.addEventListener("input", () => {
      onVariableChange(element, element.getAttribute("data-index"), element.getAttribute("data-name"));
    });
  });
  container.querySelectorAll(".send-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      onSendBtnClick(btn.getAttribute("data-index"));
    });
  });
}

function draftPromptTemplate(template, index, variables, promptVariableData) {
  const unresolved = [];

  variables.forEach(({ name, selector }) => {
    const element = document.querySelector(selector);
    let value = null;

    if (promptVariableData[index] && promptVariableData[index][name] && promptVariableData[index][name].trim() !== '') {
      value = promptVariableData[index][name];
    } else if (element) {
      if ('value' in element) {
        value = element.value;
      } else {
        value = element.textContent;
      }
      const placeholder = new RegExp(`{\\s*${name}\\s*}`, 'g');
      template = template.replace(placeholder, value);
    } else {
      value = `${name}`;
      unresolved.push(name);
    }
  });

    const instructions = `\n${draftInstructions(unresolved, currentPromptTone)}`;
    template += instructions;

  return template;
}
function removeExtraSpaces(text) {
  return text.trim().replace(/\s+/g, ' ');
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