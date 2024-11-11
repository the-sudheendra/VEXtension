//->veX Objects Declarations
var veXDODInfo = {};
var veXCurrentTicketInfo = {};
var veXCurrentTicketDOD = {};
var veXCheckedItems = {};
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
var root = document.querySelector(':root');

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
    <p class="veX_header_title"></p>
</header>
<div class="veX_done_status"></div>
<div class="veX_content_wrapper">
    <div class="veX_sidebar">
        <div class="veX_sidebar_header">
            <div class="veX_ticket_phase">
                <p class="veX_ticket_phase_txt"></p>
                <div class="veX_all_ticket_phase">
                    <div>New</div>
                    <div>In Progress</div>
                    <div>Done</div>
                </div>
            </div>
            <div class="veX_done_percentage">
            </div>
        </div>
        <div class="veX_dod_categories"></div>
    </div>
    <div class="veX_main_content">
        <div class="veX_dod_title"></div>
        <div class="veX_dod_list_container">
            <ul class="veX_dod_list"></ul>
        </div>
    </div>
</div>
<div class="veX_banner veX_footer">
    <button class="veX_common_btn">Leave a Comment</button>
</div>
`;
//<-veX Objects Declarations

//->Initialising Mutation Observers

function initTicketTitleMutationObserver() {
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
  veXPopUpNode.id = "veX-PopUp-Container";
  veXPopUpOverlay.id = "veX-PopUp-Overlay";
  veXPopUpNode.innerHTML = vexDODUI;
  document.body.appendChild(veXPopUpNode);
  document.body.appendChild(veXPopUpOverlay);
  veXPopUpNode.querySelector(".veX_common_btn").addEventListener("click", addDoneListToComments);
  veXPopUpOverlay.addEventListener("click", closeveXPopUp);
  initTicketTitleMutationObserver();
  initVEXNodes();
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
      title: title.slice(ticketArr[0].length + 1),
      phase: getCurrentTicketPhase()
    }
  }
  catch (err) {
    onError(err);
    throw err;
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
  root.style.setProperty('--veX-ticktColor', `#fff`);
}

function initView() {
  try {
    veXHeaderTitleNode.innerText = veXCurrentTicketInfo.title;
    initSidebarView();
    initCheckedItems();
    updateMainContentView(0);
    initStyle();
  }
  catch (err) {
    onError(err, "Error while initiating view");
  }
}

function initStyle() {
  root.style.setProperty('--veX-ticktColor', veXCurrentTicketInfo.color);
}

function initSidebarView() {
  veXDonePercentageNode.innerText = "0%";
  veXTicketPhaseTextNode.innerText = veXCurrentTicketInfo.phase;
  veXTicketPhaseNode.addEventListener('click', OnTicketPhaseClick);
  veXPopUpNode.querySelector(".veX_all_ticket_phase").style.display = "none";
  initCategoriesView();
}

function initCategoriesView() {
  let index = 0;
  let categories = veXCurrentTicketDOD.categories;
  if (!categories && categories.length == 0) {
    throw new Error("No Categories found in this ticket done definition");
  };
  veXDODcategoriesNode.innerHTML = "";
  categories.forEach(
    (category) => {
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

function updateMainContentView(categoryIndex) {
  let currentCategory = veXCurrentTicketDOD.categories[categoryIndex];
  veXCategoryTitleNode.innerText = currentCategory.name;
  veXPopUpNode.querySelectorAll('.veX-Button').forEach((buttonNode) => {
    buttonNode.classList.remove("veX-Active-Button");
  });
  veXSidebarParentNode.querySelector(`[categoryIndex="${categoryIndex}"]`).classList.add("veX-Active-Button");
  updateList(currentCategory.checkList, categoryIndex);
}

function updateList(checkList, categoryIndex) {
  let currentCheckList = veXCheckedItems[categoryIndex];
  veXChecklistParentNode.innerHTML = "";
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
  )
}

function initCheckedItems() {
  veXTotalItems = 0;
  for (let i = 0; i < veXCurrentTicketDOD.categories.length; i++) {
    veXCheckedItems[i] = [];
    let curCategory = veXCurrentTicketDOD.categories[i];
    for (let j = 0; j < curCategory.checkList.length; j++) {
      veXCheckedItems[i][j] = 0;
      veXTotalItems++;
    }
  }
}

function addDoneListToComments() {
  try {
    if (veXTotalCheckedItems == 0) {
      notify("To enable commenting, please mark at least one item as complete");
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
          if (commentSubmitButton) {
            commentSubmitButton.removeAttribute("disabled");
            setTimeout(() => { commentSubmitButton.click(); }, 2000);
          }
        }, 100);
      }, 100);
    }, 100);
  }
  catch (ex) {
    onError(ex, "An exception occurred while trying to open comments in response to a click event", true)
  }
}

