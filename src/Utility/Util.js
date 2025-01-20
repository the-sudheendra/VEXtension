
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

function notify(message, type = "info",display = false) {
  if (display == true) {
    notifyAPI.openToastNode(type, message);
    return;
  }
  console.log(message);
}

function onError(error, info = "Something went wrong", display = false) {
  console.error(`Error From VE-Checklist: ${error.message}`);
  console.dir(error);
  notify(`${info}, Please review the console logs for details and report the issue if needed.`, "error", display);
}
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export {
  onError, notify, isEmptyArray, isEmptyObject,delay
}