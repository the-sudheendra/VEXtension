//**Declaration**
var veXMutationObservers = {};
var veXMutationObserversConfig = {};
var veXDODInfo = {};
var veXCurrentTicketInfo = {};
var veXCurrentTicketDOD = {};
var veXCheckedItems = {};
var veXTotalCheckedItems = 0;
var veXTotalItems = 0;
var veXPopUpNode = document.createElement("div");
var veXPopUpOverlay = document.createElement("div");
var root = document.querySelector(':root');
var veXCategoryTitleNode;//veXPopUpNode.querySelector('.veX_dod_title')
var veXsidebarParentNode;//veXPopUpNode.querySelector('.veX_sidebar')
var veXChecklistParentNode;//veXPopUpNode.querySelector('.veX_dod_list')
var veXHeaderTitleNode;// veXPopUpNode.querySelector(".veX_header_title")
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
    </div>
    <div class="veX_main_content">
        <div class="veX_dod_title"></div>
        <div class="veX_dod_list_container">
            <ul class="veX_dod_list">
            </ul>
        </div>
    </div>
</div>
<div class="veX_banner veX_footer">
    <button class="veX_normal_btn">Leave a Comment</button>
</div>
`;
//**Declaration**


//**Initialising configured Observer**
function initMutationObservers() {
  Object.keys(veXMutationObserversConfig).forEach(
    key => {
      let mutationParams = veXMutationObserversConfig[key];
      if (mutationParams) {
        let mutationObserver = new MutationObserver(mutationParams.callback);
        if (mutationParams.targetNode && mutationParams.options)
          mutationObserver.observe(mutationParams.targetNode, mutationParams.options);
        veXMutationObservers[mutationParams.id] = mutationObserver;
      }
    }
  );
}
//**Initialising configured Observer**


//**Utility Functions**
veXMutationObserversConfig =
{
  titleObserver:
  {
    id: "title",
    targetNode: document.head.querySelector('title'),
    options: { attributes: true, childList: true, subtree: true },
    callback: (mutationList, observer) => {
      for (const mutation of mutationList) {
        onTicketChange();
      }
    }
  }
}

//Common Error Handler 
function onError(error, info = "Something went wrong in veXtension.Check Logs for More Details", display = false) {
  if (display) {
    notify(info);
  }
  console.info("Error From veXtension: " + error);
}

function conciseText(text) {
  if (text.length <= 150) return text;
  return text.slice(0, 150) + "...";
}

//Function to identify GlobalId

// function isThisVETicket() {
//   document.querySelector("[title='Global ID - This ID is unique across all Octane workspaces managed by the Software Factory']") ? true : false;
// }

function addDoneListToComments() {
  try {
    if (veXTotalCheckedItems == 0) {
      notify("Please select at least one item to add comments.");
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

function getCurrentTicketInfo(title) {
  if (!title) return;
  ticketArr = title.split(" ");
  if (ticketArr.length < 2) return;
  const match = ticketArr[0].match(/^([a-zA-Z]+)(\d+)$/);
  if (match.length == 0) return;
  let ticketType = (document.querySelector('[ng-if="header.shouldShowEntityLabel"]').innerText).toUpperCase();
  veXCurrentTicketInfo =
  {
    type: veXEntityMetaData[ticketType].name,
    id: match[2],
    color: veXEntityMetaData[ticketType].colorHex,
    title: title.slice(ticketArr[0].length + 1)
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

function setup() {
  veXPopUpNode.id = "veX-PopUp-Container";
  veXPopUpOverlay.id = "veX-PopUp-Overlay";
  veXPopUpNode.innerHTML = vexDODUI;
  document.body.appendChild(veXPopUpNode);
  document.body.appendChild(veXPopUpOverlay);
  veXPopUpNode.querySelector(".veX_normal_btn").addEventListener("click", addDoneListToComments);
  veXPopUpOverlay.addEventListener("click", closeveXPopUp);
  initMutationObservers();
  veXCategoryTitleNode = veXPopUpNode.querySelector('.veX_dod_title');
  veXsidebarParentNode=veXPopUpNode.querySelector('.veX_sidebar');
  veXChecklistParentNode=veXPopUpNode.querySelector('.veX_dod_list');
  veXHeaderTitleNode=veXPopUpNode.querySelector(".veX_header_title");
}

function initView() {
  try {
    veXHeaderTitleNode.innerText = conciseText(veXCurrentTicketInfo.title);
    initSidebarView(veXCurrentTicketDOD.categories);
    initCheckedItems();
    updateMainContentView(0);
    initStyle();
  }
  catch (err) {
    onError(err, "Error while initiating view");
  }
}

function initSidebarView(categories) {
  veXsidebarParentNode.innerHTML = "";
  let index = 0;
  categories.forEach(
    (category) => {
      let sideBarItemNode = document.createElement('button');
      sideBarItemNode.className = "veX-Button";
      sideBarItemNode.setAttribute('categoryIndex', index);
      sideBarItemNode.addEventListener('click', (event) => {
        updateMainContentView(event.target.getAttribute('categoryIndex'));
      });
      veXsidebarParentNode.appendChild(sideBarItemNode);
      veXsidebarParentNode.appendChild(sideBarItemNode);
      sideBarItemNode.textContent = category.name;
      index++;
    }
  );
}

function initCheckedItems() {
  veXTotalItems=0;
  for (let i = 0; i < veXCurrentTicketDOD.categories.length; i++) {
    veXCheckedItems[i] = [];
    let curCategory = veXCurrentTicketDOD.categories[i];
    for (let j = 0; j < curCategory.checkList.length; j++) {
      veXCheckedItems[i][j] = 0;
      veXTotalItems++;
    }
  }
}

function updateMainContentView(categoryIndex) {
  let currentCategory = veXCurrentTicketDOD.categories[categoryIndex];
  veXCategoryTitleNode.innerText = currentCategory.name;
  veXPopUpNode.querySelectorAll('.veX-Button').forEach((buttonNode) => {
    buttonNode.classList.remove("veX-Active-Button");
  });
  veXsidebarParentNode.querySelector(`[categoryIndex="${categoryIndex}"]`).classList.add("veX-Active-Button");
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

function initStyle() {
  root.style.setProperty('--veX-ticktColor', veXCurrentTicketInfo.color);
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
//**Utility Functions**


//**Event Handlers**
function closeveXPopUp() {
  veXPopUpOverlay.style.visibility = "hidden";
  veXPopUpNode.style.visibility = 'hidden';
}

function openVexDODPopup() {
  veXPopUpOverlay.style.visibility = "visible";
  veXPopUpNode.style.visibility = "visible";
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
  root.style.setProperty('--veX-checkedItemsPercentage', `${((veXTotalCheckedItems / veXTotalItems) * 100)}%`);
}

async function onTicketChange() {
  try {
    let newTitle = document.head.querySelector('title').innerText;
    reset();
    getCurrentTicketInfo(newTitle);
    if (isEmptyObject(veXCurrentTicketInfo)) return;
    let tempDOD = await chrome.storage.sync.get(veXCurrentTicketInfo.type);
    if (!isEmptyObject(tempDOD)) {
      veXCurrentTicketDOD = tempDOD[veXCurrentTicketInfo.type];
    }
    if (!isEmptyObject(veXCurrentTicketDOD)) {
      initView();
    }
  }
  catch (ex) {
    onError(ex, "Error at OnTicketChange Event Handler");
  }
}

function handleMessagesFromServiceWorker(request, sender, sendResponse) {
  switch (request) {
    case "openVexDODPopup":
      if (!(isEmptyObject(veXCurrentTicketDOD) || isEmptyObject(veXCurrentTicketInfo)))
        openVexDODPopup();
      else if (!isEmptyObject(veXCurrentTicketInfo) && isEmptyObject(veXCurrentTicketDOD)) {
        notify(`Unable to find the Done Definition for '${veXCurrentTicketInfo.type}'`);
      }
      else if (isEmptyObject(veXCurrentTicketInfo))
        notify("Please open a VE ticket to see the Done checklist")
      else
        notify("Something went wrong");
      break;
  }
}

function reset() {
  veXCheckedItems = {};
  veXCurrentTicketDOD = {};
  veXCurrentTicketInfo = {};
  veXTotalCheckedItems = 0;
  veXTotalItems = 0;
  root.style.setProperty('--veX-checkedItemsPercentage', `0%`);
  root.style.setProperty('--veX-ticktColor', `#fff`);
}

//**Event Handlers**
setup();
chrome.runtime.onMessage.addListener(handleMessagesFromServiceWorker);