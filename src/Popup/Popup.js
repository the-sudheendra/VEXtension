document.getElementById("upload_checklist").setAttribute("href",`${chrome.runtime.getURL('')}src/Options/Options.html`)
const app_version = chrome.runtime.getManifest().version;
document.getElementById("app_version").innerText = `(V${app_version})`