//**Declaration**
var veXDODInfo = {};
//**Declaration**

//**Utility Functions**
async function readJsonFile(file) {
  try {
    await fetch(file).then((response) => response.json().then(function (data) {
      veXDODInfo = data;
    }));
  }
  catch (ex) {
    onError(ex, "Error while reading definitions.json")
  }
}
function isEmptyObject(obj) {
  return obj == null || (typeof obj === 'object' && Object.keys(obj).length === 0)
}

function isEmptyArray(arr) {
  return !Array.isArray(arr) || arr.length === 0;
}
function notify(message, display = false) {
  let _message = `Message from veXtension:${message}`;
  if (display == true) {
    alert(message)
  }
  else {
    console.info(_message);
  }
}

function onError(error, info = "Something went wrong in veXtension.Check Logs for More Details", display = false) {
  notify(info, display);
  console.dir(error);
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
  if (isEmptyObject(veXDODInfo)) return;
  Object.keys(veXDODInfo).forEach(async (ticketEntityName) => {
    let keyValue = {};
    if (isEmptyObject(veXDODInfo[ticketEntityName]))
      return;
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