function draftCommentForCheckedItems() {
  try {
    let CommentDraftNode = document.createElement('div');
    let CommentHeaderNode = document.createElement("p");
    CommentHeaderNode.innerHTML = "<strong>**Done Checklist**</strong>";
    CommentHeaderNode.style.color = "#22BB33";
    CommentDraftNode.appendChild(CommentHeaderNode);
    for (categoryIndex in veXCheckedItems) {
      let categoryName = veXCurrentTicketDOD.categories[categoryIndex].name;
      let checkList = veXCurrentTicketDOD.categories[categoryIndex].checkList;
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
    onError(ex, "Error while drafting for comments")
  }
}

function isEmptyObject(obj) {
  if (obj) {
    return Object.keys(obj).length === 0;
  }
  return true;
}

function notify(message) {
  alert(message);
}

function onError(error, info = "Something went wrong in veXtension.Check Logs for More Details", display = false) {
  if (display) {
    notify(info);
  }
  console.info("Error From veXtension: " + error);
}

function getCurrentTicketPhase() {
  return document.querySelector("[data-aid='entity-life-cycle-widget-phase']").childNodes[3].innerText;
}
//<-Utility Functions


//->Event Handlers
function closeveXPopUp() {
  veXPopUpOverlay.style.visibility = "hidden";
  veXPopUpNode.classList.remove("veX_pop_active");
}

function openVexDODPopup() {
  veXPopUpOverlay.style.visibility = "visible";
  veXPopUpNode.classList.add("veX_pop_active");
}

function onListItemClick(event) {
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
  veXDonePercentageNode.innerText = `${donePercentage}%`;
  root.style.setProperty('--veX-checkedItemsPercentage', `${donePercentage}%`);
}

async function onTicketTitleChange(mutation) {
  try {
    veXReset();
    getCurrentTicketInfo(document.head.querySelector('title').innerText);
    if (isEmptyObject(veXCurrentTicketInfo)) {
      return;
    }
    let tempDOD = await chrome.storage.sync.get(veXCurrentTicketInfo.type);
    if (!isEmptyObject(tempDOD)) {
      veXCurrentTicketDOD = tempDOD[veXCurrentTicketInfo.type];
    }
    if (!isEmptyObject(veXCurrentTicketDOD)) {
      initTicketPhaseMutationObserver();
      initView();
    }
  }
  catch (ex) {
    onError(ex, "Error at onTicketTitleChange Event Handler");
  }
}

function onTicketPhaseChange(mutation) {
  if (!mutation.target) return;
  let newPhase = mutation.target.innerText;
  let reminderMessage = `Before moving to "${newPhase}" phase, please ensure the checklist for current phase is completed.`;
  veXHeaderTitleNode.innerText = reminderMessage;
  setTimeout(() => {
    veXHeaderTitleNode.innerText = veXCurrentTicketInfo.title;
  }, 5000)
  
  openVexDODPopup();
}

function OnTicketPhaseClick() {
  veXPopUpNode.querySelector(".veX_all_ticket_phase").classList.toggle("show_all_phases");
}

function handleMessagesFromServiceWorker(request, sender, sendResponse) {
  switch (request) {
    case "openVexDODPopup":
      if (!(isEmptyObject(veXCurrentTicketDOD) || isEmptyObject(veXCurrentTicketInfo)))
        openVexDODPopup();
      else if (!isEmptyObject(veXCurrentTicketInfo) && isEmptyObject(veXCurrentTicketDOD)) {
        notify(`Unable to find the Done checklist for '${veXCurrentTicketInfo.type}'`);
      }
      else if (isEmptyObject(veXCurrentTicketInfo))
        notify("To access the 'Done checklist', please open a ticket")
      else
        notify("Something went wrong");
      break;
  }
}


//<-Event Handlers

veXSetup();
chrome.runtime.onMessage.addListener(handleMessagesFromServiceWorker);