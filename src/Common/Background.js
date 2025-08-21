import {veXDefaultChecklist,veXDefaultPrompts,veXDefaultPromptsTone}  from './DefaultList.js';
import alarmManager from '../ChromeAlarmAPI/ChromeAlarmAPI.js';
const defaultCheklistRemoteURL= "https://the-sudheendra.github.io/VEXHub/Checklist/DefaultChecklist.json";
const defaultPromptsRemoteURL= "https://the-sudheendra.github.io/VEXHub/AviatorPrompts/DefaultPrompts.json";
const defaultPromptsTonesURL="https://the-sudheendra.github.io/VEXHub/AviatorPromptsTones/DefaultPromptsTone.json";
async function onInstalled() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'veXChecklist',
      title: '✅ Checklist (Alt+C)',
      documentUrlPatterns: ["https://*.saas.microfocus.com/*"],
      contexts: ['page']
    }
    );
    chrome.contextMenus.create({
      id: 'veXAviatorPrompts',
      title: '✨ Aviator Prompts (Alt+A)',
      documentUrlPatterns: ["https://*.saas.microfocus.com/*"],
      contexts: ['page']
    }
    );
     chrome.contextMenus.create({
      id: 'veXReminders',
      title: '🔔 Reminders (Alt+R)',
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
  try {
    if (request?.action === 'createReminder') {
      const { message, when, repeat } = request.payload || {};
      const name = `vex_reminder_${Date.now()}`;
      // Save message
      const remindersKey = 'veXReminders';
      const existingStore = await chrome.storage.local.get(remindersKey) || {};
      const store = existingStore[remindersKey] || {};
      store[name] = { message, when, repeat };
      await chrome.storage.local.set({ [remindersKey]: store });

      // schedule
      if (repeat === 'none') {
        await alarmManager.setAlarm(name, { when });
      } else if (repeat === 'daily') {
        await alarmManager.setAlarm(name, { when, periodInMinutes: 60 * 24 });
      } else if (repeat === 'weekly') {
        await alarmManager.setAlarm(name, { when, periodInMinutes: 60 * 24 * 7 });
      } else if (repeat === 'monthly') {
        await alarmManager.setAlarm(name, { when, periodInMinutes: 60 * 24 * 30 });
      } else {
        await alarmManager.setAlarm(name, { when });
      }
      sendResponse({ ok: true, name });
      return true;
    }
  } catch (err) {
    console.error('createReminder failed', err);
    sendResponse({ ok: false, error: err?.message || 'Unknown error' });
  }
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
  else if (info.menuItemId === "veXReminders") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, "openRemindersPopup").catch((err) => {
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
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const maybePromise = handleMessages(request, sender, sendResponse);
  // Indicate async response when returning a Promise
  return !!maybePromise;
});

// When alarms fire, notify the active tab 
chrome.alarms.onAlarm.addListener(async (alarm) => {
  try {
    const remindersKey = 'veXReminders';
    const data = await chrome.storage.local.get(remindersKey);
    const info = data?.[remindersKey]?.[alarm.name];
    const message = info?.message || 'Reminder';
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs && tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'reminderFired', payload: { message } }).catch(() => {});
      }
    });
  } catch (e) {
    console.error('Failed to handle onAlarm', e);
  }
});

// Listen for keyboard shortcut commands
chrome.commands && chrome.commands.onCommand && chrome.commands.onCommand.addListener(function(command) {
  if (command === "openChecklistPopup") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, "openChecklistPopup").catch((err) => {
        console.error(err, "It seems the extension was refreshed. Please refresh the current ValueEdge tab and try again.");
      });
    });
  } else if (command === "openPromptsPopup") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, "openPromptsPopup").catch((err) => {
        console.error(err, "It seems the extension was refreshed. Please refresh the current ValueEdge tab and try again.");
      });
    });
  }
});

