//**Declaration**
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

var veXDODInfo={};
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
      title: 'View Done Checklist',
      documentUrlPatterns: ["https://ot-internal.saas.microfocus.com/*"],
      contexts: ['page']
    }
    );
  });
  await readJsonFile(chrome.runtime.getURL("definitions.json"));
  chrome.storage.sync.set({ veXDoneDefinations: veXDODInfo }, () => { console.info("Successfully Saved definations..") });
}

async function handleMessages(request, sender, sendResponse) {
  switch (request) {
    case 'getveXEntityMetaData':
      sendResponse(veXEntityMetaData);
      break;
    case 'loadveXDefinationsData':
      sendResponse(veXDODInfo);
      break;
  }
}
function onContextMenuClick(info, tab) {
  if (info.menuItemId === "veXDoneCheckListMenu") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, "openVexPopUp");
    });
  }
}
async function getveXDefinations() {
  if (Object.keys(veXDODInfo).length == 0) {
    veXDODInfo = await chrome.storage.sync.get("veXDoneDefinations");
  }
  return veXDODInfo;
}
//**Event Handlers**
chrome.runtime.onInstalled.addListener(onInstalled);
chrome.contextMenus.onClicked.addListener(onContextMenuClick);
chrome.runtime.onMessage.addListener(handleMessages);

