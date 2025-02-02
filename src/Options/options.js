const fileInput = document.getElementById('veX_dod_file');
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
    await loadModules();
}
initialize();
if (fileInput)
    fileInput.addEventListener('change', onFileUpload);
else
    Util.onError(err, undefined, true);

function onFileUpload(event) {
    const file = event.target.files[0];
    if (file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const veXChecklistInfo = JSON.parse(reader.result);
                if (validateChecklist(veXChecklistInfo) === true && await saveChecklist(veXChecklistInfo) === true) {
                    Util.notify(Util.getRandomMessage(Constants.Notifications.ChecklistSavedSuccessfully), "success", true);
                }
                fileInput.value = '';
            } catch (err) {
                Util.onError(err, undefined, true);
                fileInput.value = '';
            }
        };
        reader.readAsText(file);
    } else {
        Util.notify("Please upload a valid JSON file 👀", "warning", true);
    }
}

function validateChecklist(veXChecklistInfo) {
    try {
        if (Util.isEmptyObject(veXChecklistInfo)) {
            Util.notify("The checklist JSON file appears to be empty. Please upload a valid file to continue 👀", "warning", true);
            return false;
        }
        let entitiesArray = Object.keys(veXChecklistInfo);
        for (let i = 0; i < entitiesArray.length; i++) {
            let ticketEntityName = entitiesArray[i];
            let entityChecklist = veXChecklistInfo[ticketEntityName];
            if (Util.isEmptyObject(entityChecklist)) {
                Util.notify(`It looks like the '${ticketEntityName}' entity is empty. Please add the necessary fields to continue.`, "warning", true);
                return false;
            }
            if (!entityChecklist.hasOwnProperty("categories")) {
                Util.notify(`The 'categories' is missing from the '${ticketEntityName}' entity. Please add it, as it is a mandatory field.`, "warning", true);
                return false;
            }
            if (Util.isEmptyObject(entityChecklist["categories"])) {
                Util.notify(`No categories are specified in the '${ticketEntityName}'. Please add atleast one, as it is a mandatory field.`, "warning", true);
                return false;
            }
            if (validateChecklistCategories(entityChecklist["categories"], ticketEntityName) === false)
                return false;
        }
        return true;
    } catch (err) {
        Util.onError(err, undefined, true);
        return false;
    }
}

function validateChecklistCategories(ChecklistCategories, ticketEntityName) {
    try {
        let categories = Object.keys(ChecklistCategories);
        for (let i = 0; i < categories.length; i++) {
            let categoryName = categories[i];
            if (!ChecklistCategories[categoryName].hasOwnProperty("checklist")) {
                Util.notify(`The 'checklist' key is missing in the '${categoryName}' category of the '${ticketEntityName}' entity. Please add it, as it is required.`, "warning", true);
                return false;
            }
            if (Util.isEmptyArray(ChecklistCategories[categoryName].checklist)) {
                Util.notify(`The 'checklist' array is empty in the '${categoryName}' category for the '${ticketEntityName}' entity. Please add it, as it is required."`, "warning", true);
                return false;
            }
            if (ChecklistCategories[categoryName].checklist.every(list => list.length >= 1) === false) {
                Util.notify(`One of the checklist item is empty in the '${categoryName}' category for the '${ticketEntityName}' entity. Please add it, as it is required."`, "warning", true);
                return false;
            }
          /*  let phases = ChecklistCategories[categoryName].phases;
            if (!Util.isEmptyArray(phases)) {
                for (let i = 0; i < phases.length; i++) {
                    let ps = Object.keys(Constants.VEPhaseOrder);
                    if (ps.includes(phases[i].toLowerCase()) === false) {
                        Util.notify(`The phase '${phases[i]}' is not valid in the '${categoryName}' category for the '${ticketEntityName}' entity."`, "warning", true);
                        return false;
                    }
                }
            }*/
        }
        return true;
    } catch (err) {
        Util.onError(err, undefined, true);
        return false;
    }
}

async function saveChecklist(veXChecklistInfo) {
    try {
        await chrome.storage.sync.clear();
        let entites = Object.keys(veXChecklistInfo);
        for (let i = 0; i < entites.length; i++) {
            let ticketEntityName = entites[i];
            let keyValue = {};
            if (Util.isEmptyObject(veXChecklistInfo[ticketEntityName]))
                return false;
            keyValue[ticketEntityName] = veXChecklistInfo[ticketEntityName];
            await chrome.storage.sync.set(keyValue);
        }
        return true;
    }
    catch (err) {
        Util.onError(err, undefined, true);
        return false;
    }
}
