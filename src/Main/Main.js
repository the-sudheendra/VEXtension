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
var root = document.querySelector(':root');
var Util;
var DomPurify;
var Constants;
var MutationObservers;
var Comments;
// < veX Objects Declarations

/**
 * Loads necessary modules dynamically using chrome.runtime.getURL and dynamic import.
 * Ensures modules are loaded only once.
 */
// > Loading Modules 
async function loadModules() {
  let URL = chrome.runtime.getURL("src/Utility/Util.js");
  if (!Util)
    Util = await import(URL);
  URL = chrome.runtime.getURL("src/External/purify.min.js");
  if (!DomPurify)
    DomPurify = await import(URL);
  URL = chrome.runtime.getURL("src/Utility/Constants.js");
  if (!Constants)
    Constants = await import(URL);
  veXSelectors = Constants.VEChecklistNodeSelectors;
  URL = chrome.runtime.getURL("src/Utility/MutationObservers.js");
  if (!MutationObservers)
    MutationObservers = await import(URL);
  URL = chrome.runtime.getURL("src/Comments/Comment.js");
  if (!Comments)
    Comments = await import(URL);
}
/**
 * Initializes the extension by loading modules and setting up the UI and observers.
 */
async function initialize() {
  await loadModules();
  veXSetup();
}

/**
 * Sets up the initial state of the extension, including creating popup nodes,
 * initializing UI nodes, and starting the ticket title mutation observer.
 */


function veXSetup() {
  try {
    setupPopUpNode();
    setupPopUpOverlay();
    initVEXNodes();
    MutationObservers.initTicketTitleMutationObserver(onTicketTitleChange);
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Setup", err.message), true);
  }
}
/**
 * Creates and appends the main popup node to the document body.
 */
function setupPopUpNode() {
  veXPopUpNode.id = "veX-PopUp-Container";
  veXPopUpNode.classList.add("veX_pop_deactive");
  veXPopUpNode.innerHTML = Constants.ChecklistUI;
  document.body.appendChild(veXPopUpNode);
}

/**
 * Creates and appends the popup overlay node to the document body and
 * adds an event listener to close the popup when the overlay is clicked.
 */

function setupPopUpOverlay() {
  veXPopUpOverlay.id = "veX-PopUp-Overlay";
  veXPopUpOverlay.addEventListener("click", closeveXPopUp);
  document.body.appendChild(veXPopUpOverlay);
}
/**
 * Initializes references to key UI nodes within the popup for easier access.
 */

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

/**
 * Extracts and sets the current ticket information from the page title and other relevant elements.
 */

function getCurrentTicketInfo(title) {
  try {
    if (!title?.trim()) return;

    const ticketArr = title.split(" ");
    if (!ticketArr || ticketArr.length < 2) return;

    const match = ticketArr[0].match(/^([a-zA-Z]+)(\d+)$/);
    if (!match || match.length < 2) return;

    const ticketTypeElement = document.querySelector(Constants.ValueEdgeNodeSelectors.CurrentTicketType);
    if (!ticketTypeElement?.innerText) return;

    const ticketType = ticketTypeElement.innerText.toUpperCase();
    if (!Constants.EntityMetaData[ticketType]) {
      veXCurrentTicketInfo = {};
      return;
    }

    MutationObservers.initTicketTypeMutationObserver(onTicketTitleChange, onTicketPhaseChange);

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

/**
 * Cleans up the ticket title by removing unnecessary suffixes.
 * @param {string} title The raw ticket title.
 */

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

/**
 * Resets the extension's state, including closing the popup, clearing data, and cleaning up observers.
 */

function veXReset() {
  try {
    closeveXPopUp();
    veXCurrentCategory = {};
    veXChecklistItems = {};
    veXCurrentTicketChecklist = {};
    veXCurrentTicketInfo = {};
    veXPhaseMap = {};
    veXTotalCompletedItems = 0;
    veXTotalItems = 0;
    Util.cleanupMutationObserver(MutationObservers.veXTicketPhaseMutationObserver);
    Util.cleanupMutationObserver(MutationObservers.veXTicketTypeMutationObserver);
    root.style.setProperty('--veX-checkedItemsPercentage', `0%`);
    root.style.setProperty('--veX-fontColorAgainstTicketColor', `#000000`);
    root.style.setProperty('--veX-ticktColor', `#fff`);
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Reset", err.message), true);
  }
}

/**
 * Initializes the main view of the checklist popup, including header, footer, sidebar, and checklist content.
 */

async function initView() {
  try {
    await initHeaderView();
    await initFooterView();
    initSidebarHeaderView();
    initPhaseMap();
    initPhaseDropdownView();
    initCategoriesView(veXCurrentTicketChecklist.categories);
    updateMainContentView();
    initStyle();
    return true;
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "View initializing", err.message), true);
    return false;
  }
}

