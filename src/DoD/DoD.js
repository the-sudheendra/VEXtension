//-->veX Objects Declarations
var veXDODInfo = {};
var veXCurrentTicketInfo = {};
var veXCurrentTicketDOD = {};
var veXCheckedItems = {};
var veXPhaseMap = {};
var veXTotalCheckedItems = 0;
var veXTotalItems = 0;
var veXPopUpNode = document.createElement("div");
var veXPopUpOverlay = document.createElement("div");
var veXCategoryTitleNode;
var veXSidebarParentNode;
var veXChecklistParentNode;
var veXHeaderTitleNode;
var veXDODcategoriesNode;
var veXTicketPhaseMutationObserver;
var veXTicketTitleMutationObserver;
var veXTicketPhaseTextNode;
var veXDonePercentageNode;
var veXTicketPhaseNode;
var veXCurrentPhaseCategories = [];
var veXIsViewInitialised = false;
var root = document.querySelector(':root');
var utilAPI;
(async () => {
  const utilURL = chrome.runtime.getURL("src/Utility/util.js");
  utilAPI = await import(utilURL);
})();
const veXEntityMetaData = {
  'E':
  {
    'name': 'Epic',
    'colorHex': '#7425ad'
  },
  'F':
  {
    'name': 'Feature',
    'colorHex': '#e57828'
  },
  'D':
  {
    'name': 'Defect',
    'colorHex': '#b5224f'
  },
  'ER':
  {
    'name': 'Enhancement',
    'colorHex': '#5555cf'
  },
  'IM':
  {
    'name': 'CPE Incident',
    'colorHex': '#ff404b'
  },
  'I':
  {
    'name': 'CPE Incident',
    'colorHex': '#ff404b'
  },
  'US':
  {
    'name': 'User Story',
    'colorHex': '#ffaa00'
  },
  'INT':
  {
    'name': 'Internal',
    'colorHex': '#be52e4'
  },
  'SK':
  {
    'name': 'Spike',
    'colorHex': '#0baaf3'
  },
  'QS':
  {
    'name': 'Quality Story',
    'colorHex': '#2fc07e'
  },
  'T':
  {
    'name': 'Task',
    'colorHex': '#1365c0'
  }
}

var vexDODUI = `
<header class="veX_header veX_banner">
    <div class="veX_logo_container">
        <img class="veX_logo" alt="Logo">
    </div>
    <p class="veX_header_title"></p>
</header>
<div class="veX_done_status"></div>
<div class="veX_content_wrapper">
    <div class="veX_sidebar">
        <div class="veX_sidebar_header">
            <div class="veX_ticket_phase">
                <p class="veX_ticket_phase_txt">Not Available</p>
                <div class="veX_all_phases">
                </div>
            </div>
            <div class="veX_done_percentage">0%</div>
        </div>
        <div class="veX_dod_categories">No Item</div>
    </div>
    <div class="veX_main_content">
        <div class="veX_dod_title">No Item</div>
        <div class="veX_dod_list_container">
            <ul class="veX_dod_list"></ul>
        </div>
    </div>
</div>
<div class="veX_banner veX_footer">
    <button class="veX_common_btn">Leave a Comment</button>
</div>
`;
//<-- veX Objects Declarations

//->Initialising Mutation Observers to notify whenever DOM changes.
function initTicketTitleMutationObserver() {
  try {
    let targetNode = document.head.querySelector('title');
    if (!targetNode) return;
    let options = { attributes: true, childList: true, subtree: true };
    veXTicketTitleMutationObserver = new MutationObserver(
      (mutationList, observer) => {
        for (const mutation of mutationList) {
          onTicketTitleChange(mutation);
        }
      }
    );
    veXTicketTitleMutationObserver.observe(targetNode, options);
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred during the setup.");
  }
}

