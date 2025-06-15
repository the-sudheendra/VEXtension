var veXPromptsPopupNode = document.createElement("div");
var veXPromptsPopupOverlay = document.createElement("div");
var currentPromptTone = "";
var UITemplates;
var DefaultList;
var prompts;
var promptTones;
let promptVariableData = [];


async function loadModules() {
  let URL = chrome.runtime.getURL("src/Common/Util.js");
  if (!Util)
    Util = await import(URL);
  URL = chrome.runtime.getURL("src/Common/Constants.js");
  if (!Constants)
    Constants = await import(URL);
  veXSelectors = Constants.VEChecklistNodeSelectors;
  URL = chrome.runtime.getURL("src/Common/UITemplates.js");
  if (!UITemplates) {
    UITemplates = await import(URL);
  }
  URL = chrome.runtime.getURL("src/Common/DefaultList.js");
  if (!DefaultList) {
    DefaultList = await import(URL);
  }
  prompts = DefaultList.veXDefaultPrompts;
  promptTones = DefaultList.veXDefaultPromptsTone;
}

async function initialize() {
  try {
    await loadModules();
    await loadPrompts();
    veXPromptViewSetup();
    initializePromptVariableData();
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Initialize Prompt Modal", err.message), true);
  }
}

async function loadPrompts() {
  try {
    let promptsResponse = await chrome.storage.local.get("veXPromptsData");
    if (Util.isEmptyObject(promptsResponse) || Util.isEmptyObject(promptsResponse.veXPromptsData) || Util.isEmptyArray(promptsResponse.veXPromptsData.prompts)) {
      prompts = DefaultList.veXDefaultPrompts;
      return;
    }
    prompts = promptsResponse.veXPromptsData.prompts;
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Get Prompts", err.message), true);
  }
}

function initializeTonesDropdown() {
  try {
    const dropdown = veXPromptsPopupNode.querySelector('.veX_prompts_tone_selector');
    const selected = dropdown.querySelector('.veX_dropdown_selected');

    selected.classList.add('veX_truncate');
    selected.setAttribute('data-value', "");
    selected.textContent = "Select Tone";

    const options = dropdown.querySelector('.veX_dropdown_options');
    const fragment = document.createDocumentFragment();
    let toneOptions = Object.keys(promptTones);

    // Add None option
    let option = document.createElement('div');
    option.classList.add('veX_dropdown_option', 'veX_truncate');
    option.setAttribute('data-value', "");
    option.setAttribute('title', "None");
    option.textContent = "None";
    fragment.appendChild(option);

    toneOptions.forEach(tone => {
      let option = document.createElement('div');
      option.classList.add('veX_dropdown_option', 'veX_truncate');
      option.setAttribute('data-value', promptTones[tone]);
      option.setAttribute('title', tone);
      option.textContent = tone;
      fragment.appendChild(option);
    });

    options.appendChild(fragment);
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Initialize Prompt Tones Dropdown", err.message), true);
  }
}

function veXPromptViewSetup() {
  try {
    setupPromptsPopupNode();
    setupPromptsPopupOverlay();
    initializePromptList();
    Util.makeElementDraggable(veXPromptsPopupNode.querySelector('.veX_prompts_header'),document.getElementById("veX_prompts_popup_container"));
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Setup Prompt View", err.message), true);
  }
}

function setupPromptsPopupNode() {
  try {
    veXPromptsPopupNode.id = "veX_prompts_popup_container";
    veXPromptsPopupNode.classList.add("veX_prompts_popup_disable");
    veXPromptsPopupNode.innerHTML = UITemplates.PromptsUI;
    document.body.appendChild(veXPromptsPopupNode);
    initializeTonesDropdown();
    attachToneSelectorEvents();
    Util.makeElementDraggable(veXPromptsPopupNode.querySelector('.veX_prompts_header'));
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Setup Prompt View", err.message), true);
  }
}

