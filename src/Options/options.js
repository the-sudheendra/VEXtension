const fileInput = document.getElementById('jsonFile');
const urlInputSaveBtn = document.getElementById('SaveChecklistBtn');
var veX_dod_url = "";
var veX_loadOnStart = false;
var Util;
var Constants;

async function loadModules() {
    let URL = chrome.runtime.getURL("src/Utility/Util.js");
    if (!Util)
        Util = await import(URL);
    URL = chrome.runtime.getURL("src/Utility/Constants.js");
    if (!Constants)
        Constants = await import(URL);
}

async function initialize() {
    try {
        await loadModules();
        setupEventListeners();
    }
    catch (err) {
        Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "initialize", err.message), true);
    }
}

function setupEventListeners() {
    if (urlInputSaveBtn) {
        urlInputSaveBtn.addEventListener('click', onSaveURL);
    } else {
        Util.onError(undefined, 'Could not find the URL input box', true);
    }

    loadUrlURLMetaData();

    document.querySelector(".file-upload").addEventListener("click", () => {
        document.getElementById("jsonFile").click();
    });

    document.getElementById("jsonFile").addEventListener("change", (event) => {
        onFileUpload(event);
        const fileName = event.target.files[0] ? event.target.files[0].name : "No file chosen";
        document.querySelector(".file-upload span").textContent = fileName;
    });
}

/*
 * Load the saved URL from sync storage
 * when the page loads. Pre-fill it in
 * the URL input box.
 */
async function loadUrlURLMetaData() {
    let temp_url = await chrome.storage.sync.get('veX_dod_url');
    let temp_loadOnStart=await chrome.storage.sync.get('veX_loadOnStart');
    if(temp_url)
    {
        veX_dod_url=temp_url?.veX_dod_url;
    }
    if(temp_loadOnStart)
    {
        veX_loadOnStart=temp_loadOnStart?.veX_loadOnStart;
    }
    if (veX_dod_url)
        document.getElementById('veX_dod_url').value = veX_dod_url;
    document.getElementById('loadOnStart').checked = veX_loadOnStart;

}

/*
 * Invoked when the user clicks on
 * the Save button for the URL input
 */
async function onSaveURL() {
    const url = document.getElementById('veX_dod_url').value;
    const loadOnStart = document.getElementById("loadOnStart")?.checked;;
    if (!url || url === '') {
        if (!veX_dod_url) {
            Util.notify("Please enter a valid remote URL 👀", Constants.NotificationType.Warning, true);
            return;
        }
        if (await saveURLMetaData('') === true) {
            Util.notify("Checklist URL cleared successfully! 🙌🏻", Constants.NotificationType.Success, true);
        }
        return;
    }
    try {
        const response = await fetch(url);
        if (!response.ok) {
            Util.notify("Couldn't fetch JSON from the URL", "warning", true);
            return;
        }
        const veXChecklistInfo = await response.json();

        if (Util.validateChecklist(veXChecklistInfo) === true && await saveURLMetaData(url, veXChecklistInfo, loadOnStart) === true) {
            Util.notify(Util.getRandomMessage(Constants.Notifications.ChecklistSavedSuccessfully), Constants.NotificationType.Success, true);
        }
    } catch (error) {
        Util.onError(error, "Couldn't fetch JSON from the URL", true);
    }
}

function onFileUpload(event) {
    const file = event.target.files[0];
    if (file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const veXChecklistInfo = JSON.parse(reader.result);
                if (Util.validateChecklist(veXChecklistInfo) === true && await Util.saveChecklist(veXChecklistInfo) === true) {
                    Util.notify(Util.getRandomMessage(Constants.Notifications.ChecklistSavedSuccessfully), Constants.NotificationType.Success, true);
                    // clear the url input box since
                    // we are now using the file mode
                    document.getElementById('veX_dod_url').value = '';
                    document.getElementById('loadOnStart').checked = false;


                }
                fileInput.value = '';
            } catch (err) {
                Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Uploading Checklist", err.message), true);
                fileInput.value = '';
            }
        };
        reader.readAsText(file);
    } else {
        Util.notify("Please upload a valid JSON file 👀", Constants.NotificationType.Warning, true);
    }
}


async function saveURLMetaData(veX_dod_url, veXChecklistInfo, loadOnStart) {
    try {
        await chrome.storage.sync.clear();
        if (veX_dod_url && veXChecklistInfo) {
            if (await Util.saveChecklist(veXChecklistInfo,veX_dod_url,loadOnStart) === false) return false;
            await chrome.storage.sync.set({ "veX_dod_url": veX_dod_url });
            await chrome.storage.sync.set({ "veX_loadOnStart": loadOnStart });
        }
        return true;
    }
    catch (err) {
        Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Saving the Checklist Metadata", err.message), true);
        return false;
    }
}

initialize();