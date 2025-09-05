// > veX Objects Declarations
var veXDODInfo = {};
var veXCurrentTicketInfo = {};
var veXCurrentTicketChecklist = {};
var veXChecklistItems = {};
var veXPhaseMap = {};
var veXTotalCompletedItems = 0;
var veXCurrentTicketCategoryNames = [];
var veXTotalItems = 0;
var veXNodes = {};
var veXPopUpNode = document.createElement("div");
var veXPopUpOverlay = document.createElement("div");
var veXCurrentPhaseCategories = [];
var veXIsViewInitialised = false;
var veXCurrentCategory = {};
var veXSelectors;
var veXToolbarButton = null;
var root = document.querySelector(':root');
var Util;
var DomPurify;
var Constants;
var MutationObservers;
var Comments;
var Quill;
var PromptModal;
var Validators;
var DefaultList;
var UITemplates;
// < veX Objects Declarations

// > Loading Modules 
async function loadModules() {
  let URL = chrome.runtime.getURL("src/Common/Util.js");
  if (!Util)
    Util = await import(URL);
  URL = chrome.runtime.getURL("src/External/purify.min.js");
  if (!DomPurify)
    DomPurify = await import(URL);
  URL = chrome.runtime.getURL("src/Common/Constants.js");
  if (!Constants)
    Constants = await import(URL);
  veXSelectors = Constants.VEChecklistNodeSelectors;
  URL = chrome.runtime.getURL("src/Common/MutationObservers.js");
  if (!MutationObservers)
    MutationObservers = await import(URL);
  URL = chrome.runtime.getURL("src/Comments/Comment.js");
  if (!Comments)
    Comments = await import(URL);
  URL = chrome.runtime.getURL("src/External/Quill/quill.js");
  if (!Quill)
    Quill = await import(URL);
  URL = chrome.runtime.getURL("src/AviatorPrompts/PromptModal.js");
  if (!PromptModal)
    PromptModal = await import(URL);
  URL = chrome.runtime.getURL("src/Common/SchemaValidators.js");
  if (!Validators)
    Validators = await import(URL);
  URL = chrome.runtime.getURL("src/Common/UITemplates.js");
  if (!UITemplates) {
    UITemplates = await import(URL);
  }
}

async function initialize() {
  await loadModules();
  veXSetup();
}


function veXSetup() {
  try {
    setupChecklistPopupNode();
    setupChecklistPopupOverlay();
    addLoadingElement();
    initVEXNodes();
    setupDocumentClickHandler();
    MutationObservers.initTicketTitleMutationObserver(onTicketTitleChange);
    PromptModal.initialize();
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Setup", err.message), true);
  }
}

function setupChecklistPopupNode() {
  veXPopUpNode.id = "veX_checklist_popup_container";
  veXPopUpNode.classList.add("veX_popup_disable");
  veXPopUpNode.innerHTML = UITemplates.ChecklistUI;
  document.body.appendChild(veXPopUpNode);
  const closeBtn = veXPopUpNode.querySelector('#veX_checklist_close_btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeChecklistPopup);
  }
  const addTaskBtn = veXPopUpNode.querySelector('#veX_add_task_btn');
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
      if (chrome && chrome.runtime && chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL('src/Options/options.html'));
      }
    });
  }
  
  // Settings dropdown functionality
  const settingsBtn = veXPopUpNode.querySelector('#veX_settings_btn');
  const settingsDropdown = veXPopUpNode.querySelector('#veX_settings_dropdown');
  
  if (settingsBtn && settingsDropdown) {
    settingsBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const isVisible = settingsDropdown.style.display === 'block';
      settingsDropdown.style.display = isVisible ? 'none' : 'block';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      if (!settingsBtn.contains(event.target) && !settingsDropdown.contains(event.target)) {
        settingsDropdown.style.display = 'none';
      }
    });
  }
  
  // Settings dropdown menu item handlers
  setupSettingsDropdownHandlers();
}

function setupSettingsDropdownHandlers() {
  const aboutBtn = veXPopUpNode.querySelector('#veX_about_btn');
  const reportProblemBtn = veXPopUpNode.querySelector('#veX_report_problem_btn');
  const feedbackBtn = veXPopUpNode.querySelector('#veX_feedback_btn');
  
  if (aboutBtn) {
    aboutBtn.addEventListener('click', () => {
      window.open('https://github.com/the-sudheendra/VEXtension?tab=readme-ov-file#features-', '_blank');
      document.querySelector('#veX_settings_dropdown').style.display = 'none';
    });
  }
  
  if (reportProblemBtn) {
    reportProblemBtn.addEventListener('click', () => {
      window.open('https://github.com/the-sudheendra/VEXtension/issues', '_blank');
      document.querySelector('#veX_settings_dropdown').style.display = 'none';
    });
  }
  
  if (feedbackBtn) {
    feedbackBtn.addEventListener('click', () => {
      window.open('https://chromewebstore.google.com/detail/ve-checklist/aeiiagpokicaeifancpnndjanamdmmdn/reviews', '_blank');
      document.querySelector('#veX_settings_dropdown').style.display = 'none';
    });
  }
  
}
function addLoadingElement() {
  let veX_loader = document.createElement('span');
  veX_loader.id = "veX_loader";
  veX_loader.style.display = "none";
  document.body.appendChild(veX_loader);
}
function setupChecklistPopupOverlay() {
  veXPopUpOverlay.id = "veX_checklist_popup_overlay";
  veXPopUpOverlay.addEventListener("click", closeChecklistPopup);
  document.body.appendChild(veXPopUpOverlay);
}