/**
 * Initializes the header section of the checklist popup with the logo and ticket title.
 */

async function initHeaderView() {
  try {
    veXNodes.veXLogo.src = await chrome.runtime.getURL("icons/fact_check_48_FFFFFF.png");
    //veXNodes.veXSyncIcon.src = await chrome.runtime.getURL("icons/sync_24.png");
    //veXNodes.veXSyncIconContainer.addEventListener('click', Comments.onSyncChecklistComments)
    veXNodes.veXHeaderTitleNode.innerHTML = veXCurrentTicketInfo.title;
    Util.makeElementDraggable(veXPopUpNode.querySelector('.veX_header'));
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Header View initializing", err.message), true);
  }
}

/**
 * Initializes the footer section of the checklist popup with comment functionality.
 */
async function initFooterView() {
  try {
    // veXPopUpNode.querySelector('.veX_add_comment_icon').src = await chrome.runtime.getURL("icons/add_comment_24.png");
    veXPopUpNode.querySelector(".veX_leave_comment_btn").addEventListener("click", onAddToComments);
    // veXPopUpNode.querySelector(".veX_edit_comment_icon").src = await chrome.runtime.getURL("icons/rate_review_24.png");
    // veXPopUpNode.querySelector(".veX_edit_comment_btn").addEventListener("click", onEditComment);
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Footer View initializing", err.message), true);
  }
}

/**
 * Creates a map of phases to categories for filtering the checklist.
 */

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

/**
 * Initializes the styling of the popup based on the ticket's color.
 */

function initStyle() {
  root.style.setProperty('--veX-ticktColor', veXCurrentTicketInfo.color);
  root.style.setProperty('--veX-fontColorAgainstTicketColor', "#FFFFFF");
}

/**
 * Initializes the header section of the sidebar with the completion percentage and ticket phase.
 */

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

/**
 * Initializes the phase dropdown in the sidebar with available phases from the phase map.
 */

function initPhaseDropdownView() {
  try {
    let veXPhaseDropDown = veXPopUpNode.querySelector(".veX_all_phases");
    veXPhaseDropDown.innerHTML = "";
    if (Util.isEmptyObject(veXPhaseMap)) return;
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
        veXNodes.veXTicketPhaseTextNode.innerText = phaseName;
        initCategoriesView(veXPhaseMap[phaseName]);
        updateMainContentView();
      });
      veXPhaseDropDown.appendChild(dropdownListNode);
    }
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Phase dropdown initializing", err.message), true);
  }
}

/**
 * Initializes the category view in the sidebar with buttons for each category.
 * @param {object} categories The categories object from the checklist data.
 */

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

/**
 * Initializes the internal checklist data structure from the fetched checklist information.
 */

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

/**
 * Updates the main content view based on the currently selected category.
 */

function updateMainContentView() {
  try {
    if (Util.isEmptyObject(veXCurrentCategory)) {
      veXNodes.veXCategoryTitleNode.innerHTML = "No Category Found";
      veXNodes.veXChecklistParentNode.innerHTML = "No Item";
      return;
    }
    veXNodes.veXCategoryTitleNode.innerHTML = veXCurrentCategory.name;
    veXNodes.veXSidebarParentNode.querySelectorAll(".veX_category_button").forEach((buttonNode) => {
      buttonNode.classList.remove("veX-Active-Button");
    });
    veXNodes.veXSidebarParentNode.querySelector(`[categoryName="${veXCurrentCategory.name}"]`).classList.add("veX-Active-Button");
    updateChecklist();
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Footer View initializing", err.message), true);
  }
}

/**
 * Creates an individual checklist item node for display.
 * @param {object} itemData - Object containing itemValue, index, and currentCheckList.
 */