function initTicketPhaseMutationObserver() {
  let targetNode = document.querySelector("[data-aid='entity-life-cycle-widget-phase']").childNodes[3];
  if (!targetNode) return;
  let options = { attributes: true };
  veXTicketPhaseMutationObserver = new MutationObserver(
    (mutationList, observer) => {
      for (const mutation of mutationList) {
        onTicketPhaseChange(mutation);
      }
    }
  );
  veXTicketPhaseMutationObserver.observe(targetNode, options);
}
//<-Initialising Mutation Observers


//->Utility Functions
function veXSetup() {
  try {
    veXPopUpNode.id = "veX-PopUp-Container";
    veXPopUpNode.classList.add("veX_pop_deactive");
    veXPopUpOverlay.id = "veX-PopUp-Overlay";
    veXPopUpNode.innerHTML = vexDODUI;
    document.body.appendChild(veXPopUpNode);
    document.body.appendChild(veXPopUpOverlay);
    veXPopUpNode.querySelector(".veX_common_btn").addEventListener("click", addDoneListToComments);
    veXPopUpOverlay.addEventListener("click", closeveXPopUp);
    initTicketTitleMutationObserver();
    initVEXNodes();
  } catch (err) {
    utilAPI.onError(err, "An error occurred during the setup.");
  }
}

function initVEXNodes() {
  veXCategoryTitleNode = veXPopUpNode.querySelector('.veX_dod_title');
  veXSidebarParentNode = veXPopUpNode.querySelector('.veX_sidebar');
  veXChecklistParentNode = veXPopUpNode.querySelector('.veX_dod_list');
  veXHeaderTitleNode = veXPopUpNode.querySelector(".veX_header_title");
  veXDODcategoriesNode = veXPopUpNode.querySelector(".veX_dod_categories");
  veXTicketPhaseTextNode = veXPopUpNode.querySelector(".veX_ticket_phase_txt");
  veXTicketPhaseNode = veXPopUpNode.querySelector(".veX_ticket_phase");
  veXDonePercentageNode = veXPopUpNode.querySelector(".veX_done_percentage");
}

function getCurrentTicketInfo(title) {
  try {
    if (!title) return;
    ticketArr = title.split(" ");
    if (ticketArr.length < 2) return;
    const match = ticketArr[0].match(/^([a-zA-Z]+)(\d+)$/);
    if (!match || match.length == 0) return;
    let ticketType = (document.querySelector('[ng-if="header.shouldShowEntityLabel"]').innerText).toUpperCase();
    veXCurrentTicketInfo =
    {
      type: veXEntityMetaData[ticketType].name,
      id: match[2],
      color: veXEntityMetaData[ticketType].colorHex,
      title: modifyTicketTitle(title.slice(ticketArr[0].length + 1)),
      phase: getCurrentTicketPhase()
    }
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred while attempting to retrieve the current ticket information.");
  }
}

function modifyTicketTitle(title) {
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
  veXCheckedItems = {};
  veXCurrentTicketDOD = {};
  veXCurrentTicketInfo = {};
  veXTotalCheckedItems = 0;
  veXTotalItems = 0;
  if (veXTicketPhaseMutationObserver) {
    veXTicketPhaseMutationObserver.disconnect();
    veXTicketPhaseMutationObserver = undefined;
  }
  root.style.setProperty('--veX-checkedItemsPercentage', `0%`);
  root.style.setProperty('--veX-fontColorAgainstTicketColor', `#000000`);
  root.style.setProperty('--veX-ticktColor', `#fff`);
}

function initView() {
  try {
    initHeaderView();
    initSidebarHeaderView();
    initCategoriesView();
    updateMainContentView(0);
    initStyle();
    return true;
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred while initiating the view.");
    return false;
  }
}

async function initHeaderView() {
  try {
    veXPopUpNode.querySelector('.veX_logo').src = await chrome.runtime.getURL("icons/fact_check_48_FFFFFF.png");
    veXHeaderTitleNode.innerHTML = veXCurrentTicketInfo.title;
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred while initializing the header view.");
    throw err;
  }
}