function setupDocumentClickHandler() {
  // Cache selectors for better performance
  let phaseDropdown = null;
  let phaseButton = null;
  let checklistContainer = null;
  
  document.addEventListener('click', (event) => {
    if (!veXPopUpNode.classList.contains('veX_popup_active')) {
      return;
    }
        if (!phaseDropdown) {
      phaseDropdown = veXPopUpNode.querySelector('.veX_all_phases');
      phaseButton = veXPopUpNode.querySelector('.veX_ticket_phase');
      checklistContainer = veXPopUpNode.querySelector('.veX_ui_list_container');
    }
    if (phaseDropdown && phaseButton) {
      if (!phaseDropdown.contains(event.target) && !phaseButton.contains(event.target)) {
        closePhaseDropdown();
      }
    }
        if (checklistContainer) {
      const openNoteEditors = checklistContainer.querySelectorAll('.veX_checklist_note:not(.veX_hide_checklist_note)');
      
      if (openNoteEditors.length === 0) return;
      
      openNoteEditors.forEach(noteEditor => {
        const listItem = noteEditor.closest('.veX_list_item');
        const noteIcon = listItem.querySelector('.veX_note');
        if (!noteEditor.contains(event.target) && !noteIcon.contains(event.target)) {
          noteEditor.classList.add('veX_hide_checklist_note');
          const index = parseInt(listItem.getAttribute('listIndex'));
          const categoryName = veXCurrentCategory.name;
          const currentCheckList = veXChecklistItems[categoryName];
          if (currentCheckList) {
            updateNoteIcon(listItem, currentCheckList, index);
          }
        }
      });
    }
  });
  
  const originalClosePopup = closeChecklistPopup;
  closeChecklistPopup = function() {
    phaseDropdown = null;
    phaseButton = null;
    checklistContainer = null;
    originalClosePopup();
  };
}

function initVEXNodes() {
  try {
    veXNodes.veXCategoryTitleNode = veXPopUpNode.querySelector(veXSelectors.UITitle);
    veXNodes.veXSidebarParentNode = veXPopUpNode.querySelector(veXSelectors.UISidebar);
    veXNodes.veXChecklistParentNode = veXPopUpNode.querySelector(veXSelectors.UIListContainer);
    veXNodes.veXHeaderTitleNode = veXPopUpNode.querySelector(veXSelectors.UIHeaderTitle);
    veXNodes.veXDODcategoriesNode = veXPopUpNode.querySelector(veXSelectors.UICategories);
    veXNodes.veXTicketPhaseTextNode = veXPopUpNode.querySelector(veXSelectors.UITicketPhaseText);
    veXNodes.veXTicketPhaseNode = veXPopUpNode.querySelector(veXSelectors.UITicketPhase);
    veXNodes.veXDonePercentageNode = veXPopUpNode.querySelector(veXSelectors.UIDonePercentage);
    veXNodes.veXPhaseDropDown = veXPopUpNode.querySelector(veXSelectors.UIAllPhases);
    veXNodes.veXLogo = veXPopUpNode.querySelector(veXSelectors.UILogo);
    veXNodes.veXSyncIcon = veXPopUpNode.querySelector(veXSelectors.UISyncIcon);
    veXNodes.veXSyncIconContainer = veXPopUpNode.querySelector(veXSelectors.UISyncIconContainer);
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Nodes Setup", err.message), true);
  }
}

function getCurrentTicketInfo(title) {
  try {
    if (!title?.trim()) return;

    const ticketArr = title.split(" ");
    if (!ticketArr || ticketArr.length < 2) return;

    const match = ticketArr[0].match(/^([a-zA-Z]+)(\d+)$/);
    if (!match || match.length < 2) return;

    const tickeTypeHeader = document.querySelector(".entity-form-document-view-header-entity-name");
    if (!tickeTypeHeader) return;
    const ticketTypeElement = tickeTypeHeader.querySelector(Constants.ValueEdgeNodeSelectors.CurrentTicketType);
    if (!ticketTypeElement?.innerText) return;
    const ticketType = ticketTypeElement.innerText.toUpperCase().trim().replace(/\s+/g, ' ');
    if (!Constants.EntityMetaData[ticketType]) {
      veXCurrentTicketInfo = {};
      return;
    }

    MutationObservers.initTicketTypeMutationObserver(onTicketTitleChange, onTicketPhaseChange);
    MutationObservers.initTicketPhaseMutationObserver(onTicketPhaseChange);


    veXCurrentTicketInfo = {
      type: Constants.EntityMetaData[ticketType].name,
      id: match[2],
      color: Constants.EntityMetaData[ticketType].colorHex,
      title: getTicketTitle(title.slice(ticketArr[0].length + 1)),
      phase: getCurrentTicketPhase()
    };
  }
  catch (err) {
    veXCurrentTicketInfo = {}
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "getCurrentTicketInfo", err.message), false);
  }
}

function getTicketTitle(title) {
  try {
    if (title.endsWith("- Core Software Delivery Platform")) {
      let x = "- Core Software Delivery Platform".length;
      title = title.slice(0, -x);
    }
  }
  finally {
    return title;
  }
}

function cleanupQuillEditors() {
  try {
    Object.values(veXChecklistItems).forEach(categoryItems => {
      if (Array.isArray(categoryItems)) {
        categoryItems.forEach(item => {
          if (item.RichTextNote && typeof item.RichTextNote.off === 'function') {
            item.RichTextNote.off('text-change');
            item.RichTextNote = null;
          }
        });
      }
    });
  } catch (err) {
    console.warn('Error cleaning up Quill editors:', err);
  }
}

function veXReset() {
  try {
    closeChecklistPopup();
    cleanupQuillEditors();
    veXCurrentCategory = {};
    veXChecklistItems = {};
    veXCurrentTicketChecklist = {};
    veXCurrentTicketInfo = {};
    veXPhaseMap = {};
    veXTotalCompletedItems = 0;
    veXTotalItems = 0;
    Util.cleanupMutationObserver(MutationObservers.veXTicketPhaseMutationObserver);
    Util.cleanupMutationObserver(MutationObservers.veXTicketTypeMutationObserver);
    removeChecklistToolbarButton();
    root.style.setProperty('--veX-checkedItemsPercentage', `0%`);
    root.style.setProperty('--veX-fontColorAgainstTicketColor', `#000000`);
    root.style.setProperty('--veX-ticktColor', `#fff`);
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Reset", err.message), false);
  }
}

async function initView() {
  try {
    await initHeaderView();
    await initFooterView();
    initSidebarHeaderView();
    initPhaseMap();
    initPhaseDropdownView();
    initCategoriesView(getPhaseCategories(veXCurrentTicketInfo.phase));
    updateMainContentView();
    initStyle();
    return true;
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "View initializing", err.message), true);
    return false;
  }
}

