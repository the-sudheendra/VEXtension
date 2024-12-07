
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
  }
  else {
    console.info(message);
  }
}

function onError(error, info = "An error occurred. Please review the console logs for details and report the issue if needed.", display = false) {
  notify(info, "error", display);
  console.dir(error);
}
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
export {
  onError, notify, isEmptyArray, isEmptyObject,delay
}