function attachToneSelectorEvents() {
  try {
    const dropdown = veXPromptsPopupNode.querySelector('.veX_prompts_tone_selector');
    const selected = dropdown.querySelector('.veX_dropdown_selected');
    const options = dropdown.querySelector('.veX_dropdown_options');
    const allOptions = dropdown.querySelectorAll('.veX_dropdown_option');
    allOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        selected.innerText = `${option.textContent.trim()}`;
        let target = e.target;
        if (target.getAttribute('data-value') === "") {
          currentPromptTone = "";
        } else {
          currentPromptTone = target.getAttribute('data-value') || option.textContent.trim();
        }
        options.classList.remove('veX_show');
      });
    });

    dropdown.addEventListener('click', (e) => {
      options.classList.toggle('veX_show');
    });
    dropdown.addEventListener('blur', (e) => {
      options.classList.remove('veX_show');
    });
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Attaching Prompt Tone Selector Events", err.message), true);
  }
}
function setupPromptsPopupOverlay() {
  try {
    veXPromptsPopupOverlay.id = "veX_prompt_popup_overlay";
    veXPromptsPopupOverlay.addEventListener("click", closePromptsPopup);
    document.body.appendChild(veXPromptsPopupOverlay);
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Setup Prompt Popup Overlay", err.message), true);
  }
}
function initializePromptList() {
  try {
    const promptList = veXPromptsPopupNode.querySelector("#veX_prompts_list_container");
    renderPromptList(promptList, prompts);
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Initialize Prompt List", err.message), true);
  }
}

function initializePromptVariableData() {
  try {
    prompts.forEach((promptData, index) => {
      let variables = promptData["variables"];
      promptVariableData[index] = {};
      variables.forEach((variableData) => {
        promptVariableData[index][variableData["name"]] = extractValueFromElement(variableData["selector"]) || "";
      });
    });
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Initialize Prompt Variable Data", err.message), true);
  }
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
  try {
    if (!prompts.length) {
      container.innerHTML = "<h3>No prompts available. Please upload prompt.json.</h3>";
      return;
    }
    container.innerHTML = getPromptListHTML(prompts);
    attachPromptListEvents(container, prompts);
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Render Prompt List", err.message), true);
  }
}



function openPromptsPopup() {
  try {
    if (Util.isChecklistPopupOpen()) {
      closeChecklistPopup();
    }
    veXPromptsPopupOverlay.style.visibility = "visible";
    veXPromptsPopupNode.classList.add("veX_popup_active");
    Util.centerThePopup(veXPromptsPopupNode);
    veXPromptsPopupNode.classList.remove("veX_popup_disable");
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Opening Prompts Popup", err.message), true);
  }
}

function closePromptsPopup() {
  try {
    if (!veXPromptsPopupOverlay || !veXPromptsPopupNode) return;
    veXPromptsPopupOverlay.style.visibility = "hidden";
    veXPromptsPopupNode.classList.remove("veX_popup_active");
    veXPromptsPopupNode.classList.add("veX_popup_disable");
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Closing Checklist Popup", err.message), true);
  }
}

function draftInstructions(unresolved = [], currentPromptTone = '') {
  try {
    const HallucinationPreventionInstructions =
      `\n- If the user's query references or  requires the context of a specific content (e.g., ${unresolved.join(', ')}) that are NOT present in their message or in the ticket context
  - ask the user to provide the missing input.
  - Do **not** infer, assume, or fabricate any information not explicitly provided by the user.
  - Only proceed when sufficient context has been provided.`;

    const ToneInstructions = `
  \n- Maintain **${promptTones[currentPromptTone] || currentPromptTone}** tone throughout your response.
  `;

    let instructions = '';

    if (unresolved.length > 0 || currentPromptTone) {
      instructions = '\n\n*Instructions:*\n';
    }

    if (unresolved.length > 0) {
      instructions += HallucinationPreventionInstructions;
    }

    if (currentPromptTone) {
      instructions += ToneInstructions;
    }
    return instructions.trim();
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Draft Instructions", err.message), true);
  }
}