function getPhaseCategories(phaseName) {
  phaseName = phaseName || veXCurrentTicketInfo.phase;

  if (!veXCurrentTicketChecklist || Util.isEmptyObject(veXCurrentTicketChecklist)) return {};
  let categoriesToShow = veXCurrentTicketChecklist.categories;
  veXNodes.veXTicketPhaseTextNode.innerText = "All Categories";

  if (
    phaseName &&
    veXPhaseMap.hasOwnProperty(phaseName) &&
    Object.keys(veXPhaseMap[phaseName]).length > 0
  ) {
    categoriesToShow = veXPhaseMap[phaseName];
    veXNodes.veXTicketPhaseTextNode.innerText = phaseName;
  }
  return categoriesToShow;
}
async function initHeaderView() {
  try {
    veXNodes.veXHeaderTitleNode.innerHTML = `${veXCurrentTicketInfo.type?"Checklist for "+veXCurrentTicketInfo.type:"Checklist"}`;
    Util.makeElementDraggable(veXPopUpNode.querySelector('.veX_header'), document.getElementById("veX_checklist_popup_container"));
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Header View initializing", err.message), true);
  }
}
async function initFooterView() {
  try {
    // veXPopUpNode.querySelector('.veX_add_comment_icon').src = await chrome.runtime.getURL("icons/add_comment_24.png");
    veXPopUpNode.querySelector(".veX_leave_comment_btn").addEventListener("click", onAddToComments);
    // veXPopUpNode.querySelector(".veX_edit_comment_icon").src = await chrome.runtime.getURL("icons/rate_review_24.png");
    veXPopUpNode.querySelector(".veX_edit_comment_btn").addEventListener("click", onEditComment);
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Footer View initializing", err.message), true);
  }
}

function initPhaseMap() {
  try {
    veXPhaseMap = {
      "All Categories": {}
    };
    const categories = Object.keys(veXCurrentTicketChecklist?.categories || {});
    if (!categories.length) return;

    categories.forEach(categoryName => {
      const category = veXCurrentTicketChecklist.categories[categoryName];
      const phases = category?.phases || [];

      veXPhaseMap["All Categories"][categoryName] = category;

      if (Util.isEmptyArray(phases)) return;

      phases.forEach(phase => {
        veXPhaseMap[phase] = veXPhaseMap[phase] || {};
        veXPhaseMap[phase][categoryName] = category;
      });
    });
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Phases initializing", err.message), true);
  }
}

function initStyle() {
  root.style.setProperty('--veX-ticktColor', veXCurrentTicketInfo.color);
  root.style.setProperty('--veX-fontColorAgainstTicketColor', "#FFFFFF");
}

function initSidebarHeaderView() {
  try {
    veXNodes.veXDonePercentageNode.innerHTML = "0%";
    veXNodes.veXTicketPhaseTextNode.innerHTML = "All Categories";
    veXNodes.veXTicketPhaseNode.addEventListener('click', OnTicketPhaseClick);
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "SideBar Header initializing", err.message), true);
  }
}

function initPhaseDropdownView() {
  try {
    let veXPhaseDropDown = veXPopUpNode.querySelector(".veX_all_phases");
    veXPhaseDropDown.innerHTML = "";
    if (Util.isEmptyObject(veXPhaseMap)) return;
    veXPhaseDropDown.addEventListener('click', (event) => {
      event.stopPropagation();
    });
    let avaliablePhases = Object.keys(veXPhaseMap).sort((p1, p2) => Constants.VEPhaseOrder[p1.toLowerCase()] - Constants.VEPhaseOrder[p2.toLowerCase()]);
    avaliablePhases.splice(avaliablePhases.indexOf("All Categories"), 1);
    avaliablePhases.push("All Categories");
    for (let i = 0; i < avaliablePhases.length; i++) {
      let dropdownListNode = document.createElement('div');
      dropdownListNode.classList.add("veX_phase");
      dropdownListNode.setAttribute("phaseName", avaliablePhases[i]);
      dropdownListNode.textContent = avaliablePhases[i];
      dropdownListNode.addEventListener('click', (event) => {
        let phaseName = event.target.getAttribute('phaseName');
        onPhaseChange(phaseName);
        event.stopPropagation();
      });
      veXPhaseDropDown.appendChild(dropdownListNode);
    }
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Phase dropdown initializing", err.message), true);
  }
}

function onPhaseChange(phaseName) {
  closePhaseDropdown();
  initCategoriesView(getPhaseCategories(phaseName));
  updateMainContentView();
}

function initCategoriesView(categories) {
  veXNodes.veXDODcategoriesNode.innerHTML = "";
  try {
    if (Util.isEmptyObject(categories)) {
      veXNodes.veXDODcategoriesNode.innerHTML = "No Item";
      return;
    };
    let categoryNames = Object.keys(categories);
    categoryNames.forEach(
      (categoryName) => {
        let sideBarItemNode = document.createElement('button');
        sideBarItemNode.className = "veX_category_button";
        sideBarItemNode.setAttribute("categoryName", categoryName);
        sideBarItemNode.addEventListener('click', onCategoryChange);
        sideBarItemNode.textContent = categoryName;
        veXNodes.veXDODcategoriesNode.appendChild(sideBarItemNode);
      }
    );
    veXCurrentCategory = {
      name: categoryNames[0],
      value: categories[categoryNames[0]]
    }
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Categories View initializing", err.message), true);
  }
}

function initChecklist() {
  veXTotalItems = 0;
  veXChecklistItems = {};
  try {
    let categories = Object.keys(veXCurrentTicketChecklist.categories);
    if (Util.isEmptyArray(categories)) {
      Util.notify("No category found while initializing checklist item");
      return;
    }
    categories.forEach((categoryName) => {
      veXChecklistItems[categoryName] = [];
      let currentCategory = veXCurrentTicketChecklist.categories[categoryName];
      currentCategory.checklist.forEach((listContent) => {
        veXChecklistItems[categoryName].push(
          {
            Note: "",
            ListContent: listContent,
            CursorState:
            {
              "position": 0
            }
          }
        );
        veXTotalItems++;
      }
      );
    });
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Checklist Data initializing", err.message), true);
  }
}