function initStyle() {
  root.style.setProperty('--veX-ticktColor', veXCurrentTicketInfo.color);
  root.style.setProperty('--veX-fontColorAgainstTicketColor', "#FFFFFF");
}

function initSidebarHeaderView() {
  try {
    veXDonePercentageNode.innerHTML = "0%";
    veXTicketPhaseTextNode.innerHTML = veXCurrentTicketInfo.phase;
    //veXTicketPhaseNode.addEventListener('click', OnTicketPhaseClick);
    veXPopUpNode.querySelector(".veX_all_phases").style.display = "none";
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred while initializing the sidebar header view.");
    throw err;
  }
}

function initCategoriesView() {
  let index = 0;
  veXDODcategoriesNode.innerHTML = "";
  try {
    let categories = veXCurrentTicketDOD.categories;
    if (utilAPI.isEmptyArray(categories)) {
      veXDODcategoriesNode.innerHTML = "No Item";
      return;
    };
    categories.forEach(
      (category) => {
        let phases = category["phases"];
        if (!utilAPI.isEmptyArray(phases)) {
          phases.forEach((phase) => {
            if (phase in veXPhaseMap) {
              veXPhaseMap[phase].push(index);
            }
            else {
              veXPhaseMap[phase] = [];
              veXPhaseMap[phase].push(index);
            }
          });
        }
        let sideBarItemNode = document.createElement('button');
        sideBarItemNode.className = "veX-Button";
        sideBarItemNode.setAttribute('categoryIndex', index);
        sideBarItemNode.addEventListener('click', (event) => {
          updateMainContentView(event.target.getAttribute('categoryIndex'));
        });
        veXDODcategoriesNode.appendChild(sideBarItemNode);
        sideBarItemNode.textContent = category.name;
        index++;
      }
    );
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred while initializing the categories view.");
    throw err;
  }
}

function updateMainContentView(categoryIndex) {
  try {
    if (utilAPI.isEmptyArray(veXCurrentTicketDOD.categories)) {
      veXCategoryTitleNode.innerHTML = "No Item";
      veXChecklistParentNode.innerHTML = "No Item";
      return;
    }
    let currentCategory = veXCurrentTicketDOD.categories[categoryIndex];
    if (utilAPI.isEmptyObject(currentCategory)) {
      veXCategoryTitleNode.innerHTML = "No Item";
      veXChecklistParentNode.innerHTML = "No Item";
      return;
    }
    veXCategoryTitleNode.innerHTML = currentCategory.name;
    veXPopUpNode.querySelectorAll('.veX-Button').forEach((buttonNode) => {
      buttonNode.classList.remove("veX-Active-Button");
    });
    veXSidebarParentNode.querySelector(`[categoryIndex="${categoryIndex}"]`).classList.add("veX-Active-Button");
    updateCheckList(currentCategory.checklist, categoryIndex);
  } catch (err) {
    utilAPI.onError(err, "An error occurred while updating main content view.", true);
  }
}

function updateCheckList(checkList, categoryIndex) {
  veXChecklistParentNode.innerHTML = "";
  try {
    if (utilAPI.isEmptyArray(checkList)) {
      return;
    }
    let currentCheckList = veXCheckedItems[categoryIndex];
    let index = 0;
    checkList.forEach(
      (itemValue) => {
        let listItem = document.createElement('li');
        listItem.setAttribute('listIndex', index);
        listItem.setAttribute('categoryIndex', categoryIndex);
        listItem.addEventListener('click', onListItemClick);
        listItem.textContent = itemValue;
        veXChecklistParentNode.appendChild(listItem);
        if (currentCheckList[index] == 1) {
          listItem.classList.add('checked');
        }
        index++;
      }
    );
  } catch (err) {
    utilAPI.onError(err, "An error occurred while updating checklist", true);
  }
}

