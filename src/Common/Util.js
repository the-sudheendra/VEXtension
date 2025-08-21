var notifyAPI;
var DefaultList;
(async () => {
  const notifyUrl = await chrome.runtime.getURL("src/Notification/Notification.js");
  notifyAPI = await import(notifyUrl);
  let URL = chrome.runtime.getURL("src/Common/DefaultList.js");
  if (!DefaultList) {
    DefaultList = await import(URL);
  }
})();

function isEmptyObject(obj) {
  return obj == null || (typeof obj === 'object' && Object.keys(obj).length === 0)
}

function isEmptyArray(arr) {
  return !Array.isArray(arr) || arr.length === 0;
}

function notify(message, type = Constants.NotificationType.Info, display = false) {
  if (display == true) {
    notifyAPI.openToastNode(type, message);
    return;
  }
  console.info(message);
}
function waitForElementToBeVisible(element) {
  return new Promise((resolve, reject) => {
    const checkVisibility = () => {
      if (element && element.offsetParent !== null) {
        resolve(true);
        return;
      }
      setTimeout(checkVisibility, 100);
    };
    checkVisibility();
  });
}

function onError(error, info = "Something went wrong", display = false) {
  console.error(`Error From VE-Checklist: ${error?.message}`);
  console.dir(error);
  notify(`${info}`, Constants.NotificationType.Error, display);
}
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function getChecklistStatus(item) {
  let status = item.CursorState.position;
  switch (status) {
    case 0:
      return Constants.CheckListStatus.NotSelected;
    case 1:
      return Constants.CheckListStatus.Completed;
    case 2:
      return Constants.CheckListStatus.NotCompleted;
    case 3:
      return Constants.CheckListStatus.NotApplicable;
  }
}

function formatMessage(message, ...params) {
  let output = "";
  try {
    if (!message) return "";
    params.forEach((param, index) => {
      let token = "$" + index;
      message = message.replace(token, param);
    });
  } catch (e) {
    output = message;
  }
  return message;
}

function getRandomMessage(notification) {
  return notification[Math.floor(Math.random() * notification.length)];
}





async function saveChecklistData(veXChecklistInfo, veXChecklistRemoteUrl, loadOnStart) {
  try {
    let keyValue = {};
    let entites = Object.keys(veXChecklistInfo);
    for (let i = 0; i < entites.length; i++) {
      let ticketEntityName = entites[i];

      if (isEmptyObject(veXChecklistInfo[ticketEntityName]))
        return false;
      keyValue[ticketEntityName] = veXChecklistInfo[ticketEntityName];
    }
    let checklistData = await chrome.storage.local.get("veXChecklistData") || {};
    checklistData["checklist"] = keyValue;
    if (veXChecklistRemoteUrl)
      checklistData["veXChecklistRemoteUrl"] = veXChecklistRemoteUrl;
    checklistData["veXLoadOnStart"] = (loadOnStart === true ? true : false);
    await chrome.storage.local.set({ veXChecklistData: checklistData });
    return true;
  }
  catch (err) {
    onError(err, err.message, true);
    return false;
  }
}

async function savePromtsData(prompts, veXPromptsRemoteUrl) {
  try {
    let promptsData = await chrome.storage.local.get("veXPromptsData") || {};
    promptsData["prompts"] = prompts;
    if (veXPromptsRemoteUrl) promptsData["veXPromptsRemoteUrl"] = veXPromptsRemoteUrl;
    chrome.storage.local.set({ veXPromptsData: promptsData });
    return true;
  }
  catch (err) {
    onError(err, err.message, true);
    return false;
  }
}
function cleanupMutationObserver(observer) {
  if (observer) {
    observer.takeRecords();
    observer.disconnect();
    return undefined;
  }
  return observer;
}

