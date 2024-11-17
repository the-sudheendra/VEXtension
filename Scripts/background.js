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
}

async function handleMessages(request, sender, sendResponse) {

}

function onContextMenuClick(info, tab) {
  if (info.menuItemId === "veXDoneCheckListMenu") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, "openVexPopup");
    });
  }
}

//**Event Handlers**
chrome.runtime.onInstalled.addListener(onInstalled);
chrome.contextMenus.onClicked.addListener(onContextMenuClick);
chrome.runtime.onMessage.addListener(handleMessages);

