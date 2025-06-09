import {veXDefaultChecklist,veXDefaultPrompts,veXDefaultPromptsTone}  from './DefaultList.js';
const defaultCheklistRemoteURL= "https://the-sudheendra.github.io/VEXHub/Checklist/DefaultChecklist.json";
const defaultPromptsRemoteURL= "https://the-sudheendra.github.io/VEXHub/AviatorPrompts/DefaultPrompts.json";
const defaultPromptsTonesURL="https://the-sudheendra.github.io/VEXHub/AviatorPromptsTones/DefaultPromptsTone.json";
async function onInstalled() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'veXChecklist',
      title: '✅ Checklist',
      documentUrlPatterns: ["https://*.saas.microfocus.com/*"],
      contexts: ['page']
    }
    );
    chrome.contextMenus.create({
      id: 'veXAviatorPrompts',
      title: '✨ Aviator Prompts',
      documentUrlPatterns: ["https://*.saas.microfocus.com/*"],
      contexts: ['page']
    }
    );
  });
  chrome.storage.local.get('veXChecklistData', (result) => {
    if(isEmptyObject(result))
    setDefaultChecklist();
  });
  chrome.storage.local.get('veXPromptsData', (result) => {
    if(isEmptyObject(result))
    setDefaultPrompts();
  });
  
}

async function setDefaultChecklist()
{
  let checklistData = {};
  checklistData["checklist"] = await getDefaultChecklist();
  checklistData["veXChecklistRemoteUrl"] = defaultCheklistRemoteURL;
  checklistData["veXLoadOnStart"] = false;
  await chrome.storage.local.set({ veXChecklistData: checklistData });
}

async function setDefaultPrompts()
{
  let promptsData = {};
  promptsData["prompts"] = await getDefaultPrompts();
  promptsData["veXPromptsRemoteUrl"] = defaultPromptsRemoteURL;
  chrome.storage.local.set({ veXPromptsData: promptsData });
}
async function handleMessages(request, sender, sendResponse) {

}

function onContextMenuClick(info, tab) {
  if (info.menuItemId === "veXChecklist") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, "openChecklistPopup").catch((err) => {
        console.error(err, "It seems the extension was refreshed. Please refresh the current ValueEdge tab and try again.");
      })
    });
  } else if (info.menuItemId === "veXAviatorPrompts") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, "openPromptsPopup").catch((err) => {
        console.error(err, "It seems the extension was refreshed. Please refresh the current ValueEdge tab and try again.");
      })
    });
  }
}
async function getDefaultChecklist() {
  try {
    
    const response = await fetch(`${defaultCheklistRemoteURL}?ts=${Date.now()}`);
    if (!response.ok) throw new Error('Failed to fetch');
    const json = await response.json();
    return json || veXDefaultChecklist || {};
  } catch (err) {
    console.warn('Using fallback checklist due to fetch error:', err);
    return veXDefaultChecklist || {};
  }
}

async function getPromptsTone() {
  try {
    
    const response = await fetch(`${defaultPromptsTonesURL}?ts=${Date.now()}`);
    if (!response.ok) throw new Error('Failed to fetch prompts tone');
    
    const json = await response.json();
    return json || veXDefaultPromptsTone || {};
  } catch (err) {
    console.warn('Using fallback prompts tone due to fetch error:', err);
    return veXDefaultPromptsTone || {};
  }
}
async function getDefaultPrompts() {
  try {
    
    const response = await fetch(`${defaultPromptsRemoteURL}?ts=${Date.now()}`);
    if (!response.ok) throw new Error('Failed to fetch prompts');

    const json = await response.json();
    return json || veXDefaultPrompts || [];
  } catch (err) {
    console.warn('Using fallback prompts due to fetch error:', err);
    return veXDefaultPrompts || [];
  }
}
function isEmptyObject(obj) {
  return obj == null || (typeof obj === 'object' && Object.keys(obj).length === 0)
}

//**Event Handlers**
chrome.runtime.onInstalled.addListener(onInstalled);
chrome.contextMenus.onClicked.addListener(onContextMenuClick);
chrome.runtime.onMessage.addListener(handleMessages);