async function getLocalListData(listType) {
  if (listType == "checklist") {
    return chrome.storage.local.get("veXChecklistData") || {};
  }
  else if (listType == "prompts") {
    return chrome.storage.local.get("veXPromptsData") || [];
  }
  return {};
}
async function getRemoteListData(remoteUrl, listType) {
  if (!remoteUrl || remoteUrl === "") {
    onError("Invalid remote url",)
    return;
  }
  try {    
    const response = await fetch(`${remoteUrl}?ts=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data && data[listType]) {
      return data[listType];
    }
    return {};
  } catch (error) {
    onError(error, `Failed to fetch remote ${listType} data from ${remoteUrl}`, true);
    return {};
  }
}

function calculateCompletionPercentage(veXTotalItems, veXTotalCompletedItems) {
  if (veXTotalItems === 0) return 0;
  const percentage = (veXTotalCompletedItems / veXTotalItems) * 100;
  return Math.min(Math.round(percentage), 100);
}

function makeElementDraggable(element,targetElement) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (element) {
    element.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    targetElement.style.top = (targetElement.offsetTop - pos2) + "px";
    targetElement.style.left = (targetElement.offsetLeft - pos1) + "px";

  }

  function closeDragElement(e) {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function centerThePopup(veXPopUpNode) {
  try {
    if (veXPopUpNode) {
      veXPopUpNode.style.left = "50%";
      veXPopUpNode.style.top = "50%";
      veXPopUpNode.style.transform = "translate(-50%, -50%) !important";
    }
  } catch {

  }
}
function getDoneMessage(percentage) {
  try {
    if (percentage < 0 || percentage > 100) {
      return "";
    }
    if (percentage <= 10) {
      return getRandomMessage(Constants.Notifications.DoneMessages[10]);
    } else if (percentage <= 25) {
      return getRandomMessage(Constants.Notifications.DoneMessages[25]);
    } else if (percentage <= 50) {
      return getRandomMessage(Constants.Notifications.DoneMessages[50]);
    } else if (percentage <= 75) {
      return getRandomMessage(Constants.Notifications.DoneMessages[75]);
    } else if (percentage < 100) {
      return getRandomMessage(Constants.Notifications.DoneMessages[90]);
    } else if (percentage == 100) {
      return getRandomMessage(Constants.Notifications.DoneMessages[100]);
    }
  } catch {
    return "Good progress! Keep it going! 🚀";
  }

}
function createCelebration() {
  // Create a container for the celebration elements
  const celebrationContainer = document.createElement('div');

  celebrationContainer.style.position = 'fixed';
  celebrationContainer.style.top = '0';
  celebrationContainer.style.left = '0';
  celebrationContainer.style.width = '100%';
  celebrationContainer.style.height = '100%';
  celebrationContainer.style.pointerEvents = 'none'; // Allow clicks to pass through
  celebrationContainer.style.zIndex = '9999'; // Ensure it's on top
  document.body.appendChild(celebrationContainer);

  // Function to create a single confetti element
  function createConfetti() {
    const confetti = document.createElement('div');
    confetti.style.position = 'absolute';
    confetti.style.width = '10px';
    confetti.style.height = '10px';

    confetti.style.backgroundColor = getRandomColor();
    confetti.style.borderRadius = '50%';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.animation = `confetti-fall ${Math.random() * 2 + 1}s ease-in-out infinite`;
    celebrationContainer.appendChild(confetti);
  }

  // Function to get a random color for confetti
  function getRandomColor() {
    const colors = ['#f06292', '#ba68c8', '#9575cd', '#7986cb', '#64b5f6', '#4dd0e1', '#4db6ac', '#81c784', '#aed581', '#dce775', '#fff176', '#ffd54f', '#ffb74d', '#ff8a65', '#a1887f', '#e0e0e0', '#90a4ae'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Create multiple confetti elements
  for (let i = 0; i < 100; i++) {
    createConfetti();
  }

  // Add keyframes for confetti animation if not already present
  if (!document.getElementById('confetti-keyframes')) {
    const style = document.createElement('style');
    style.id = 'confetti-keyframes';
    style.innerHTML = `
          @keyframes confetti-fall {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(${Math.random() * 360}deg);
              opacity: 0;
            }
          }
        `;
    document.head.appendChild(style);
  }

  setTimeout(() => {
    celebrationContainer.remove();
  }, 5000);
}

function isChecklistPopupOpen() {
  let container = document.querySelector("#veX_checklist_popup_container");
  if (container) {
    return container.classList.contains("veX_popup_active");
  }
  return false;
}
function isPromptsPopupOpen() {
  let container = document.querySelector("#veX_prompts_popup_container");
  if (container) {
    return container.classList.contains("veX_popup_active");
  }
  return false;
}
function showLoading() {
  let loader = document.getElementById("veX_loader");
  if (loader)
    loader.style.display = "block";
}
function hideLoading() {
  let loader = document.getElementById("veX_loader");
  if (loader)
    loader.style.display = "none";
}

function setNativeValue(element, value) {
  const lastValue = element.value;
  const prototype = Object.getPrototypeOf(element);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');

  descriptor.set.call(element, value);

  const event = new Event('input', { bubbles: true });
  element.dispatchEvent(event);
}

function isCommentPanelOpen() {
  if (document.querySelector("comments-wrapper")) {
    return true;
  }
  return false;
}
function isAviatorPanelOpen() {
  if (document.querySelector(".aviator-tab-title")) {
    return true;
  }
  return false;
}
function openRightSidebar() {
  if (document.querySelector("[data-aid='panel-content']") || isCommentPanelOpen()) {
    return true;
  }
  let rightSidebarCommentButton = document.querySelector(Constants.ValueEdgeNodeSelectors.RightSidebarCommentButton)

  if (!rightSidebarCommentButton) {
    notify("🤷‍♂️ Unable to open right sidebar ", Constants.NotificationType.Warning, true);
    return false;
  }
  rightSidebarCommentButton.click();
  return true;
}

async function openCommentsPanel() {
  try {
    if (document.querySelector("[data-aid='panel-item-commentsPanel']")) {
      document.querySelector("[data-aid='panel-item-commentsPanel']").click();
      await delay(1000);
      return true;
    }
    return false;
  }
  catch (err) {
    onError(err, "Unable to open comments panel", false);
    return false;
  }
}

async function openAviatorPanel() {
  try {
    if (document.querySelector("[data-aid='panel-item-aviatorPanel']")) {
      document.querySelector("[data-aid='panel-item-aviatorPanel']").click();
      await delay(1000);
      return true;
    }
    return false;
  }
  catch (err) {
    onError(err, "Unable to open aviator panel", false);
    return false;
  }
}

function closeRightSidebar() {
  let rightSidebarCollapseBtn = document.querySelector(Constants.ValueEdgeNodeSelectors.CollapseRightSidebar)
  if (!rightSidebarCollapseBtn) {
    notify("🤷‍♂️ Unable to close right sidebar ", Constants.NotificationType.Warning, true);
    return false;
  }
  rightSidebarCollapseBtn.click();
  return true;
}

function isValidURL(str) {
  try {
    new URL(str);
    return true;
  } catch (_) {
    return false;
  }
}

async function getDefaultPrompts() {
  try {
    
    const response = await fetch(`${Constants.defaultPromptsRemoteURL}?ts=${Date.now()}`);
    return await response.json() || DefaultList.veXDefaultPrompts || [];
  }
  catch (err) {
    onError(err, "Unable to fetch default prompts", false);
    return [];
  }
}
async function getDefaultChecklist() {
  try {
    
    const response = await fetch(`${Constants.defaultCheklistRemoteURL}?ts=${Date.now()}`);
    return await response.json() || DefaultList.veXDefaultChecklist || {};
  }
  catch (err) {
    onError(err, "Unable to fetch default checklist", false);
    return {};
  }
}

async function getPromptsTone() {
  try {
    
    const response =await fetch(`${Constants.defaultPromptsTonesURL}?ts=${Date.now()}`);
    return await response.json() || DefaultList.veXDefaultPromptsTone || {};
  }
  catch (err) {
    onError(err, "Unable to fetch default promptsTones", false);
    return {};
  }
}
function downloadJsonFile(jsonObject, filename = 'VEXtensionList.json') {
  try {
      // Convert JSON object to string with proper formatting
      const jsonString = JSON.stringify(jsonObject, null, 2);
      
      // Create a Blob with the JSON data
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create a temporary URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element for download
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = filename;
      
      // Append to body, click, and remove
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up the temporary URL
      URL.revokeObjectURL(url);
      
      console.log(`JSON file "${filename}" downloaded successfully!`);
      return true;
  } catch (error) {
      console.error('Error downloading JSON file:', error);
      return false;
  }
}
export {
  onError,
  notify,
  isEmptyArray,
  isEmptyObject,
  delay,
  formatMessage,
  getChecklistStatus,
  getRandomMessage,
  saveChecklistData,
  cleanupMutationObserver,
  calculateCompletionPercentage,
  makeElementDraggable,
  getDoneMessage,
  createCelebration,
  isChecklistPopupOpen,
  isPromptsPopupOpen,
  showLoading,
  hideLoading,
  setNativeValue,
  openRightSidebar,
  closeRightSidebar,
  isCommentPanelOpen,
  isAviatorPanelOpen,
  savePromtsData,
  getLocalListData,
  getRemoteListData,
  isValidURL,
  openAviatorPanel,
  openCommentsPanel,
  getDefaultChecklist,
  getDefaultPrompts,
  getPromptsTone,
  centerThePopup,
  downloadJsonFile

}