function initCheckedItems() {
  veXTotalItems = 0;
  veXCheckedItems = [];
  try {
    if (utilAPI.isEmptyArray(veXCurrentTicketDOD.categories)) {
      utilAPI.notify("No category found.");
      return;
    }
    for (let i = 0; i < veXCurrentTicketDOD.categories.length; i++) {
      veXCheckedItems[i] = [];
      let curCategory = veXCurrentTicketDOD.categories[i];
      if (utilAPI.isEmptyArray(curCategory.checklist)) return;
      for (let j = 0; j < curCategory.checklist.length; j++) {
        veXCheckedItems[i][j] = 0;
        veXTotalItems++;
      }
    }
  } catch (err) {
    utilAPI.onError(err, "An error occurred while initializing the CheckedItems Array.")
  }
}

function addDoneListToComments() {
  try {
    if (veXTotalCheckedItems == 0) {
      utilAPI.notify("Mark at least one item as complete to enable commenting.", "warning", true);
      return;
    }
    let rightSidebarCommentButton = document.querySelector("[data-aid='panel-item-label-commentsPanel']")
    if (rightSidebarCommentButton)
      rightSidebarCommentButton.click();
    setTimeout(() => {
      let dummyAddNewCommentBox = document.querySelector("[data-aid='comments-pane-add-new-comment-placeholder-state']")
      if (dummyAddNewCommentBox)
        dummyAddNewCommentBox.click();
      setTimeout(() => {
        let commentBox = document.querySelector(".mqm-writing-new-comment-div").querySelector(".fr-wrapper").childNodes[0];
        if (commentBox)
          commentBox.innerHTML = draftCommentForCheckedItems();
        setTimeout(() => {
          let commentSubmitButton = document.querySelector("[ng-click='comments.onAddNewCommentClicked()']");
          // if (commentSubmitButton) {
          //   commentSubmitButton.removeAttribute("disabled");
          //   setTimeout(() => { commentSubmitButton.click(); }, 2000);
          // }
        }, 100);
      }, 100);
    }, 100);
  }
  catch (ex) {
    utilAPI.onError(ex, "An exception occurred while trying to open comments in response to a click event", true)
  }
}

function draftCommentForCheckedItems() {
  try {
    let CommentDraftNode = document.createElement('div');
    let CommentHeaderNode = document.createElement("p");
    let donePercentage = ((veXTotalCheckedItems / veXTotalItems).toFixed(2) * 100).toFixed(0);
    CommentHeaderNode.innerHTML = `<strong>**Done Checklist-(${donePercentage}%)**</strong>`;
    CommentHeaderNode.style.color = "#22BB33";
    CommentDraftNode.appendChild(CommentHeaderNode);
    for (categoryIndex in veXCheckedItems) {
      let categoryName = veXCurrentTicketDOD.categories[categoryIndex].name;
      let checkList = veXCurrentTicketDOD.categories[categoryIndex].checklist;
      let checkedItems = veXCheckedItems[categoryIndex];
      let currList = [];
      for (let i = 0; i < checkedItems.length; i++) {
        if (checkedItems[i] == 1) {
          currList.push(checkList[i]);
        }
      }
      if (currList.length == 0)
        continue;
      let categoryNameNode = document.createElement("p")
      categoryNameNode.innerHTML = `<b>${categoryName}</b>`;
      let checkedListNode = document.createElement("ul");
      checkedListNode.style.listStyleType = "none";
      currList.forEach((item) => {
        let itemNode = document.createElement("li");
        itemNode.innerHTML = `[✔]${item}`
        checkedListNode.appendChild(itemNode);
      });
      CommentDraftNode.appendChild(categoryNameNode);
      CommentDraftNode.appendChild(checkedListNode);
    }
    let finalComment = CommentDraftNode.innerHTML;
    CommentDraftNode.remove();
    return finalComment;
  }
  catch (ex) {
    utilAPI.onError(ex, "An error occurred while drafting your comment. Please report the issue", true);
  }
}


function getCurrentTicketPhase() {
  try {
    return document.querySelector("[data-aid='entity-life-cycle-widget-phase']").childNodes[3].innerText;
  }
  catch (err) {
    utilAPI.onError(err, undefined, false);
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
    utilAPI.onError(err, undefined, true);
  }
}

