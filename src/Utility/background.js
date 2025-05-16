async function onInstalled() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'veXDoneCheckListMenu',
      title: '✅ Checklist',
      documentUrlPatterns: ["https://*.saas.microfocus.com/*"],
      contexts: ['page']
    }
    );
    chrome.contextMenus.create({
      id: 'sendToAviatorMenu',
      title: '✨ Aviator Prompts',
      documentUrlPatterns: ["https://*.saas.microfocus.com/*"],
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
      chrome.tabs.sendMessage(tabs[0].id, "openVexPopup").catch((err) => {
        console.error(err, "It seems the extension was refreshed. Please refresh the current ValueEdge tab and try again.");
      })
    });
  } else if (info.menuItemId === "sendToAviatorMenu") {
    console.log("Send to Aviator menu item clicked");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, "sendToAviator");
    });
  }
}

//**Event Handlers**
chrome.runtime.onInstalled.addListener(onInstalled);
chrome.contextMenus.onClicked.addListener(onContextMenuClick);
chrome.runtime.onMessage.addListener(handleMessages);