function getPromptListHTML(prompts) {
  try {
    let html = ``;
    prompts.forEach((prompt, index) => {
      const promptContainer = document.createElement('div');
      const dummyDiv = document.createElement('div');
      dummyDiv.appendChild(promptContainer);
      promptContainer.classList.add('veX_prompt_container');
      promptContainer.id = `veX_prompt_container_${index}`;
      promptContainer.innerHTML = getPromptRowHTML(prompt, index);
      promptContainer.innerHTML += getPromptExpandHTML(prompt, index);
      html += dummyDiv.innerHTML;
    });
    return html;
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Get Prompt List HTML", err.message), true);
  }
}

function getPromptRowHTML(prompt, index) {
  try {
    return `
        <div class="veX_prompt_rows" data-index="${index}">
          <div class="veX_prompt_name">${prompt.name}
              <span class="veX_expand_btn" title="Expand" data-index="${index}">
              <img src="${UITemplates.veXIconsURLs.expand}" alt="Expand Icon" />
              </span>
          </div>
          <div class="veX_icons">
              <span class="veX_send_btn" title="Send to AI" data-index="${index}">
              <img src="${UITemplates.veXIconsURLs.send}" alt="Send Icon" />
              </span>
          </div>
        </div>
    `;
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Get Prompt Row HTML", err.message), true);
  }
}
function onVariableChange(textarea, index, name) {
  promptVariableData[index][name] = textarea.value;
}
function getPromptExpandHTML(prompt, index) {
  try {
    return `
          <div class="veX_prompt_expand_section veX_selectable" id="veX_expand_${index}" style="display: none;">
            <p><strong>Description:</strong> ${prompt.description}</p>
            <p><strong>Template:</strong></p>
            <div class="veX_prompt_template_container">
                <span class="veX_prompt_edit_template_btn" title="Edit Template" data-index="${index}">
                  <img src="${UITemplates.veXIconsURLs.edit}" alt="Edit Icon" />
                </span>
                <pre class="veX_prompt_template_content" data-index="${index}">${prompt.template}</pre>
            </div>
            <p><strong>Variables:</strong></p>
            <ul class="veX_prompt_variable_list">
                ${prompt.variables.map(
      (v) =>
        `
                <li>${v.name}</li>
                <li><textarea class="veX_variable_input veX_selectable" placeholder="Enter ${v.name} here..." data-index="${index}" data-name="${v.name}">${promptVariableData[index] || ""}</textarea></li>
                `
    )
        .join("")}
            </ul>
          </div>
`;
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Get Prompt Expand HTML", err.message), true);
  }
}
function attachTemplateEditEvents(container) {
  try {
    container.querySelectorAll('.veX_prompt_edit_template_btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = btn.getAttribute('data-index');
        const preElement = container.querySelector(`.veX_prompt_template_content[data-index="${index}"]`);
        if (preElement.contentEditable !== 'true') {
          preElement.contentEditable = 'true';
          preElement.focus();
          btn.querySelector('img').src = UITemplates.veXIconsURLs.check;
        } else {
          preElement.contentEditable = 'false';
          prompts[index].template = preElement.textContent;
          btn.querySelector('img').src = UITemplates.veXIconsURLs.edit;
          chrome.storage.local.set({ "veXPromptsData": { prompts: prompts } });
          Util.notify("Prompt template updated successfully", Constants.NotificationType.Success, true);
        }
      });
    });
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Attach Template Edit Events", err.message), true);
  }
}

