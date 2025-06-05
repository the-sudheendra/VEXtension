const fileInput = document.getElementById('jsonFile');
const urlInputSaveBtn = document.getElementById('SaveChecklistBtn');
var veXChecklistRemoteUrl = "";
var veXLoadOnStart = false;
var uploadType = 'checklist';
var Util;
var Constants;
var Validators;
var checkListData = null;
var promptsData = null;
var veXChecklistData;
var veXpromptsData;
var veXConfiguredChecklist;
var veXConfiguredPrompts;

async function loadModules() {
    let URL = chrome.runtime.getURL("src/Utility/Util.js");
    if (!Util)
        Util = await import(URL);
    URL = chrome.runtime.getURL("src/Utility/Constants.js");
    if (!Constants)
        Constants = await import(URL);
    URL = chrome.runtime.getURL("src/Utility/SchemaValidators.js");
    if (!Validators)
        Validators = await import(URL);
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
        const file = event.target.files[0];
        if (file) {
            if (uploadType === 'prompts') {
                onPromptFileUpload(event);
            } else {
                onChecklistFileUpload(event);
            }
            const fileName = file.name;
            document.querySelector(".file-upload span").textContent = fileName;
        }
        else {
            document.querySelector(".file-upload span").textContent = "No file chosen";
        }
    });

    document.getElementById('uploadType').addEventListener('change', function () {
        uploadType = this.value;
        if (uploadType === 'checklist') {
            document.querySelector(".checkbox-container").style.display = "flex";
            loadChecklistData();
        }
        else if (uploadType === 'prompts') {
            document.querySelector(".checkbox-container").style.display = "none";
            loadPromptsData();
        }
    });
}


async function loadUrlURLMetaData() {
    if (uploadType == "checklist") {
        loadChecklistData();
    }
    else if (uploadType == "prompts") {
        loadPromptsData();
    }


}

async function loadChecklistData() {
    if (!veXChecklistData) {
        let tempChecklistData = await chrome.storage.local.get("veXChecklistData");
        if (tempChecklistData)
            veXChecklistData = tempChecklistData["veXChecklistData"];
        else
            return;
    }
    if (!veXChecklistData) return;

    let loadOnStart = false;
    let veXChecklistRemoteUrl = "";
    loadOnStart = veXChecklistData["veXLoadOnStart"];
    veXChecklistRemoteUrl = veXChecklistData["veXChecklistRemoteUrl"];
    veXConfiguredChecklist = veXChecklistData["checklist"];

    if (document.getElementById('veXRemoteUrl'))
        document.getElementById('veXRemoteUrl').value = veXChecklistRemoteUrl || "";
    if (document.getElementById('loadOnStart'))
        document.getElementById('loadOnStart').checked = (loadOnStart === true ? true : false);
}
async function loadPromptsData() {
    if (!veXpromptsData) {
        let tempPromptsData = await chrome.storage.local.get("veXPromptsData");
        if (tempPromptsData)
            veXpromptsData = tempPromptsData["veXPromptsData"];
        else
            return;
    }
    if (!veXpromptsData) return;

    veXConfiguredPrompts = veXpromptsData["prompts"];
    veXRemoteUrl = veXpromptsData["veXPromptsRemoteUrl"];
    if (document.getElementById('veXRemoteUrl'))
        document.getElementById('veXRemoteUrl').value = veXRemoteUrl || "";

}

async function onSaveURL() {
    const url = document.getElementById('veXRemoteUrl').value;
    if (!url) {
            Util.notify("Please enter a valid remote URL 👀", Constants.NotificationType.Warning, true);
            return;
    }
    try {
        Util.showLoading();
        const response = await fetch(url);
        if (!response.ok) {
            Util.notify("Couldn't fetch JSON from the URL", Constants.NotificationType.Warning, true);
            return;
        }
        const responseData = await response.json();
        if (uploadType === 'prompts') {
            validateAndSaveRemotePrompts(responseData, url);
        }
        else if (uploadType === 'checklist') {
            validateAndSaveRemoteChecklist(responseData, url);

        }

    } catch (error) {
        Util.onError(error, "Couldn't fetch JSON from the URL", true);
    }
    finally {
        Util.hideLoading();
    }
}

