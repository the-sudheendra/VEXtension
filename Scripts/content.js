//Start: Declaration
const veXPopUpId = "veX-PopUp-Container"
const veXPopUpOverlayId = "veX-PopUp-Overlay";
const veXPopUpNode = document.createElement("div");
const veXPopUpOverlay = document.createElement("div");
const titleNode = document.head.querySelector('title');
var isveXPopOpen = false;
var veXMutationObservers = {};
var veXMutationObserversConfig = {};
veXPopUpNode.id = veXPopUpId;
var dodData;
var dod;
//End: Declaration



//Start: UI for POP to show defination of dones
var veXPopUI = `
<header class="veX_header veX_banner">
   <p class="veX_header_tickedId"></p>
   <p class="veX_header_tickedName"></p>
</header>
<div class="veX_content-wrapper">
   <div class="veX_sidebar">
   </div>
   <div class="veX_main-content">
      <div class="veX_dod_title"></div>
      <div class="veX_dod_labels_container">
        <span class="veX_label"></span>
      </div>
      <div class="veX_dod_desc">Desciption</div>
      <div class="veX_dod_list_container">
         <ul class="veX_dod_list">
         </ul>
      </div>
   </div>
</div>
<div class="veX_banner veX_footer">
   <button class="veX_normal_btn">Leave a Comment</button>
   <button class="veX_close"></button>
</div>
`;
//End: UI for POP to show defination of dones

//Start: Initialising configured Observer
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

//End: Initialising configured Observer

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
        onTitleChange();
      }
    }
  }
}

function readTextFile(file, callback) {
  var rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("GET", file, true);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4 && rawFile.status == "200") {
      callback(rawFile.responseText);
    }
  }
  rawFile.send(null);
}

function setIcons() {
  document.querySelector(".veX_close").style.backgroundImage = `url('${chrome.runtime.getURL('Icons/close_42.png')}')`;
}

function conciseText(text) {
  if (text.length <= 80) return text;
  return text.slice(0, 80) + "...";
}

function isThisVETicket() {
  document.querySelector("[title='Global ID - This ID is unique across all Octane workspaces managed by the Software Factory']") ? true : false;
}

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

function getVETicketInfo(title) {
  ticketArr = title.split(" ");
  if (ticketArr.length >= 2) {
    const match = ticketArr[0].match(/^([a-zA-Z]+)(\d+)$/);
    if (match) {
      return {
        ticketType: getExpandedTicketType(match[1]),
        ticketID: match[2],
        ticketTitle: title.slice(ticketArr[0].length + 1)
      };
    } else {
      return null;
    }
  }
  else
    return null;
}

function getExpandedTicketType(ticketType) {
  switch (ticketType) {
    case 'US':
      return 'userstory';
    default: return 'ticket';
  }
}

function setHeaderTextForPopUp(ticketInfo) {
  if (veXPopUpNode) {
    veXPopUpNode.querySelector(".veX_header_tickedId").innerText = ticketInfo.ticketID;
    veXPopUpNode.querySelector(".veX_header_tickedName").innerText = conciseText(ticketInfo.ticketTitle);
  }
}

function addToComments() {
  document.querySelectorAll(".mqm-new-comment-div")[0].childNodes[2].click();
  document.querySelectorAll(".mqm-new-comment-div")[0].childNodes[2].click();
  document.querySelectorAll(".fr-wrapper")[2].childNodes[0].innerHTML = '<h1>hi<h1>'
  document.querySelectorAll('ng-click="comments.onAddNewCommentClicked()"');
}

function updateView(ticketInfo) {
  try
  {
    if (!dodData) return;
    if (!ticketInfo.ticketType && !dodData[ticketInfo.ticketType]) {
      dod = dodData;
      return;
    }
    setHeaderTextForPopUp(ticketInfo);
    let titleNode = veXPopUpNode.querySelector('.veX_dod_title');
    let descNode = veXPopUpNode.querySelector('.veX_dod_desc');
    let sidebarNode = veXPopUpNode.querySelector('.veX_sidebar');
    let listNode = veXPopUpNode.querySelector('.veX_dod_list');
    dod = dodData[ticketInfo.ticketType];
    if(dod)
    {
      titleNode.innerHTML = dod.title;
      descNode.innerHTML = dod.desc;
      updateCategories(sidebarNode,listNode, dod["categories"]);
    }
  }
  catch(ex)
  {
    console.error("Failed to update the view");
  }
  
}

function updateCategories(sidebarNode,listNode,categories) {
  categories.forEach(
    (category) => {
      let sideBarItem = document.createElement('div');
      sidebarNode.appendChild(listItem);
      sideBarItem.textContent = category.name;
      categories.checkList.forEach(
        (list)=>{
          let listItem = document.createElement('li');
          listItem.textContent=list;
          listNode.appendChild(listItem)
        }
      )
    }
  );
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

function onTitleChange() {
  let newTitle = document.head.querySelector('title').innerText;
  let ticketInfo = getVETicketInfo(newTitle);
  if (ticketInfo) {
    //TODO
    //enableVEXButton();

    updateView(ticketInfo.ticketType);
  }
  else {
    //TODO 
    //disableVEXButton();
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
//**Event Handlers**

readTextFile(chrome.runtime.getURL("definitions.json"), function (text) {
  var dodData = JSON.parse(text);
});
veXPopUpNode.innerHTML = veXPopUI;
document.body.appendChild(veXPopUpNode);
document.body.appendChild(veXPopUpOverlay);
veXPopUpOverlay.id = veXPopUpOverlayId;
veXPopUpOverlay.addEventListener("click", closeveXPopUp);
document.querySelector(".veX_close").addEventListener('click', closeveXPopUp);
setIcons();
addClickEventForSideBarTab();
initMutationObservers();
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.openVEXPop) {
//     openVexPopUp();
//     console.log("Service worker received message from sender %s", sender.id, request);
//   }
// });
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.type === "FROM_VEX_SERVICE_WORKER") {

      if (request.payload && request.payload.openVexPopUp) {
        openVexPopUp();
      }

      sendResponse({ message: "Message received in content script!" });

      // You can also send a new message back to service worker
      chrome.runtime.sendMessage({
        type: "FROM_CONTENT_SCRIPT",
        payload: "Hello from content script!"
      }, function (response) {
        console.log("Response from service worker:", response);
      });
    }
    // Return true to indicate you want to send a response asynchronously
    return true;
  }
);