function createChecklistItem({ itemValue, index, currentCheckList }) {
  const iconUrls = {
    checkbox: chrome.runtime.getURL("icons/check_box_outline_blank_24dp.png"),
    notes: chrome.runtime.getURL("icons/notes_24dp.png")
  };

  const listItem = document.createElement('div');
  const sanitizedNote = DOMPurify.sanitize(currentCheckList[index].Note);
  const listNodeUI = `
    <div class="veX_done_check">
      <img class="veX_done_icon" alt="checkbox" title="Checklist" src="${iconUrls.checkbox}">
    </div>
    <div class="veX_list_content">
      <div class="veX_list_text">${itemValue}</div>
      <div class="veX_list_actions">
        <div class="veX_note">
          <img class="veX_note_icon veX_list_action_icon" alt="checkbox" title="Add details here." src="${iconUrls.notes}">
        </div>
      </div>
    </div>
    <div id="editor" class="veX_checklist_note veX_hide_checklist_note">
    </div>
  `;

  listItem.innerHTML = listNodeUI;
  listItem.classList.add("veX_list_item");
  listItem.setAttribute('listIndex', index);
  return listItem;
}

/**
 * Updates the checklist display in the main content area based on the current category and checklist data.
 * Clears the current checklist display and renders new checklist items.
 */

function updateChecklist() {
  try {
    const { checklist } = veXCurrentCategory.value;
    const parentNode = veXNodes.veXChecklistParentNode;
    parentNode.innerHTML = "";

    if (Util.isEmptyArray(checklist)) {
      return;
    }

    const currentCheckList = veXChecklistItems[veXCurrentCategory.name];
    const fragment = document.createDocumentFragment();

    checklist.forEach((itemValue, index) => {
      const listItem = createChecklistItem({
        itemValue,
        index,
        currentCheckList
      });

      const currentListState = Util.getChecklistStatus(currentCheckList[index]);
      updateNoteIcon(listItem);
      updateListItemState(listItem, currentListState, index);
      attachChecklistItemListeners(listItem, index);
      fragment.appendChild(listItem);
    });
    parentNode.appendChild(fragment);
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Update Checklist", err.message), true);
  }
}

/**
 * Attaches event listeners to a checklist item node for handling clicks on the item and the note icon.
 * @param {HTMLElement} listItem The checklist item node.
 */

function attachChecklistItemListeners(listItem, index) {
  const noteNode = listItem.querySelector('.veX_checklist_note');
  const noteIconNode = listItem.querySelector(".veX_note");
  listItem.addEventListener("click", (event) => onListItemClick(event, listItem));
  noteIconNode.addEventListener("click", (event) => onListNoteClick(event, listItem));
  noteNode.addEventListener('click', (event) => event.stopPropagation());
  noteNode.addEventListener('input', () => {
    noteNode.style.height = 'auto';
    noteNode.style.height = `${Math.min(noteNode.scrollHeight, 250)}px`;
  });
  noteNode.addEventListener('change', (event) => onListNoteChange(event, listItem));
}

/**
 * Updates the visual state of a checklist item based on its current status.
 * @param {HTMLElement} listItem The checklist item node.
 * @param {string} state The current state of the checklist item (e.g., 'Completed', 'NotCompleted').
 */

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

/**
 * Updates the icon displayed for the note section of a checklist item based on whether a note exists.
 * @param {HTMLElement} listItem The checklist item node.
 */

function updateNoteIcon(listItem) {
  try {
    let noteIconNode = listItem.querySelector(".veX_note_icon");
    if (listItem.querySelector('.veX_checklist_note').value.trim() == "") {
      noteIconNode.src = chrome.runtime.getURL("icons/notes_24dp.png");
      noteIconNode.title = "Add details here."
    }
    else {
      noteIconNode.src = chrome.runtime.getURL("icons/edit_note_24dp.png");
      noteIconNode.title = "Edit details here"
    }
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Footer View initializing", err.message), true);
  }
}

/**
 * Fetches the current ticket phase from the ValueEdge UI.
 */

function getCurrentTicketPhase() {
  try {
    return document.querySelector(Constants.ValueEdgeNodeSelectors.PhaseNode).childNodes[3].innerText;
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Fetching Current Ticket Phase", err.message), true);
  }
}

/**
 * Calculates and updates the displayed completion percentage.
 */

