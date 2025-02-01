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

function notify(message, type = "info", display = false) {
  if (display == true) {
    notifyAPI.openToastNode(type, message);
    return;
  }
  console.info(message);
}

function onError(error, info = "Something went wrong", display = false) {
  console.error(`Error From VE-Checklist: ${error.message}`);
  console.dir(error);
  notify(`${info}`, "error", display);
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
export {
  onError, notify, isEmptyArray, isEmptyObject, delay, formatMessage, getChecklistStatus, getRandomMessage
}