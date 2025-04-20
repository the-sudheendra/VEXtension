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
    let targetElement=document.getElementById("veX-PopUp-Container");
    // set the element's new position:
    targetElement.style.top = (targetElement.offsetTop - pos2) + "px";
    targetElement.style.left = (targetElement.offsetLeft - pos1) + "px";
    
  }

  function closeDragElement(e) {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function getDoneMessage(percentage) {
  try
  {
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
  }catch
  {
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

  // Remove the celebration after a few seconds (e.g., 5 seconds)
  setTimeout(() => {
    celebrationContainer.remove();
  }, 5000);
}


export {
  onError, notify, isEmptyArray, isEmptyObject, delay, formatMessage, getChecklistStatus, getRandomMessage, getChecklistMode, validateChecklist, saveChecklist, cleanupMutationObserver, calculateCompletionPercentage,makeElementDraggable,getDoneMessage,createCelebration
}