function updateDonePercentage() {
  try {
    let donePercentage = Util.calculateCompletionPercentage(veXTotalItems, veXTotalCompletedItems);
    veXNodes.veXDonePercentageNode.innerHTML = `${donePercentage}%`;
    root.style.setProperty('--veX-checkedItemsPercentage', `${donePercentage}%`);
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Update Done Percentage", err.message), true);
  }
}

/**
 * Sets the state of a checklist item to 'Not Applicable' and updates its appearance.
 * @param {HTMLElement} listItemNode The checklist item node.
 * @param {number} listIndex The index of the item in the current checklist data.
 */

function setNotApplicableState(listItemNode, listIndex) {
  try {
    veXChecklistItems[veXCurrentCategory.name][listIndex].NotApplicable = true;
    listItemNode.classList.add("veX_not_applicable");
    listItemNode.classList.remove('veX_selected');
    listItemNode.classList.remove('veX_completed');
    listItemNode.querySelector(".veX_done_icon").src = chrome.runtime.getURL("icons/indeterminate_check_box_24dp_FFFFFF.png");
    listItemNode.querySelector(".veX_done_icon").title = "Not Apllicable";
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Set Not Applicable State", err.message), true);
  }
}

/**
 * Sets the state of a checklist item to 'Not Selected' and updates its appearance.
 * @param {HTMLElement} listItemNode The checklist item node.
 * @param {number} listIndex The index of the item in the current checklist data.
 */
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

/**
 * Sets the state of a checklist item to 'Not Completed' and updates its appearance.
 * @param {HTMLElement} listItemNode The checklist item node.
 * @param {number} listIndex The index of the item in the current checklist data.
 */
function setNotCompleted(listItemNode, listIndex) {
  try {
    listItemNode.classList.remove('veX_completed');
    listItemNode.classList.remove('veX_not_applicable');
    listItemNode.classList.add('veX_selected');
    veXChecklistItems[veXCurrentCategory.name][listIndex].Selected = true;
    listItemNode.querySelector(".veX_done_icon").src = chrome.runtime.getURL("icons/disabled.png");
    listItemNode.querySelector(".veX_done_icon").title = "Not Done";
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Set Not Completed State", err.message), true);
  }
}

/**
 * Sets the state of a checklist item to 'Completed' and updates its appearance.
 * @param {HTMLElement} listItemNode The checklist item node.
 * @param {number} listIndex The index of the item in the current checklist data.
 */

function setCompletedState(listItemNode, listIndex) {
  try {
    veXChecklistItems[veXCurrentCategory.name][listIndex].Completed = true;
    listItemNode.classList.add('veX_completed');
    listItemNode.classList.remove('veX_not_applicable');
    listItemNode.classList.remove('veX_selected');
    veXChecklistItems[veXCurrentCategory.name][listIndex].Completed = true;

    listItemNode.querySelector('.veX_done_check').classList.add("veX_checked");
    listItemNode.querySelector(".veX_done_icon").src = chrome.runtime.getURL("icons/check_box_24dp_FFFFFF.png");
    listItemNode.querySelector(".veX_done_icon").title = "Done"
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Set Completed State", err.message), true);
  }
}
//<-Utility Functions


//->Event Handlers
/**
 * Closes the checklist popup and overlay.
 */
function closeveXPopUp() {
  try {
    if(!veXPopUpOverlay || !veXPopUpNode) return;
    veXPopUpOverlay.style.visibility = "hidden";
    veXPopUpNode.classList.remove("veX_pop_active");
    veXPopUpNode.classList.add("veX_pop_deactive");
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Closing Popup", err.message), true);
  }

}

/**
 * Opens the checklist popup and overlay.
 */

function openVexPopup() {
  try {
    veXPopUpOverlay.style.visibility = "visible";
    veXPopUpNode.classList.add("veX_pop_active");
    veXPopUpNode.classList.remove("veX_pop_deactive");
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Opening Popup", err.message), true);
  }
}
/**
 * This function refreshes the checklist
 * from the remote URL if it exists.
 */