function openVexPopup() {
  try {
    veXPopUpOverlay.style.visibility = "visible";
    veXPopUpNode.classList.add("veX_pop_active");
    veXPopUpNode.classList.remove("veX_pop_deactive");
  } catch (err) {
    utilAPI.onError(err, undefined, true);
  }
}

function onListItemClick(event) {
  try {
    let catIndex = event.target.getAttribute('categoryIndex')
    let listIndex = event.target.getAttribute('listIndex')
    event.target.classList.toggle('checked');
    if (event.target.classList.contains('checked')) {
      veXCheckedItems[catIndex][listIndex] = 1;
      veXTotalCheckedItems++;
    }
    else {
      veXCheckedItems[catIndex][listIndex] = 0;
      veXTotalCheckedItems--;
    }
    let donePercentage = ((veXTotalCheckedItems / veXTotalItems).toFixed(2) * 100).toFixed(0);
    veXDonePercentageNode.innerHTML = `${donePercentage}%`;
    root.style.setProperty('--veX-checkedItemsPercentage', `${donePercentage}%`);
  } catch (err) {
    utilAPI.onError(err, "An error occurred while processing the click event.", true);
  }
}

async function onTicketTitleChange(mutation) {
  try {
    veXReset();
    getCurrentTicketInfo(document.head.querySelector('title').innerText);
    if (utilAPI.isEmptyObject(veXCurrentTicketInfo)) {
      return;
    }
    let tempDOD = await chrome.storage.sync.get(veXCurrentTicketInfo.type);
    if (!utilAPI.isEmptyObject(tempDOD)) {
      veXCurrentTicketDOD = tempDOD[veXCurrentTicketInfo.type];
    }
    if (!utilAPI.isEmptyObject(veXCurrentTicketDOD)) {
      initTicketPhaseMutationObserver();
      initCheckedItems();
      veXIsViewInitialised = initView();
    }
  }
  catch (err) {
    utilAPI.onError(err);
  }
}

function onTicketPhaseChange(mutation) {
  try {
    if (!mutation.target) return;
    let newPhase = mutation.target.innerText;
    let reminderMessage = `Before moving to "${newPhase}" phase, please ensure the checklist for current phase is completed.`;
    utilAPI.notify(reminderMessage, "info", true);
    openVexPopup();
  }
  catch (err) {
    utilAPI.onError(err, undefined, true);
  }
}

function OnTicketPhaseClick() {
  // try {
  //   veXPopUpNode.querySelector(".veX_all_phases").classList.toggle("show_all_phases");
  // }
  // catch (err) {
  //   utilAPI.onError(err, undefined, true);
  // }
}

function handleMessagesFromServiceWorker(request, sender, sendResponse) {
  try {
    switch (request) {
      case "openVexPopup":
        if (!(utilAPI.isEmptyObject(veXCurrentTicketDOD) || utilAPI.isEmptyObject(veXCurrentTicketInfo)))
          openVexPopup();
        else if (!utilAPI.isEmptyObject(veXCurrentTicketInfo) && utilAPI.isEmptyObject(veXCurrentTicketDOD)) {
          utilAPI.notify(`Unable to find the checklist for '${veXCurrentTicketInfo.type}'`, "info", true);
        }
        else if (utilAPI.isEmptyObject(veXCurrentTicketInfo))
          utilAPI.notify("To see the checklist, please open a ticket", "info", true)
        else if (veXIsViewInitialised === false) {
          utilAPI.notify("Something went wrong while initializing the view. Please check the logs for more details.", "warning", true)
        }
        else
          utilAPI.notify("Something went wrong", "warning", true);
        break;
    }
  }
  catch (err) {
    utilAPI.onError(err, undefined, true);
  }
}

//<-Event Handlers
veXSetup();
chrome.runtime.onMessage.addListener(handleMessagesFromServiceWorker);