function updateMainContentView() {
  try {
    Util.showLoading();
    if (Util.isEmptyObject(veXCurrentCategory)) {
      veXNodes.veXCategoryTitleNode.innerHTML = "No Category Found";
      veXNodes.veXChecklistParentNode.innerHTML = "No Item";
      return;
    }
    veXNodes.veXCategoryTitleNode.innerHTML = veXCurrentCategory.name;

    // Add event listeners for mark category buttons
    const markCompletedBtn = veXPopUpNode.querySelector('.veX_mark_category_completed_btn');
    const markNotDoneBtn = veXPopUpNode.querySelector('.veX_mark_category_not_done_btn');
    const markNotApplicableBtn = veXPopUpNode.querySelector('.veX_mark_category_not_applicable_btn');
    const markUnselectBtn = veXPopUpNode.querySelector('.veX_mark_category_unselect_btn');

    if (markCompletedBtn) {
      markCompletedBtn.onclick = function () {
        markCurrentCategoryAsCompleted();
      };
    }
    if (markNotDoneBtn) {
      markNotDoneBtn.onclick = function () {
        markCurrentCategoryAsNotDone();
      };
    }
    if (markNotApplicableBtn) {
      markNotApplicableBtn.onclick = function () {
        markCurrentCategoryAsNotApplicable();
      };
    }
    if (markUnselectBtn) {
      markUnselectBtn.onclick = function () {
        markCurrentCategoryAsUnselected();
      };
    }
    veXNodes.veXSidebarParentNode.querySelectorAll(".veX_category_button").forEach((buttonNode) => {
      if (buttonNode)
        buttonNode.classList.remove("veX-Active-Button");
    });
    veXNodes.veXSidebarParentNode.querySelector(`[categoryName="${veXCurrentCategory.name}"]`).classList.add("veX-Active-Button");
    updateChecklist();
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Update mainContent view", err.message), true);
  }
  finally {
    Util.hideLoading();
  }
}

function createChecklistItem({ itemValue, index, currentCheckList }) {
  const iconUrls = {
    checkbox: chrome.runtime.getURL("icons/check_box_outline_blank_24dp.png"),
    notes: chrome.runtime.getURL("icons/notes_24dp.png")
  };

  const listItem = document.createElement('div');
  const listNodeUI = `
      <div class="veX_done_check">
      <img class="veX_done_icon" alt="checkbox" title="Checklist" src="${iconUrls.checkbox}">
    </div>
    <div class="veX_list_content">
      <div class="veX_list_text">${itemValue}</div>
      <div class="veX_list_actions">
          <div class="veX_note">
            <img class="veX_note_icon veX_list_action_icon" alt="checkbox" title="Add notes here." src="${iconUrls.notes}">
          </div>
      </div>
    </div>
    <div class="veX_checklist_note veX_hide_checklist_note" >
      <div id="veX_note_editor">
      </div>
    </div>
  `;

  listItem.innerHTML = listNodeUI;
  const quillContainer = listItem.querySelector('#veX_note_editor');
  if (quillContainer) {
    const quillOptions = {
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline'],
          ['code-block'],
          ['link', 'image'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'color': [] }, { 'background': [] }]
        ],
      },
      placeholder: 'Notes..✍️',
      theme: 'snow',
    };

    if (currentCheckList[index].RichTextNote && currentCheckList[index].RichTextNote.container) {
      if (currentCheckList[index].RichTextNote.container.parentNode === quillContainer) {
        return listItem; 
      }
    }
    const quill = new Quill(quillContainer, quillOptions);
    
    if (currentCheckList[index].RichTextNote) {
      try {
        const existingContent = currentCheckList[index].RichTextNote.getContents();
        quill.setContents(existingContent);
      } catch (e) {
    
      }
    }
    
    currentCheckList[index]["RichTextNote"] = quill;

    // Add text change listener for note icon updates (debounced for performance)
    quill.on('text-change', () => {
      debouncedUpdateNoteIcon(listItem, currentCheckList, index);
    });
  }
  listItem.classList.add("veX_list_item");
  listItem.setAttribute('listIndex', index);
  return listItem;
}



function updateChecklist() {
  try {
    const { checklist } = veXCurrentCategory.value;
    const parentNode = veXNodes.veXChecklistParentNode;
    const categoryName = veXCurrentCategory.name;

    if (Util.isEmptyArray(checklist)) {
      parentNode.innerHTML = "";
      return;
    }

    parentNode.innerHTML = "";
    const currentCheckList = veXChecklistItems[categoryName];
    const fragment = document.createDocumentFragment();

    checklist.forEach((itemValue, index) => {
      const listItem = createChecklistItem({
        itemValue,
        index,
        currentCheckList
      });

      const currentListState = Util.getChecklistStatus(currentCheckList[index]);
      updateNoteIcon(listItem, currentCheckList, index);
      updateListItemState(listItem, currentListState, index);
      attachChecklistItemListeners(listItem, currentCheckList, index);
      fragment.appendChild(listItem);
    });
    parentNode.appendChild(fragment);
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Update Checklist", err.message), true);
  }
}

function attachChecklistItemListeners(listItem, currentCheckList, index) {
  const noteNode = listItem.querySelector('.veX_checklist_note');
  const noteIconNode = listItem.querySelector(".veX_note");
  listItem.addEventListener("click", (event) => onListItemClick(event, listItem, currentCheckList, index));
  noteIconNode.addEventListener("click", (event) => onListNoteClick(event, listItem, currentCheckList, index));
  noteNode.addEventListener('click', (event) => event.stopPropagation());
}

function updateListItemState(listItem, state, index) {
  const stateHandlers = {
    [Constants.CheckListStatus.NotSelected]: () => setNotSelected(listItem, index),
    [Constants.CheckListStatus.NotCompleted]: () => setNotCompleted(listItem, index),
    [Constants.CheckListStatus.NotApplicable]: () => setNotApplicableState(listItem, index),
    [Constants.CheckListStatus.Completed]: () => setCompletedState(listItem, index)
  };

  const handler = stateHandlers[state];
  if (handler) {
    handler();
  }
}

const debouncedUpdateNoteIcon = (() => {
  const debounceMap = new Map();
  
  return (listItem, currentCheckList, index, delay = 100) => {
    const key = `${index}_${listItem.getAttribute('listIndex')}`;
    
    if (debounceMap.has(key)) {
      clearTimeout(debounceMap.get(key));
    }
    
    const timeoutId = setTimeout(() => {
      updateNoteIcon(listItem, currentCheckList, index);
      debounceMap.delete(key);
    }, delay);
    
    debounceMap.set(key, timeoutId);
  };
})();