async function validateAndSaveRemoteChecklist(responseData, url) {
    const loadOnStart = document.getElementById('loadOnStart').checked;
    const veXChecklistInfo = responseData;
    if (Validators.validateChecklist(veXChecklistInfo) === true) {
        isChecklistSaved = await Util.saveChecklistData(veXChecklistInfo, url, loadOnStart);
        if (isChecklistSaved === true) {
            Util.notify(Util.getRandomMessage(Constants.Notifications.ChecklistSavedSuccessfully), Constants.NotificationType.Success, true);
            // clear the url input box since we are using remote checklist
            veXChecklistData = undefined;
            loadChecklistData();
        }
        else {
            Util.notify("Failed to save checklist data. Please try again.", Constants.NotificationType.Error, true);
        }
    }
}
async function validateAndSaveRemotePrompts(responseData, url) {
    const promptsData = responseData;
    if (Validators.validatePromptTemplates(promptsData) === true)
        if (await Util.savePromtsData(promptsData, url) === true) {
            Util.notify(Util.getRandomMessage(Constants.Notifications.AviatorPromptsSavedSuccessfully), Constants.NotificationType.Success, true);
        }
        else {
            Util.notify("Failed to save prompts data. Please try again.", Constants.NotificationType.Error, true);
        }
}
function onChecklistFileUpload(event) {
    const file = event.target.files[0]; // File is already selected by the input change event
    if (file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                Util.showLoading();
                const veXChecklistInfo = JSON.parse(reader.result);
                if (Validators.validateChecklist(veXChecklistInfo) === true && await Util.saveChecklistData(veXChecklistInfo) === true) {
                    Util.notify(Util.getRandomMessage(Constants.Notifications.ChecklistSavedSuccessfully), Constants.NotificationType.Success, true);
                    // clear the url input box since
                    // we are now using the file mode
                    document.getElementById('veXRemoteUrl').value = '';
                    document.getElementById('loadOnStart').checked = false;
                }
                fileInput.value = '';
            } catch (err) {
                Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Uploading Checklist", err.message), true);
                fileInput.value = '';
            }
            finally {
                Util.hideLoading();
            }
        };
        reader.readAsText(file);
    } else {
        Util.notify("Please upload a valid JSON file 👀", Constants.NotificationType.Warning, true);
    }
}

// New function to handle prompt file upload
function onPromptFileUpload(event) {
    const file = event.target.files[0]; // File is already selected by the input change event
    if (file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                Util.showLoading();
                const promptsData = JSON.parse(reader.result);
                if (Validators.validatePromptTemplates(promptsData) === true && await Util.savePromtsData(promptsData) === true) {
                    Util.notify(Util.getRandomMessage(Constants.Notifications.AviatorPromptsSavedSuccessfully), Constants.NotificationType.Success, true);
                    fileInput.value = '';
                }
                else {
                    fileInput.value = '';
                }
            } catch (err) {
                Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Uploading Prompts", err.message), true);
                fileInput.value = '';
            } finally {
                Util.hideLoading();
            }
        };
        reader.readAsText(file);
    }
}


async function saveURLMetaData(veXChecklistRemoteUrl, veXChecklistInfo, loadOnStart) {
    try {
        Util.showLoading();
        if (veXChecklistRemoteUrl && veXChecklistInfo) {
            if (await Util.saveChecklistData(veXChecklistInfo, veXChecklistRemoteUrl, loadOnStart) === false) return false;
            await chrome.storage.local.set({ "veXChecklistRemoteUrl": veXChecklistRemoteUrl });
            await chrome.storage.local.set({ "veXLoadOnStart": loadOnStart });
        }
        return true;
    }
    catch (err) {
        Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Saving the Checklist Metadata", err.message), true);
        return false;
    }
    finally {
        Util.hideLoading();
    }
}

initialize();