var notifyAPI;
(async () => {
  const notifyUrl = await chrome.runtime.getURL("src/Notification/Notification.js");
  notifyAPI = await import(notifyUrl);
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


/**
 * An util method to show an error message.
 * @param {*} error the exception object
 * @param {*} info the message string to show/log
 * @param {*} display whether to display the message or not
 */
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

/**
 * This function returns a string that says whether
 * we have either stored the JSON locally or we
 * are depending on a remote URL where we fetch
 * the JSON from.
 * @returns {string} either "local" or "url"
 */
async function getChecklistMode() {
	const veX_dod_url = await chrome.storage.sync.get("veX_dod_url");
	if (veX_dod_url?.veX_dod_url && veX_dod_url.veX_dod_url != "") {
		return "url";
	} else {
		return "local";
	}
}

function validateChecklist(veXChecklistInfo) {
    try {
        if (isEmptyObject(veXChecklistInfo)) {
            notify("The checklist JSON file appears to be empty. Please upload a valid file to continue 👀", "warning", true);
            return false;
        }
        let entitiesArray = Object.keys(veXChecklistInfo);
        for (let i = 0; i < entitiesArray.length; i++) {
            let ticketEntityName = entitiesArray[i];
            let entityChecklist = veXChecklistInfo[ticketEntityName];
            if (isEmptyObject(entityChecklist)) {
                notify(`It looks like the '${ticketEntityName}' entity is empty. Please add the necessary fields to continue.`, "warning", true);
                return false;
            }
            if (!entityChecklist.hasOwnProperty("categories")) {
                notify(`The 'categories' is missing from the '${ticketEntityName}' entity. Please add it, as it is a mandatory field.`, "warning", true);
                return false;
            }
            if (isEmptyObject(entityChecklist["categories"])) {
                notify(`No categories are specified in the '${ticketEntityName}'. Please add atleast one, as it is a mandatory field.`, "warning", true);
                return false;
            }
            if (validateChecklistCategories(entityChecklist["categories"], ticketEntityName) === false)
                return false;
        }
        return true;
    } catch (err) {
        onError(err, undefined, true);
        return false;
    }
}

function validateChecklistCategories(ChecklistCategories, ticketEntityName) {
    try {
        let categories = Object.keys(ChecklistCategories);
        for (let i = 0; i < categories.length; i++) {
            let categoryName = categories[i];
            if (!ChecklistCategories[categoryName].hasOwnProperty("checklist")) {
                notify(`The 'checklist' key is missing in the '${categoryName}' category of the '${ticketEntityName}' entity. Please add it, as it is required.`, "warning", true);
                return false;
            }
            if (isEmptyArray(ChecklistCategories[categoryName].checklist)) {
                notify(`The 'checklist' array is empty in the '${categoryName}' category for the '${ticketEntityName}' entity. Please add it, as it is required."`, "warning", true);
                return false;
            }
            if (ChecklistCategories[categoryName].checklist.every(list => list.length >= 1) === false) {
                notify(`One of the checklist item is empty in the '${categoryName}' category for the '${ticketEntityName}' entity. Please add it, as it is required."`, "warning", true);
                return false;
            }
        }
        return true;
    } catch (err) {
        onError(err, undefined, true);
        return false;
    }
}

async function saveChecklist(veXChecklistInfo, veX_dod_url,loadOnStart) {
  try {
      await chrome.storage.sync.clear();
      let entites = Object.keys(veXChecklistInfo);
      for (let i = 0; i < entites.length; i++) {
          let ticketEntityName = entites[i];
          let keyValue = {};
          if (isEmptyObject(veXChecklistInfo[ticketEntityName]))
              return false;
          keyValue[ticketEntityName] = veXChecklistInfo[ticketEntityName];
          await chrome.storage.sync.set(keyValue);
      }
      // re-save the URL as well if it was passed
      if(veX_dod_url) {
        await chrome.storage.sync.set({"veX_dod_url": veX_dod_url});
      }
      if(loadOnStart===true || loadOnStart===false)
      {
        await chrome.storage.sync.set({ "veX_loadOnStart": loadOnStart });
      }
      return true;
  }
  catch (err) {
      onError(err, undefined, true);
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

function calculateCompletionPercentage(veXTotalItems, veXTotalCompletedItems) {
  if (veXTotalItems === 0) return 0;
  const percentage = (veXTotalCompletedItems / veXTotalItems) * 100;
  return Math.min(Math.round(percentage), 100);
}

function makeElementDraggable(element) {
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
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
    
  }

  function closeDragElement(e) {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function getDoneMessage(percentage) {
  if (percentage < 1 || percentage > 100) {
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
  } else if (percentage <= 90) {
    return getRandomMessage(Constants.Notifications.DoneMessages[90]);
  } else if (percentage <= 100) {
    return getRandomMessage(Constants.Notifications.DoneMessages[100]);
  }
}
export {
  onError, notify, isEmptyArray, isEmptyObject, delay, formatMessage, getChecklistStatus, getRandomMessage, getChecklistMode, validateChecklist, saveChecklist, cleanupMutationObserver, calculateCompletionPercentage,makeElementDraggable,getDoneMessage
}