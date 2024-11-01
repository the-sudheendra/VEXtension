//**Declaration**
var veXMutationObservers = {};
var veXMutationObserversConfig = {};
var veXDODInfo = {};
var veXEntityMetaData = {};
var veXCurrentTicketInfo = {};
var veXCurrentTicketDOD = {};
var veXCheckedItems = {};
var veXPopUpNode = document.createElement("div");
var veXPopUpOverlay = document.createElement("div");
var veXPopUI = `
<header class="veX_header veX_banner">
    <p class="veX_header_title"></p>
</header>
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
  Object.keys(this.veXMutationObserversConfig).forEach(
    key => {
      let mutationParams = this.veXMutationObserversConfig[key];
      if (mutationParams) {
        let mutationObserver = new MutationObserver(mutationParams.callback);
        if (mutationParams.targetNode && mutationParams.options)
          mutationObserver.observe(mutationParams.targetNode, mutationParams.options);
        this.veXMutationObservers[mutationParams.id] = mutationObserver;
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

function onError(error, info) {
  this.veXCurrentTicketDOD = {};
  this.veXCurrentTicketInfo = {};
  console.error(`Error from 'VE Xtension'\n${info}\nError: ` + error);
}

function conciseText(text) {
  if (text.length <= 150) return text;
  return text.slice(0, 150) + "...";
}

// function isThisVETicket() {
//   document.querySelector("[title='Global ID - This ID is unique across all Octane workspaces managed by the Software Factory']") ? true : false;
// }

function addDoneListToComments() {
  try {
    document.querySelectorAll(".mqm-new-comment-div")[0].childNodes[2].click();
    document.querySelectorAll(".mqm-new-comment-div")[0].childNodes[2].click();
    document.querySelectorAll(".fr-wrapper")[2].childNodes[0].innerHTML = '<h1>hi<h1>'
    document.querySelectorAll('ng-click="comments.onAddNewCommentClicked()"');
  }
  catch (ex) {
    console.error("Exception occured: " + ex);
  }
}

function getCurrentTicketInfo(title) {
  if (!title) return;
  ticketArr = title.split(" ");
  if (ticketArr.length >= 2) {
    const match = ticketArr[0].match(/^([a-zA-Z]+)(\d+)$/);
    if (match) {
      let ticketType = (document.querySelector('[ng-if="header.shouldShowEntityLabel"]').innerText).toUpperCase();
      this.veXCurrentTicketInfo =
      {
        type: veXEntityMetaData[ticketType].name,
        id: match[2],
        color: veXEntityMetaData[ticketType].colorHex,
        title: title.slice(ticketArr[0].length + 1)
      }
    }
    else {
      this.veXCurrentTicketInfo = {};
    }
  }
  else {
    this.veXCurrentTicketInfo = {};
  }
}

function setup() {
  this.veXPopUpNode.id = "veX-PopUp-Container";
  this.veXPopUpOverlay.id = "veX-PopUp-Overlay";
  this.veXPopUpNode.innerHTML = veXPopUI;
  document.body.appendChild(veXPopUpNode);
  document.body.appendChild(veXPopUpOverlay);
  veXPopUpOverlay.addEventListener("click", closeveXPopUp);
}

function addToComments() {
  document.querySelectorAll(".mqm-new-comment-div")[0].childNodes[2].click();
  document.querySelectorAll(".mqm-new-comment-div")[0].childNodes[2].click();
  document.querySelectorAll(".fr-wrapper")[2].childNodes[0].innerHTML = '<h1>hi<h1>'
  document.querySelectorAll('ng-click="comments.onAddNewCommentClicked()"');
}

function initView() {
  try {
    this.veXPopUpNode.querySelector(".veX_header_title").innerText = conciseText(this.veXCurrentTicketInfo.title);
    initSidebarView(this.veXCurrentTicketDOD.categories);
    initCheckedItems();
    updateMainContentView(0);
    initStyle();
  }
  catch (err) {
    onError(err, "error while initiating view");
  }
}


function initSidebarView(categories) {
  let sidebarParentNode = veXPopUpNode.querySelector('.veX_sidebar');
  sidebarParentNode.innerHTML = "";
  let index = 0;
  categories.forEach(
    (category) => {
      let sideBarItemNode = document.createElement('button');
      sideBarItemNode.className = "veX-Button";
      sideBarItemNode.setAttribute('categoryIndex', index);
      sideBarItemNode.addEventListener('click', (event) => {
        updateMainContentView(event.target.getAttribute('categoryIndex'));
      });
      sidebarParentNode.appendChild(sideBarItemNode);
      sidebarParentNode.appendChild(sideBarItemNode);
      sideBarItemNode.textContent = category.name;
      index++;
    }

  );

}
function initCheckedItems()
{
  for(let i=0;i<this.veXCurrentTicketDOD.categories.length;i++)
  {
    this.veXCheckedItems[i]=[];
    let curCategory=this.veXCurrentTicketDOD.categories[i];
    for(let j=0;j<curCategory.checkList.length;j++)
    {
      this.veXCheckedItems[i][j]=0;
    }
  }
}
function updateMainContentView(categoryIndex) {
  let currentCategory = this.veXCurrentTicketDOD.categories[categoryIndex];
  let titleNode = veXPopUpNode.querySelector('.veX_dod_title');
  titleNode.innerText = currentCategory.name;

  veXPopUpNode.querySelectorAll('.veX-Button').forEach((buttonNode)=>{
    buttonNode.classList.remove("veX-Active-Button");
  });
  veXPopUpNode.querySelector('.veX_sidebar').querySelector(`[categoryIndex="${categoryIndex}"]`).classList.add("veX-Active-Button");
  updateList(currentCategory.checkList, categoryIndex);
}

function updateList(checkList, categoryIndex) {
  let currentCheckList = this.veXCheckedItems[categoryIndex];
  let listParentNode = veXPopUpNode.querySelector('.veX_dod_list');
  listParentNode.innerHTML = "";
  let index = 0;
  checkList.forEach(
    (itemValue) => {
      let listItem = document.createElement('li');
      listItem.setAttribute('listIndex', index);
      listItem.setAttribute('categoryIndex', categoryIndex);
      listItem.addEventListener('click', onListItemClick);
      listItem.textContent = itemValue;
      listParentNode.appendChild(listItem);
      if (currentCheckList[index] == 1) {
        listItem.classList.add('checked');
      }
      index++;
    }
  )
}

function initStyle() {
  let root = document.querySelector(':root');
  root.style.setProperty('--veX-ticktColor', veXCurrentTicketInfo.color);
  //veXPopUpNode.querySelector(".veX_header").style.backgroundColor = this.veXCurrentTicketInfo.color;
  //veXPopUpNode.querySelector(".veX_normal_btn").style.backgroundColor = this.veXCurrentTicketInfo.color;
  //veXPopUpNode.querySelector(".veX_header_title").style.color = "white";
  //veXPopUpNode.style.border = "2px solid " + this.veXCurrentTicketInfo.color;
  //veXPopUpNode.querySelector(".veX-Button").style=""
}
function isEmptyObject(obj) {
  if (obj) {
    return Object.keys(obj).length === 0;
  }
  return true;
}

function notify(message) {
  console.info(message);
}
//**Utility Functions**


//**Event Handlers**
function closeveXPopUp() {
  veXPopUpOverlay.style.visibility = "hidden";
  veXPopUpNode.style.visibility = 'hidden';
  veXPopUpNode.classList.remove("veX_pop_active");
}

function openVexPopUp() {
  veXPopUpOverlay.style.visibility = "visible";
  veXPopUpNode.style.visibility = "visible";
  veXPopUpNode.classList.add(".veX_pop_active")

}
function onListItemClick(event) {
  let catIndex = event.target.getAttribute('categoryIndex')
  let listIndex = event.target.getAttribute('listIndex')
  event.target.classList.toggle('checked');
  if (event.target.classList.contains('checked')) {
      veXCheckedItems[catIndex][listIndex]=1;
  }
  else
  {
   veXCheckedItems[catIndex][listIndex]=0;
  }
}

function onTicketChange() {
  try {
    if (isEmptyObject(this.veXDODInfo) && isEmptyObject(this.veXEntityMetaData)) return;
    let newTitle = document.head.querySelector('title').innerText;
    getCurrentTicketInfo(newTitle);
    if (!isEmptyObject(this.veXCurrentTicketInfo)) {
      this.veXCurrentTicketDOD = veXDODInfo[veXCurrentTicketInfo.type];
      if (!isEmptyObject(this.veXCurrentTicketDOD)) {
        initView();
      }
      else {
        notify("Unable to find the current ticket information in the definitions. Please update it.");
      }
    }
    else {
      //TODO 
      //disableVEXButton();
      reset();
    }
  }
  catch (ex) {
    onError(ex, "error at OnTicketChange Handler");

  }
}

function addClickEventForSideBarTab() {
  let sideBar = document.querySelector('.veX_sidebar');
  let tabs = sideBar.children;
  Array.from(tabs).forEach(tab => {
    tab.addEventListener('click',
      () => {
        // showTab(tab.name);
      }
    );
  });
}
function handleMessage(request, sender, sendResponse) {
  switch (request) {
    case "openVexPopUp":
      if (!isEmptyObject(this.veXCurrentTicketDOD) && !isEmptyObject(this.veXCurrentTicketInfo))
        openVexPopUp();
      break;
  }
  return true;
}
function reset()
{
  veXCheckedItems={};
  veXCurrentTicketDOD={};
  veXCurrentTicketInfo={};
}
//**Event Handlers**
(async () => {
  if (isEmptyObject(veXEntityMetaData)) {
    veXEntityMetaData = await chrome.runtime.sendMessage('getveXEntityMetaData');
  }
})();

(async () => {
  if (isEmptyObject(veXDODInfo)) {
    veXDODInfo = await chrome.runtime.sendMessage('loadveXDefinationsData');
  }
})();

setup();
initMutationObservers();
chrome.runtime.onMessage.addListener(handleMessage);