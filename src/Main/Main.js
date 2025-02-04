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

async function initialize() {
  await loadModules();
  veXSetup();
}


function veXSetup() {
  try {
    veXPopUpNode.id = "veX-PopUp-Container";
    veXPopUpNode.classList.add("veX_pop_deactive");
    veXPopUpOverlay.id = "veX-PopUp-Overlay";
    veXPopUpNode.innerHTML = Constants.ChecklistUI;
    veXPopUpOverlay.addEventListener("click", closeveXPopUp);
    MutationObservers.initTicketTitleMutationObserver(onTicketTitleChange);
    document.body.appendChild(veXPopUpNode);
    document.body.appendChild(veXPopUpOverlay);
    initVEXNodes();
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Setup", err.message), true);
  }
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
    if (!title) return ;
    const ticketArr = title.split(" ");
    if (!ticketArr  || ticketArr.length < 2) return ;
    const match = ticketArr[0].match(/^([a-zA-Z]+)(\d+)$/);
    if (!match || match.length < 2) return;
    let ticketType = document.querySelector(Constants.ValueEdgeNodeSelectors.CurrentTicketType);
    if (!ticketType || ticketType.length == "")
      return;
    ticketType = ticketType.innerText;
    MutationObservers.initTicketTypeMutationObserver(onTicketTitleChange, onTicketPhaseChange);
    ticketType = ticketType.toUpperCase();
    //let pageTicketId = document.querySelector(Util.ValueEdgeNodeSelectors.CurrentTicketId);
    if(!Constants.EntityMetaData.hasOwnProperty(ticketType))
    {
      veXCurrentTicketInfo={};
      return;
    }
    veXCurrentTicketInfo =
    {
      type: Constants.EntityMetaData[ticketType].name,
      id: match[2],
      color: Constants.EntityMetaData[ticketType].colorHex,
      title: getTicketTitle(title.slice(ticketArr[0].length + 1)),
      phase: getCurrentTicketPhase()
    }
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

function veXReset() {
  try {
    veXCurrentCategory = {};
    veXChecklistItems = {};
    veXCurrentTicketChecklist = {};
    veXCurrentTicketInfo = {};
    veXPhaseMap = {};
    veXTotalCompletedItems = 0;
    veXTotalItems = 0;
    if (MutationObservers.veXTicketPhaseMutationObserver) {
      MutationObservers.veXTicketPhaseMutationObserver.disconnect();
      MutationObservers.veXTicketPhaseMutationObserver = undefined;
    }
    if (MutationObservers.veXTicketTypeMutationObserver) {
      MutationObservers.veXTicketTypeMutationObserver.disconnect();
      MutationObservers.veXTicketTypeMutationObserver = undefined;
    }
    root.style.setProperty('--veX-checkedItemsPercentage', `0%`);
    root.style.setProperty('--veX-fontColorAgainstTicketColor', `#000000`);
    root.style.setProperty('--veX-ticktColor', `#fff`);
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Reset", err.message), true);
  }
}

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

async function initHeaderView() {
  try {
    veXNodes.veXLogo.src = await chrome.runtime.getURL("icons/fact_check_48_FFFFFF.png");
    //veXNodes.veXSyncIcon.src = await chrome.runtime.getURL("icons/sync_24.png");
    //veXNodes.veXSyncIconContainer.addEventListener('click', Comments.onSyncChecklistComments)
    veXNodes.veXHeaderTitleNode.innerHTML = veXCurrentTicketInfo.title;
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Header View initializing", err.message), true);
  }
}
async function initFooterView() {
  try {
    veXPopUpNode.querySelector('.veX_add_comment_icon').src = await chrome.runtime.getURL("icons/add_comment_24.png");
    veXPopUpNode.querySelector(".veX_leave_comment_btn").addEventListener("click", onAddToComments);
    veXPopUpNode.querySelector(".veX_edit_comment_icon").src = await chrome.runtime.getURL("icons/rate_review_24.png");
    veXPopUpNode.querySelector(".veX_edit_comment_btn").addEventListener("click", onEditComment);
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Footer View initializing", err.message), true);
  }
}
async function onAddToComments(event) {
  await Comments.addChecklistToComments(veXChecklistItems);
  if (event)
    event.stopPropagation();
}
async function onEditComment(event) {
  await Comments.editExistingComment(veXChecklistItems);
  if (event)
    event.stopPropagation();
}

function initPhaseMap() {
  try {
    let categories = Object.keys(veXCurrentTicketChecklist.categories);
    veXPhaseMap["All Categories"] = {};
    categories.forEach(
      (categoryName) => {
        let phases = veXCurrentTicketChecklist.categories[categoryName]["phases"];
        if (!Util.isEmptyArray(phases)) {
          phases.forEach((phase) => {
            if (phase in veXPhaseMap) {
              veXPhaseMap[phase][categoryName] = veXCurrentTicketChecklist.categories[categoryName];
            }
            else {
              veXPhaseMap[phase] = {};
              veXPhaseMap[phase][categoryName] = veXCurrentTicketChecklist.categories[categoryName];
            }
          });
        }
        veXPhaseMap["All Categories"][categoryName] = veXCurrentTicketChecklist.categories[categoryName];
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

function updateChecklist() {
  try {
    let checklist = veXCurrentCategory.value.checklist;
    veXNodes.veXChecklistParentNode.innerHTML = "";
    if (Util.isEmptyArray(checklist)) {
      return;
    }
    let currentCheckList = veXChecklistItems[veXCurrentCategory.name];
    let index = 0;
    checklist.forEach(
      (itemValue) => {
        let listItem = document.createElement('div');
        let listNodeUI = `
            <div class="veX_done_check">
                <img class="veX_done_icon  " alt="checkbox" title="Checklist" src="${chrome.runtime.getURL("icons/check_box_outline_blank_24dp.png")}">
            </div>
            <div class="veX_list_content">
                <div class="veX_list_text  ">${itemValue}</div>
                <div class="veX_list_actions">
                    <div class="veX_note">
                        <img class="veX_note_icon veX_list_action_icon  " alt="checkbox" title="Add details here." src="${chrome.runtime.getURL("icons/notes_24dp.png")}">
                    </div>
                </div>
            </div>
            <textarea class="veX_checklist_note veX_hide_checklist_note" placeholder="Add details (Markdown Supported)">${currentCheckList[index].Note}</textarea>
        `;
        listItem.innerHTML = listNodeUI;
        listItem.classList.add("veX_list_item")
        listItem.setAttribute('listIndex', index);
        listItem.addEventListener("click", (event) => {
          onListItemClick(event, listItem);
        });
        let currentListState = Util.getChecklistStatus(currentCheckList[index]);
        updateNoteIcon(listItem);
        switch (currentListState) {
          case Constants.CheckListStatus.NotSelected:
            setNotSelected(listItem, index);
            break;
          case Constants.CheckListStatus.NotCompleted:
            setNotCompleted(listItem, index);
            break;
          case Constants.CheckListStatus.NotApplicable:
            setNotApplicableState(listItem, index);
            break;
          case Constants.CheckListStatus.Completed:
            setCompletedState(listItem, index);
            break;
        }
        let noteIconNode = listItem.querySelector(".veX_note");
        let doneIconNode = listItem.querySelector(".veX_done_check");
        let noteNode = listItem.querySelector('.veX_checklist_note');
        let naNode = listItem.querySelector('.veX_na');
        noteNode.innerText = DOMPurify.sanitize(currentCheckList[index].Note);
        noteIconNode.addEventListener("click", (event) => {
          onListNoteClick(event, listItem);
        });
        // noteNode.addEventListener('blur',(event)=>{
        //   noteNode.classList.contains("veX_hide_checklist_note");
        // })
        noteNode.addEventListener('click', (event) => {
          event.stopPropagation();
        });

        noteNode.addEventListener('input', () => {
          noteNode.style.height = 'auto'; // Reset height
          noteNode.style.height = `${Math.min(noteNode.scrollHeight, 250)}px`; // Adjust height up to max-height
        });
        listItem.querySelector('.veX_checklist_note').addEventListener('change', (event) => {
          onListNoteChange(event, listItem);
        });
        veXNodes.veXChecklistParentNode.appendChild(listItem);
        index++;
      }
    );
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Updation Checklist", err.message), true);
  }
}

function updateNoteIcon(listItem) {
  try {
    let noteIconNode = listItem.querySelector(".veX_note_icon");
    if (listItem.querySelector('.veX_checklist_note').value.trim() == "") {
      noteIconNode.src = chrome.runtime.getURL("icons/notes_24dp.png");
      noteIconNode.title = "Add details here. Use HTML tags for formatting and structure."
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
    let donePercentage = ((veXTotalCompletedItems / veXTotalItems).toFixed(2) * 100).toFixed(0);
    if (donePercentage > 100)
      donePercentage = 100
    else if (donePercentage == 0)
      donePercentage = 0;
    veXNodes.veXDonePercentageNode.innerHTML = `${donePercentage}%`;
    root.style.setProperty('--veX-checkedItemsPercentage', `${donePercentage}%`);
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Update Done Percentage", err.message), true);
  }
}
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
    listItemNode.querySelector(".veX_done_icon").title = "Done"
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Set Completed State", err.message), true);
  }
}
//<-Utility Functions


//->Event Handlers
function closeveXPopUp() {
  try {
    veXPopUpOverlay.style.visibility = "hidden";
    veXPopUpNode.classList.remove("veX_pop_active");
    veXPopUpNode.classList.add("veX_pop_deactive");
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Close Vex Popup", err.message), true);
  }

}

function openVexPopup() {
  try {
    veXPopUpOverlay.style.visibility = "visible";
    veXPopUpNode.classList.add("veX_pop_active");
    veXPopUpNode.classList.remove("veX_pop_deactive");
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Open Vex Popup", err.message), true);
  }
}


function onCategoryChange(event) {
  let categoryName = event.target.getAttribute('categoryName');
  veXCurrentCategory = {
    name: categoryName,
    value: veXCurrentTicketChecklist.categories[categoryName]
  };
  updateMainContentView();
}
function onListItemClick(event, listItemNode) {
  try {
    let currentNode = listItemNode;
    if (!currentNode.querySelector(".veX_checklist_note").classList.contains("veX_hide_checklist_note")) {
      currentNode.querySelector(".veX_checklist_note").classList.add("veX_hide_checklist_note");
      updateNoteIcon(listItemNode);
      event.stopPropagation(currentNode);
      return;
    }
    let currentCheckList = veXChecklistItems[veXCurrentCategory.name];
    let index = listItemNode.getAttribute('listIndex')
    let previousState = Util.getChecklistStatus(currentCheckList[index]);
    if (previousState == Constants.CheckListStatus.Completed || previousState == Constants.CheckListStatus.NotApplicable) {
      veXTotalCompletedItems--;
    }

    currentCheckList[index].CursorState.position = (currentCheckList[index].CursorState.position + 1) % 4;

    let newState = Util.getChecklistStatus(currentCheckList[index]);

    switch (newState) {
      case Constants.CheckListStatus.NotSelected:
        setNotSelected(listItemNode, index);
        break;
      case Constants.CheckListStatus.NotApplicable:
        veXTotalCompletedItems++;
        setNotApplicableState(listItemNode, index);
        break;
      case Constants.CheckListStatus.NotCompleted:
        setNotCompleted(listItemNode, index);
        break;
      case Constants.CheckListStatus.Completed:
        veXTotalCompletedItems++;
        setCompletedState(listItemNode, index);
        break;
      default:
        break;
    }
    updateDonePercentage();
    if (event)
      event.stopPropagation();
  } catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "ListItem Click", err.message), true);
  }
}

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

async function onTicketTitleChange(change) {
  try {
    veXReset();
    getCurrentTicketInfo(document.head.querySelector('title').innerText);
    if (Util.isEmptyObject(veXCurrentTicketInfo)) {
      return;
    }
    let tempDOD = await chrome.storage.sync.get(veXCurrentTicketInfo.type);
    if (!Util.isEmptyObject(tempDOD)) {
      veXCurrentTicketChecklist = tempDOD[veXCurrentTicketInfo.type];
    }
    if (!Util.isEmptyObject(veXCurrentTicketChecklist)) {
      MutationObservers.initTicketPhaseMutationObserver(onTicketPhaseChange);
      initChecklist();
      veXIsViewInitialised = initView();
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

function OnTicketPhaseClick() {
  try {
    veXPopUpNode.querySelector(".veX_all_phases").classList.toggle("active");
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Ticket Phase Click", err.message), true);
  }

}

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