function updateNoteIcon(listItem, currentCheckList, index) {
  try {

    let noteIconNode = listItem.querySelector(".veX_note_icon");
    if (currentCheckList[index].RichTextNote.getLength() <= 1) {
      noteIconNode.src = chrome.runtime.getURL("icons/notes_24dp.png");
      noteIconNode.title = "Add notes here."
    }
    else {
      noteIconNode.src = chrome.runtime.getURL("icons/edit_note_24dp.png");
      noteIconNode.title = "Edit notes here"
    }
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Footer View initializing", err.message), true);
  }
}

function getCurrentTicketPhase() {
  try {
    return document.querySelector(Constants.ValueEdgeNodeSelectors.PhaseNode).childNodes[3].innerText;
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Fetching Current Ticket Phase", err.message), true);
  }
}

function updateDonePercentage() {
  try {
    let donePercentage = Util.calculateCompletionPercentage(veXTotalItems, veXTotalCompletedItems);
    veXNodes.veXDonePercentageNode.innerHTML = `${donePercentage}%`;
    root.style.setProperty('--veX-checkedItemsPercentage', `${donePercentage}%`);
    updateChecklistToolbarBadge();
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Update Done Percentage", err.message), true);
  }
}

function countTotalChecklistItems() {
  try {
    let totalItems = 0;
    if (veXChecklistItems && !Util.isEmptyObject(veXChecklistItems)) {
      Object.values(veXChecklistItems).forEach(categoryItems => {
        if (Array.isArray(categoryItems)) {
          categoryItems.forEach(item => {
              totalItems++;
          });
        }
      });
    }
    return totalItems;
  } catch (err) {
    Util.onError(err, "Error counting checklist items", false);
    return 0;
  }
}

async function createChecklistToolbarButton() {
  try {
    removeChecklistToolbarButton();

    const toolbarContainer = document.querySelector('[data-aid="alm-entity-form-tab-details-toolbar toolbar"] .toolbar-buttons-group');
    if (!toolbarContainer) {
      setTimeout(() => {
        createChecklistToolbarButton();
      }, 500);
      return;
    }

    veXToolbarButton = document.createElement('div');
    veXToolbarButton.id = 'veX_checklist_toolbar_button';
    veXToolbarButton.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 6px 10px;
      margin-left: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      min-width: 44px;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 6px;
    `;

    // Add hover effect
    veXToolbarButton.addEventListener('mouseenter', function() {
      this.style.background = 'rgba(0,0,0,0.1)';
    });
    
    veXToolbarButton.addEventListener('mouseleave', function() {
      this.style.background = 'transparent';
    });

    // Create the icon
    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('icons/checklist_24dp.png');
    icon.alt = 'Checklist';
    icon.title = 'View Checklist Items';
    icon.style.cssText = `
      width: 22px;
      height: 22px;
      display: block;
    `;

    // Create the badge
    const badge = document.createElement('span');
    badge.id = 'veX_checklist_toolbar_badge';
    badge.style.cssText = `
      position: absolute;
      top: -3px;
      right: -3px;
      background: ${veXCurrentTicketInfo.color || '#f29339'};      
      color: white;
      border-radius: 8px;
      padding: 3px;
      font-size: 10px;
      text-align: center;
      border: 1px solid white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Set initial badge count
    const todoCount = countTotalChecklistItems();
    badge.textContent = todoCount.toString();
    badge.style.display = todoCount > 0 ? 'block' : 'none';

    // Add click handler to open checklist popup
    veXToolbarButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!(Util.isEmptyObject(veXCurrentTicketChecklist) || Util.isEmptyObject(veXCurrentTicketInfo))) {
        openChecklistPopup();
      } else if (!Util.isEmptyObject(veXCurrentTicketInfo) && Util.isEmptyObject(veXCurrentTicketChecklist)) {
        Util.notify(Util.formatMessage(Util.getRandomMessage(Constants.Notifications.UnableToFindChecklist), veXCurrentTicketInfo.type), Constants.NotificationType.Info, true);
      } else {
        Util.notify(Util.getRandomMessage(Constants.Notifications.OpenTicketToSeeChecklist), Constants.NotificationType.Info, true);
      }
    });

    // Assemble the button
    veXToolbarButton.appendChild(icon);
    veXToolbarButton.appendChild(badge);

    // Append to toolbar
    toolbarContainer.appendChild(veXToolbarButton);

  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Create Toolbar Button", err.message), false);
  }
}

function removeChecklistToolbarButton() {
  try {
    if (veXToolbarButton && veXToolbarButton.parentNode) {
      veXToolbarButton.parentNode.removeChild(veXToolbarButton);
    }
    veXToolbarButton = null;
  } catch (err) {
    Util.onError(err, "Error removing toolbar button", false);
  }
}

function updateChecklistToolbarBadge() {
  // TODO: We have to use this once we have sync with comments and chec
  // try {
  // //   if (!veXToolbarButton) return;

  // //   const badge = veXToolbarButton.querySelector('#veX_checklist_toolbar_badge');
  // //   if (!badge) return;

  // //   const todoCount = countTotalChecklistItems();
  // //   badge.textContent = todoCount.toString();
  // //   badge.style.display = todoCount > 0 ? 'block' : 'none';
  // // } catch (err) {
  // //   Util.onError(err, "Error updating toolbar badge", false);
  // // }
  // }
}