async function refreshChecklistFromRemoteIfExists() {
  if (await Util.getChecklistMode() != "url") {
    // We are not using the URL mode.
    // Hence, we need not refresh anything.
    return true;
  }
  try {
    // Get the remote URL from sync storage
    // and fetch the checklist from the remote URL
    const veX_dod_url = await chrome.storage.sync.get("veX_dod_url");
    const veX_loadOnStart = await chrome.storage.sync.get("veX_loadOnStart");
    const response = await fetch(veX_dod_url?.veX_dod_url);
    if (!response.ok) {
      Util.notify("Couldn't fetch checklist JSON from the URL", "warning", true);
      return false;
    }
    // Validate and update the checklist
    const veXChecklistInfo = await response.json();
    if (Util.validateChecklist(veXChecklistInfo) === true && await Util.saveChecklist(veXChecklistInfo, veX_dod_url?.veX_dod_url,veX_loadOnStart?.veX_loadOnStart) === true) {
    } else {
      return false;
    }
  } catch (error) {
    Util.onError(error, "Couldn't fetch JSON from the URL", true);
    return false;
  }
  // Return true by default so as to
  // not break any existing functionality
  return true;
}

/**
 * Handles the click event on a category button in the sidebar, updating the current category
 * and the main checklist view.
 * @param {Event} event The click event.
 */

function onCategoryChange(event) {
  let categoryName = event.target.getAttribute('categoryName');
  veXCurrentCategory = {

    name: categoryName,
    value: veXCurrentTicketChecklist.categories[categoryName]
  };
  updateMainContentView();
}

/**
 * Handles the click event on a checklist item, toggling its state and updating the completion percentage.
 * Also handles visibility of the note section.
 * @param {Event} event The click event.
 * @param {HTMLElement} listItemNode The checklist item node.
 */
function onListItemClick(event, listItemNode) {
  try {
        if (!listItemNode || !event) {
          throw new Error('Invalid input parameters for List Item Click');
        }

        if (handleNoteVisibility(listItemNode)) {
          event.stopPropagation();
          return;
        }
        updateChecklistItemState(listItemNode);

        event.stopPropagation();
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "ListItem Click", err.message), true);
  }
}

/**
 * Handles the visibility of the note section for a checklist item.
 * @param {HTMLElement} listItemNode The checklist item node.
 */

function handleNoteVisibility(listItemNode) {
  const noteElement = listItemNode.querySelector(".veX_checklist_note");
  if (!noteElement.classList.contains("veX_hide_checklist_note")) {
    noteElement.classList.add("veX_hide_checklist_note");
    updateNoteIcon(listItemNode);
    return true;
  }
  return false;
}

/**
 * Updates the state of a checklist item based on a click.
 */

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

/**
 * Updates the total completed items count based on the state change of a checklist item.
 */

function updateCompletionCount(checklistItem) {
  const previousState = Util.getChecklistStatus(checklistItem);
  if (previousState === Constants.CheckListStatus.Completed || 
      previousState === Constants.CheckListStatus.NotApplicable) {
    veXTotalCompletedItems = Math.max(0, veXTotalCompletedItems - 1);
  }
}

/**
 * Applies the new state to a checklist item, updating its appearance.
 * @param {HTMLElement} listItemNode The checklist item node.
 * @param {number} index The index of the item in the current checklist data.
 * @param {string} newState The new state to apply.
 */

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
}

/**
 * Handles the click event on the note icon of a checklist item, toggling the visibility of the note editor.
 * @param {Event} event The click event.
 */

function onListNoteClick(event, listItemNode) {
  try {
    let index = listItemNode.getAttribute('listIndex')
    veXNodes.veXChecklistParentNode.querySelectorAll('.veX_list_item').forEach((listNode) => {
      let curIndex = listNode.getAttribute('listIndex');
      let checklistNoteNode = listNode.querySelector('.veX_checklist_note');
      if (curIndex != index) {
        if (!checklistNoteNode.classList.contains("veX_hide_checklist_note")) {
          checklistNoteNode.classList.add("veX_hide_checklist_note");
          updateNoteIcon(listNode);
        }
      }

    });
    listItemNode.querySelector('.veX_checklist_note').classList.toggle("veX_hide_checklist_note");
    updateNoteIcon(listItemNode);
    if (!listItemNode.querySelector('.veX_checklist_note').classList.contains("veX_hide_checklist_note")) {
      listItemNode.querySelector('.veX_checklist_note').focus();
    }
    if (event)
      event.stopPropagation();
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "List Note Click", err.message), true);
  }
}