function onExpandBtnClick(btn, index) {
  try {
    const promptContainers = veXPromptsPopupNode.querySelectorAll('.veX_prompt_container');
    promptContainers.forEach(container => {
      const expandBtn = container.querySelector('.veX_expand_btn');
      const expandSection = container.querySelector('.veX_prompt_expand_section');
      if (expandSection.id === `veX_expand_${index}` && expandSection.style.display === "none") {
        expandSection.style.display = "block";
        expandBtn.innerHTML = `<img src="${UITemplates.veXIconsURLs.close}" alt="Close Icon" />`;
      }
      else if (expandSection.id === `veX_expand_${index}` && expandSection.style.display !== "none") {
        expandSection.style.display = "none";
        expandBtn.innerHTML = `<img src="${UITemplates.veXIconsURLs.expand}" alt="Expand Icon" />`;
      }
      else if (expandSection.id !== `veX_expand_${index}` && expandSection.style.display !== "none") {
        expandSection.style.display = "none";
        expandBtn.innerHTML = `<img src="${UITemplates.veXIconsURLs.expand}" alt="Expand Icon" />`;
      }
    });
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "On Expand Btn Click", err.message), true);
  }
}

async function onSendBtnClick(index) {
  try {
    Util.showLoading();
    const prompt = prompts[index];
    const filledPrompt = draftPromptTemplate(prompt.template, index, prompt.variables, promptVariableData);
    Util.openRightSidebar();
    await Util.delay(500);
    if (await Util.openAviatorPanel() == false) {
      Util.notify("🤔 Aviator tab not found. Please ensure it is accessible.", Constants.NotificationType.Warning, true);
      return;
    }  
    Util.setNativeValue(document.querySelector(Constants.ValueEdgeNodeSelectors.AviatorTextArea), filledPrompt);
    document.querySelector(Constants.ValueEdgeNodeSelectors.AviatorPromptSubmitButton).click();
    closePromptsPopup();  
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "On Send Btn Click", err.message), true);
  } finally {
    Util.hideLoading();
  }
}

function attachPromptListEvents(container, prompts) {
  try {
    container.querySelectorAll(".veX_expand_btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        onExpandBtnClick(btn, btn.getAttribute("data-index"));
      });
    });
    container.querySelectorAll(".veX_variable_input").forEach((element) => {
      element.addEventListener("input", () => {
        onVariableChange(element, element.getAttribute("data-index"), element.getAttribute("data-name"));
      });
    });
    container.querySelectorAll(".veX_send_btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        onSendBtnClick(btn.getAttribute("data-index"));
      });
    });
    attachTemplateEditEvents(container);
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Attach Prompt List Events", err.message), true);
  }
}

function draftPromptTemplate(template, index, variables, promptVariableData) {
  try {
    const unresolved = [];

    variables.forEach(({ name, selector }) => {
      let selectorElementValue = extractValueFromElement(selector);
      let value = null;
      const placeholder = new RegExp(`{\\s*${name}\\s*}`, 'g');
      if (promptVariableData[index] && promptVariableData[index][name] && promptVariableData[index][name].trim() !== '') {
        value = promptVariableData[index][name];
        template = template.replace(placeholder, value);
      } else if (selectorElementValue) {
        value = selectorElementValue;
        value = removeExtraSpaces(value);
        template = template.replace(placeholder, value);
      } else {
        value = `${name}`;
        unresolved.push(name);
      }
    });

    const instructions = `\n${draftInstructions(unresolved, currentPromptTone)}`;
    template += instructions;
    return template;
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Draft Prompt Template", err.message), true);
  }
}
function removeExtraSpaces(text) {
  return text.trim().replace(/\s+/g, ' ');
}
function handleMessagesFromServiceWorker(request, sender, sendResponse) {
  try {
    switch (request) {
      case "openPromptsPopup":
        if (!Util.isEmptyObject(veXCurrentTicketInfo))
          openPromptsPopup();
        else if (Util.isEmptyObject(veXCurrentTicketInfo))
          Util.notify(Util.getRandomMessage(Constants.Notifications.OpenTicketToSeePrompts), Constants.NotificationType.Info, true)
        break;
    }
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Handle Messages From Service Worker", err.message), true);
  }
}

chrome.runtime.onMessage.addListener(handleMessagesFromServiceWorker);

export { initialize, openPromptsPopup, closePromptsPopup };