function showChecklistUpdateAnimation() {
  try {
    if (!veXToolbarButton) return;
    
    // Add CSS animation keyframes if not already added
    if (!document.getElementById('veX_checklist_animation_styles')) {
      const style = document.createElement('style');
      style.id = 'veX_checklist_animation_styles';
      style.textContent = `
        @keyframes veX-gentle-pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(1);
          }
        }
        
        .veX_checklist_update_animation {
          animation: veX-gentle-pulse 0.8s ease-in-out 1;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Add animation class
    veXToolbarButton.classList.add('veX_checklist_update_animation');
    
    // Remove animation after it completes
    setTimeout(() => {
      veXToolbarButton.classList.remove('veX_checklist_update_animation');
    }, 800); // Match animation duration
    
  } catch (err) {
    Util.onError(err, "Error showing checklist update animation", false);
  }
}function setNotApplicableState(listItemNode, listIndex) {
  try {
    veXChecklistItems[veXCurrentCategory.name][listIndex].NotApplicable = true;
    listItemNode.classList.add("veX_not_applicable");
    listItemNode.classList.remove('veX_selected');
    listItemNode.classList.remove('veX_completed');
    listItemNode.querySelector(".veX_done_icon").src = chrome.runtime.getURL("icons/indeterminate_check_box_24dp_FFFFFF.png");
    listItemNode.querySelector(".veX_done_icon").title = "Not Apllicable";
    listItemNode.title = "Item is marked as not applicable";
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Set Not Applicable State", err.message), true);
  }
}
function setNotSelected(listItemNode, listIndex) {
  try {
    listItemNode.classList.remove('veX_selected');
    listItemNode.classList.remove('veX_completed');
    listItemNode.classList.remove('veX_not_applicable');
    veXChecklistItems[veXCurrentCategory.name][listIndex].Selected = false;
    listItemNode.classList.remove('veX_selected');
    listItemNode.querySelector(".veX_done_icon").src = chrome.runtime.getURL("icons/check_box_outline_blank_24dp.png");
    listItemNode.querySelector(".veX_done_icon").title = "Unselected";
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Set Not Selected State", err.message), true);
  }
}
function setNotCompleted(listItemNode, listIndex) {
  try {
    listItemNode.classList.remove('veX_completed');
    listItemNode.classList.remove('veX_not_applicable');
    listItemNode.classList.add('veX_selected');
    veXChecklistItems[veXCurrentCategory.name][listIndex].Selected = true;
    listItemNode.querySelector(".veX_done_icon").src = chrome.runtime.getURL("icons/disabled.png");
    listItemNode.querySelector(".veX_done_icon").title = "Not Done";
    listItemNode.title = "Item is marked as not done";
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Set Not Completed State", err.message), true);
  }
}

function setCompletedState(listItemNode, listIndex) {
  try {
    veXChecklistItems[veXCurrentCategory.name][listIndex].Completed = true;
    listItemNode.classList.add('veX_completed');
    listItemNode.classList.remove('veX_not_applicable');
    listItemNode.classList.remove('veX_selected');
    veXChecklistItems[veXCurrentCategory.name][listIndex].Completed = true;

    listItemNode.querySelector('.veX_done_check').classList.add("veX_checked");
    listItemNode.querySelector(".veX_done_icon").src = chrome.runtime.getURL("icons/check_box_24dp_FFFFFF.png");
    listItemNode.querySelector(".veX_done_icon").title = "Done";
    listItemNode.title = "Item is marked as done";
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Set Completed State", err.message), true);
  }
}
//<-Common Functions


//->Event Handlers
function closeChecklistPopup() {
  try {
    if (!veXPopUpOverlay || !veXPopUpNode) return;
    veXPopUpOverlay.style.visibility = "hidden";
    veXPopUpNode.classList.remove("veX_popup_active");
    veXPopUpNode.classList.add("veX_popup_disable");
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Closing Checklist Popup", err.message), true);
  }
}

function openChecklistPopup() {
  try {
    if (Util.isPromptsPopupOpen()) {
      PromptModal.closePromptsPopup();
    }
    veXPopUpOverlay.style.visibility = "visible";
    veXPopUpOverlay.classList.add("veX_overlay_opening");
    veXPopUpNode.classList.add("veX_popup_active");
    veXPopUpNode.classList.add("veX_popup_opening");
    Util.centerThePopup(veXPopUpNode);
    veXPopUpNode.classList.remove("veX_popup_disable");
        setTimeout(() => {
      veXPopUpNode.classList.remove("veX_popup_opening");
      veXPopUpOverlay.classList.remove("veX_overlay_opening");
    }, 600);
    
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Opening Checklist Popup", err.message), true);
  }
}

function openPromptsPopup() {
  try {

  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Opening PromptPopup", err.message), true);
  }
}



/**
 * This function refreshes the checklist
 * from the remote URL if it exists.
 */
async function refreshChecklistFromRemoteIfExists(veXChecklistData) {
  if (!veXChecklistData["veXChecklistRemoteUrl"]) {
    return true;
  }
  try {
    const veXChecklistRemoteUrl = veXChecklistData["veXChecklistRemoteUrl"];
    const veXLoadOnStart = veXChecklistData["veXLoadOnStart"];
    const response = await fetch(`${veXChecklistRemoteUrl}?ts=${Date.now()}`);
    if (!response.ok) {
      Util.notify("Couldn't fetch checklist JSON from the URL", "warning", true);
      return false;
    }
    const veXChecklistInfo = await response.json();
    if (Validators.validateChecklist(veXChecklistInfo) === true && await Util.saveChecklistData(veXChecklistInfo, veXChecklistRemoteUrl?.veXChecklistRemoteUrl, veXLoadOnStart?.veXLoadOnStart) === true) {
    } else {
      return false;
    }
  } catch (error) {
    Util.onError(error, "Couldn't fetch JSON from the URL", true);
    return false;
  }
  return true;
}


function onCategoryChange(event) {
  let categoryName = event.target.getAttribute('categoryName');
  veXCurrentCategory = {

    name: categoryName,
    value: veXCurrentTicketChecklist.categories[categoryName]
  };
  updateMainContentView();
}

function onListItemClick(event, listItemNode, currentCheckList, index) {
  try {
    if (!listItemNode || !event) {
      throw new Error('Invalid input parameters for List Item Click');
    }

    if (handleNoteVisibility(listItemNode, currentCheckList, index)) {
      event.stopPropagation();
      return;
    }
    updateChecklistItemState(listItemNode);

    event.stopPropagation();
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "ListItem Click", err.message), true);
  }
}

function handleNoteVisibility(listItemNode, currentCheckList, index) {
  const noteElement = listItemNode.querySelector(".veX_checklist_note");
  if (!noteElement.classList.contains("veX_hide_checklist_note")) {
    noteElement.classList.add("veX_hide_checklist_note");
    updateNoteIcon(listItemNode, currentCheckList, index);
    return true;
  }
  return false;
}

function updateChecklistItemState(listItemNode) {
  const index = listItemNode.getAttribute('listIndex');
  const currentCheckList = veXChecklistItems[veXCurrentCategory.name];

  if (!currentCheckList?.[index]) {
    throw new Error('Invalid checklist item index');
  }
  updateCompletionCount(currentCheckList[index]);

  currentCheckList[index].CursorState.position =
    (currentCheckList[index].CursorState.position + 1) % Object.keys(Constants.CheckListStatus).length;

  const newState = Util.getChecklistStatus(currentCheckList[index]);
  applyNewState(listItemNode, index, newState);
  updateDonePercentage();
}

function updateCompletionCount(checklistItem) {
  const previousState = Util.getChecklistStatus(checklistItem);
  if (previousState === Constants.CheckListStatus.Completed ||
    previousState === Constants.CheckListStatus.NotApplicable) {
    veXTotalCompletedItems = Math.max(0, veXTotalCompletedItems - 1);
  }
}

function applyNewState(listItemNode, index, newState) {
  const stateHandlers = {
    [Constants.CheckListStatus.NotSelected]: () => {
      setNotSelected(listItemNode, index);
    },
    [Constants.CheckListStatus.NotApplicable]: () => {
      veXTotalCompletedItems++;
      setNotApplicableState(listItemNode, index);
    },
    [Constants.CheckListStatus.NotCompleted]: () => {
      setNotCompleted(listItemNode, index);
    },
    [Constants.CheckListStatus.Completed]: () => {
      veXTotalCompletedItems++;
      setCompletedState(listItemNode, index);
    }
  };

  const handler = stateHandlers[newState];
  if (handler) {
    handler();
  }
  updateChecklistToolbarBadge();
}

function onListNoteClick(event, listItemNode, currentCheckList, index) {
  try {
    let index = listItemNode.getAttribute('listIndex')
    veXNodes.veXChecklistParentNode.querySelectorAll('.veX_list_item').forEach((listNode) => {
      let curIndex = listNode.getAttribute('listIndex');
      let checklistNoteNode = listNode.querySelector('.veX_checklist_note');
      if (curIndex != index) {
        if (!checklistNoteNode.classList.contains("veX_hide_checklist_note")) {
          checklistNoteNode.classList.add("veX_hide_checklist_note");
          updateNoteIcon(listNode, currentCheckList, index);
        }
      }

    });
    listItemNode.querySelector('.veX_checklist_note').classList.toggle("veX_hide_checklist_note");
    updateNoteIcon(listItemNode, currentCheckList, index);
    if (!listItemNode.querySelector('.veX_checklist_note').classList.contains("veX_hide_checklist_note")) {
      if (currentCheckList[index] && currentCheckList[index].RichTextNote) {
        currentCheckList[index].RichTextNote.focus();
      }
    }
    if (event)
      event.stopPropagation();
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "List Note Click", err.message), true);
  }
}
// function onListNoteChange(event, listItemNode) {
//   try {
//     let listIndex = listItemNode.getAttribute('listIndex');
//     let noteValue = listItemNode.querySelector('.veX_checklist_note').value;
//     veXChecklistItems[veXCurrentCategory.name][listIndex].Note = DOMPurify.sanitize(noteValue);
//     if (event)
//       event.stopPropagation();
//   } catch (err) {
//     Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "List Note Change", err.message), true);
//   }
// }

async function onTicketTitleChange(change) {
  try {
    veXReset();
    getCurrentTicketInfo(document.head.querySelector('title').innerText);
    if (Util.isEmptyObject(veXCurrentTicketInfo)) {
      removeChecklistToolbarButton();
      return;
    }

    // If we are using a remote URL to maintain the checklist,
    // then refresh the checklist locally first
    let veXChecklistData = await chrome.storage.local.get("veXChecklistData");
    let checklist = {};
    let loadOnStart = false;
    let veXChecklistRemoteUrl = "";
    if (veXChecklistData) {
      veXChecklistData = veXChecklistData["veXChecklistData"]
    }
    if (veXChecklistData) {
      checklist = veXChecklistData["checklist"];
      loadOnStart = veXChecklistData["veXLoadOnStart"];
      veXChecklistRemoteUrl = veXChecklistData["veXChecklistRemoteUrl"];
    }
    if (loadOnStart === true) {
      const remoteRefreshSuccess = await refreshChecklistFromRemoteIfExists(veXChecklistData);
      if (!remoteRefreshSuccess) {
        removeChecklistToolbarButton();
        return;
      }
    }
    veXCurrentTicketChecklist = checklist[veXCurrentTicketInfo.type];

    if (!Util.isEmptyObject(veXCurrentTicketChecklist)) {
      initChecklist();
      veXIsViewInitialised = initView();
      createChecklistToolbarButton();
    } else {
      removeChecklistToolbarButton();
    }
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Ticket Title Change", err.message), true);
  }
}



function onTicketPhaseChange(mutation) {
  try {
    if (!mutation.target) return;
    let newPhase = mutation.target.innerText;
    let oldPhase = veXCurrentTicketInfo.phase;

    if (newPhase && oldPhase && Constants.VEPhaseOrder[newPhase.toLowerCase()] > Constants.VEPhaseOrder[oldPhase.toLowerCase()]) {
      const phaseCategories = getPhaseCategories(newPhase);
      if (phaseCategories && Object.keys(phaseCategories).length > 0) {
        showChecklistUpdateAnimation();
      }
    }
    veXCurrentTicketInfo.phase = newPhase;
    onPhaseChange(newPhase);

  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Ticket Phase Change", err.message), true);
  }

}

function OnTicketPhaseClick(event) {
  try {
    const dropdown = veXPopUpNode.querySelector(".veX_all_phases");
    dropdown.classList.toggle("active");
    if (event) {
      event.stopPropagation();
    }
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Ticket Phase Click", err.message), true);
  }
}

function closePhaseDropdown() {
  try {
    const dropdown = veXPopUpNode.querySelector(".veX_all_phases");
    if (dropdown) {
      dropdown.classList.remove("active");
    }
  }
  catch (err) {
  }
}

async function onAddToComments(event) {
  await Comments.addChecklistToComments(veXChecklistItems, Util.calculateCompletionPercentage(veXTotalItems, veXTotalCompletedItems));
  if (event)
    event.stopPropagation();
}
async function onEditComment(event) {
  await Comments.editExistingComment(veXChecklistItems, Util.calculateCompletionPercentage(veXTotalItems, veXTotalCompletedItems));
  if (event)
    event.stopPropagation();
}
//End of Event Handlers

function handleMessagesFromServiceWorker(request, sender, sendResponse) {
  try {
    switch (request) {
      case "openChecklistPopup":
        if (!(Util.isEmptyObject(veXCurrentTicketChecklist) || Util.isEmptyObject(veXCurrentTicketInfo)))
          openChecklistPopup();
        else if (!Util.isEmptyObject(veXCurrentTicketInfo) && Util.isEmptyObject(veXCurrentTicketChecklist)) {
          Util.notify(Util.formatMessage(Util.getRandomMessage(Constants.Notifications.UnableToFindChecklist), veXCurrentTicketInfo.type), Constants.NotificationType.Info, true);
        }
        else if (Util.isEmptyObject(veXCurrentTicketInfo))
          Util.notify(Util.getRandomMessage(Constants.Notifications.OpenTicketToSeeChecklist), Constants.NotificationType.Info, true)
        else if (veXIsViewInitialised === false) {
          Util.notify(Util.getRandomMessage(Constants.ErrorMessages.SomethingWentWrong), Constants.NotificationType.Error, true);
        }
        else
          Util.notify(Util.getRandomMessage(Constants.ErrorMessages.SomethingWentWrong), Constants.NotificationType.Error, true);
        break;
    }
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Handling Messages From Service Worker", err.message), true);
  }
}

function markCurrentCategoryAsCompleted() {
  try {
    const currentCategoryName = veXCurrentCategory.name;
    const currentCheckList = veXChecklistItems[currentCategoryName];
    if (!currentCheckList) return;
    let newlyCompletedCount = 0;
    for (let i = 0; i < currentCheckList.length; i++) {
      const item = currentCheckList[i];
      const prevStatus = Util.getChecklistStatus(item);
      if (prevStatus == Constants.CheckListStatus.NotSelected || prevStatus == Constants.CheckListStatus.NotCompleted) {
        newlyCompletedCount++;
      }
      item.CursorState.position = 1; // 1 = Completed
      item.Completed = true;
      item.Selected = true;
      item.NotApplicable = false;
    }
    // Only increment by the number of items that were not already completed or not applicable
    veXTotalCompletedItems += newlyCompletedCount;
    updateChecklist();
    updateDonePercentage();
    updateChecklistToolbarBadge();
  } catch (err) {
    Util.onError(
      err,
      Util.formatMessage(
        Util.getRandomMessage(Constants.ErrorMessages.UnHandledException),
        "Mark Category Completed",
        err.message
      ),
      true
    );
  }
}

function markCurrentCategoryAsNotDone() {
  try {
    const currentCategoryName = veXCurrentCategory.name;
    const currentCheckList = veXChecklistItems[currentCategoryName];
    if (!currentCheckList) return;
    let newlyNotDoneCount = 0;
    for (let i = 0; i < currentCheckList.length; i++) {
      const item = currentCheckList[i];
      const prevStatus = Util.getChecklistStatus(item);
      if (prevStatus == Constants.CheckListStatus.Completed || prevStatus === Constants.CheckListStatus.NotApplicable) {
        newlyNotDoneCount++;
      }
      item.CursorState.position = 2; // 0 = Not Done
      item.Completed = false;
      item.Selected = false;
      item.NotApplicable = false;
    }
    // Decrement by the number of items that were previously completed or not applicable
    veXTotalCompletedItems -= newlyNotDoneCount;
    updateChecklist();
    updateDonePercentage();
    updateChecklistToolbarBadge();
  } catch (err) {
    Util.onError(
      err,
      Util.formatMessage(
        Util.getRandomMessage(Constants.ErrorMessages.UnHandledException),
        "Mark Category Not Done",
        err.message
      ),
      true
    );
  }
}

function markCurrentCategoryAsNotApplicable() {
  try {
    const currentCategoryName = veXCurrentCategory.name;
    const currentCheckList = veXChecklistItems[currentCategoryName];
    if (!currentCheckList) return;
    let newlyNotApplicableCount = 0;
    for (let i = 0; i < currentCheckList.length; i++) {
      const item = currentCheckList[i];
      const prevStatus = Util.getChecklistStatus(item);
      if (prevStatus == Constants.CheckListStatus.NotCompleted || prevStatus == Constants.CheckListStatus.NotSelected) {
        newlyNotApplicableCount++;
      }
      item.CursorState.position = 3;
      item.Completed = false;
      item.Selected = false;
      item.NotApplicable = true;
    }
    // Increment by the number of items that were not previously not applicable
    veXTotalCompletedItems += newlyNotApplicableCount;
    updateChecklist();
    updateDonePercentage();
    updateChecklistToolbarBadge();
  } catch (err) {
    Util.onError(
      err,
      Util.formatMessage(
        Util.getRandomMessage(Constants.ErrorMessages.UnHandledException),
        "Mark Category Not Applicable",
        err.message
      ),
      true
    );
  }
}

function resetCurrentCategoryToUnselected() {
  const currentCategoryName = veXCurrentCategory.name;
  const currentCheckList = veXChecklistItems[currentCategoryName];
  if (!currentCheckList) return;
  for (let i = 0; i < currentCheckList.length; i++) {
    currentCheckList[i].CursorState.position = 0; // NotSelected
    currentCheckList[i].Completed = false;
    currentCheckList[i].Selected = false;
    currentCheckList[i].NotApplicable = false;
  }
}

function recalculateCompletedItemsForCategory(currentCheckList) {
  let completedCount = 0;
  for (let i = 0; i < currentCheckList.length; i++) {
    const status = Util.getChecklistStatus(currentCheckList[i]);
    if (status === Constants.CheckListStatus.Completed || status === Constants.CheckListStatus.NotApplicable) {
      completedCount++;
    }
  }
  return completedCount;
}

function markCurrentCategoryAsUnselected() {
  try {
    const completedItems = recalculateCompletedItemsForCategory(veXChecklistItems[veXCurrentCategory.name]);
    resetCurrentCategoryToUnselected();
    veXTotalCompletedItems -= completedItems;
    if (veXTotalCompletedItems < 0) veXTotalCompletedItems = 0;
    updateChecklist();
    updateDonePercentage();
    updateChecklistToolbarBadge();
  } catch (err) {
    Util.onError(
      err,
      Util.formatMessage(
        Util.getRandomMessage(Constants.ErrorMessages.UnHandledException),
        "Mark Category Unselected",
        err.message
      ),
      true
    );
  }
}

initialize();
//<-Event Handlers

chrome.runtime.onMessage.addListener(handleMessagesFromServiceWorker);