/**
 * Handles the change event on the note editor of a checklist item, updating the note content in the data.
 * @param {Event} event The change event.
 */
function onListNoteChange(event, listItemNode) {
  try {
    let listIndex = listItemNode.getAttribute('listIndex');
    let noteValue = listItemNode.querySelector('.veX_checklist_note').value;
    veXChecklistItems[veXCurrentCategory.name][listIndex].Note = DOMPurify.sanitize(noteValue);
    if (event)
      event.stopPropagation();
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "List Note Change", err.message), true);
  }
}

/**
 * Handles changes to the ticket title, resetting the state and initializing the checklist based on the new ticket.
 */

async function onTicketTitleChange(change) {
  try {
    veXReset();
    getCurrentTicketInfo(document.head.querySelector('title').innerText);
    if (Util.isEmptyObject(veXCurrentTicketInfo)) {
      return;
    }

    // If we are using a remote URL to maintain the checklist,
    // then refresh the checklist locally first
    let veX_loadOnStart = await chrome.storage.sync.get("veX_loadOnStart")
    if(veX_loadOnStart?.veX_loadOnStart===true)
    {
      const remoteRefreshSuccess = await refreshChecklistFromRemoteIfExists();
      if (!remoteRefreshSuccess) {
        return;
      }
    }
    let tempDOD = await chrome.storage.sync.get(veXCurrentTicketInfo.type);
    if (!Util.isEmptyObject(tempDOD)) {
      veXCurrentTicketChecklist = tempDOD[veXCurrentTicketInfo.type];
    }

    if (!Util.isEmptyObject(veXCurrentTicketChecklist)) {
      initChecklist();
      veXIsViewInitialised = initView();
     // MutationObservers.initTicketPhaseMutationObserver(onTicketPhaseChange);
    }
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Ticket Title Change", err.message), true);
  }
}


/**
 * Handles changes to the ticket phase, providing a reminder to update the checklist
 * if the phase has advanced.
 * @param {MutationRecord} mutation The mutation record from the observer.
 */

function onTicketPhaseChange(mutation) {
  try {
    if (!mutation.target) return;
    let newPhase = mutation.target.innerText;
    let oldPhase = veXCurrentTicketInfo.phase;
    if (newPhase && oldPhase && Constants.VEPhaseOrder[newPhase.toLowerCase()] > Constants.VEPhaseOrder[oldPhase.toLowerCase()]) {
      let reminderMessage = Util.getRandomMessage(Constants.Notifications.ReminderToUpdateChecklist);
      Util.notify(reminderMessage, Constants.NotificationType.Info, true);
    }
    veXCurrentTicketInfo.phase = newPhase;
    //openVexPopup();


  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Ticket Phase Change", err.message), true);
  }

}

/**
 * Handles the click event on the ticket phase, toggling the visibility of the phase dropdown.
 */

function OnTicketPhaseClick() {
  try {
    veXPopUpNode.querySelector(".veX_all_phases").classList.toggle("active");
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Ticket Phase Click", err.message), true);
  }

}

/**
 * Handles the click event on the "Add to Comments" button, adding the current checklist
 * to the ticket's comments.
 */

async function onAddToComments(event) {
  await Comments.addChecklistToComments(veXChecklistItems,Util.calculateCompletionPercentage(veXTotalItems, veXTotalCompletedItems));
  if (event)
    event.stopPropagation();
}

/**
 * Handles the click event on the "Edit Comment" button, editing the last checklist comment.
async function onEditComment(event) {
  await Comments.editExistingComment(veXChecklistItems,Util.calculateCompletionPercentage(veXTotalItems, veXTotalCompletedItems));
  if (event)
    event.stopPropagation();
}
//End of Event Handlers

/**
 * Handles messages received from the service worker, such as opening the popup.
 * @param {*} request The message received from the service worker.
 * @param {*} sender The sender of the message.
 */
function handleMessagesFromServiceWorker(request, sender, sendResponse) {
  try {
    switch (request) {

      case "openVexPopup":
        if (!(Util.isEmptyObject(veXCurrentTicketChecklist) || Util.isEmptyObject(veXCurrentTicketInfo)))
          openVexPopup();
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
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Handle Messages From Service Worker", err.message), true);
  }
}


initialize();
//<-Event Handlers

chrome.runtime.onMessage.addListener(handleMessagesFromServiceWorker);