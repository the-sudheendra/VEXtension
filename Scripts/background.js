//**Declaration**
var veXDODInfo = {};
//**Declaration**

//**Utility Functions**
async function readJsonFile(file) {
  await fetch(file).then((response) => response.json().then(function (data) {
    veXDODInfo = data;
  }));
}
//**Utility Functions**

//**Event Handlers**
async function onInstalled() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'veXDoneCheckListMenu',
      title: 'Done Checklist',
      documentUrlPatterns: ["https://ot-internal.saas.microfocus.com/*"],
      contexts: ['page']
    }
    );
  });

  await chrome.storage.sync.clear();
  await readJsonFile(chrome.runtime.getURL("definitions.json"));
  Object.keys(veXDODInfo).forEach(async (ticketEntityName) => {
    let keyValue = {};
    keyValue[ticketEntityName] = veXDODInfo[ticketEntityName];
    await chrome.storage.sync.set(keyValue);
  });
}

async function handleMessages(request, sender, sendResponse) {

}

function onContextMenuClick(info, tab) {
  if (info.menuItemId === "veXDoneCheckListMenu") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, "openVexDODPopup");
    });
  }
}

//**Event Handlers**
chrome.runtime.onInstalled.addListener(onInstalled);
chrome.contextMenus.onClicked.addListener(onContextMenuClick);
chrome.runtime.onMessage.addListener(handleMessages);

