const fileInput = document.getElementById('veX_dod_file');
var utilAPI;
(async () => {
    const utilURL = chrome.runtime.getURL("src/Utility/util.js");
    utilAPI = await import(utilURL);
})();
if (fileInput)
    fileInput.addEventListener('change', onFileUpload);
else
    utilAPI.onError(err, undefined, true);

function onFileUpload(event) {
    const file = event.target.files[0];
    if (file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const veXChecklistInfo = JSON.parse(reader.result);
                if (validateChecklist(veXChecklistInfo) === true && await saveChecklist(veXChecklistInfo) === true) {
                    utilAPI.notify("VE Checklist saved successfully!", "success", true);
                }
                fileInput.value = '';
            } catch (err) {
                utilAPI.onError(err, undefined, true);
                fileInput.value = '';
            }
        };
        reader.readAsText(file);
    } else {
        utilAPI.notify("Please upload a valid JSON file.", "warning", true);
    }
}

function validateChecklist(veXChecklistInfo) {
    try {
        if (utilAPI.isEmptyObject(veXChecklistInfo)) {
            utilAPI.notify("The checklist JSON file appears to be empty. Please upload a valid file to continue.", "warning", true);
            return false;
        }
        let entitiesArray = Object.keys(veXChecklistInfo);
        for (let i = 0; i < entitiesArray.length; i++) {
            let ticketEntityName = entitiesArray[i];
            let entityChecklist = veXChecklistInfo[ticketEntityName];
            if (utilAPI.isEmptyObject(entityChecklist)) {
                utilAPI.notify(`It looks like the '${ticketEntityName}' entity is empty. Please add the necessary fields to continue.`, "warning", true);
                return false;
            }
            if (!entityChecklist.hasOwnProperty("categories")) {
                utilAPI.notify(`The 'categories' is missing from the '${ticketEntityName}' entity. Please add it, as it is a mandatory field.`, "warning", true);
                return false;
            }
            if (utilAPI.isEmptyObject(entityChecklist["categories"])) {
                utilAPI.notify(`No categories are specified in the '${ticketEntityName}'. Please add atleast one, as it is a mandatory field.`, "warning", true);
                return false;
            }
            if (validateChecklistCategories(entityChecklist["categories"], ticketEntityName) === false)
                return false;
        }
        return true;
    } catch (err) {
        utilAPI.onError(err, undefined, true);
        return false;
    }
}

function validateChecklistCategories(ChecklistCategories, ticketEntityName) {
    try {
        let categories = Object.keys(ChecklistCategories);
        for (let i = 0; i < categories.length; i++) {
            let categoryName = categories[i];
            if (!ChecklistCategories[categoryName].hasOwnProperty("checklist")) {
                utilAPI.notify(`The 'checklist' key is missing in the '${categoryName}' category of the '${ticketEntityName}' entity. Please add it, as it is required.`, "warning", true);
                return false;
            }
            if (utilAPI.isEmptyArray(ChecklistCategories[categoryName].checklist)) {
                utilAPI.notify(`The 'checklist' array is empty in the '${categoryName}' category for the '${ticketEntityName}' entity. Please add it, as it is required."`, "warning", true);
                return false;
            }
            if (ChecklistCategories[categoryName].checklist.every(list => list.length >= 1) === false) {
                utilAPI.notify(`One of the checklist item is empty in the '${categoryName}' category for the '${ticketEntityName}' entity. Please add it, as it is required."`, "warning", true);
                return false;
            }
        }
        return true;
    } catch (err) {
        utilAPI.onError(err, undefined, true);
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
            if (utilAPI.isEmptyObject(veXChecklistInfo[ticketEntityName]))
                return false;
            keyValue[ticketEntityName] = veXChecklistInfo[ticketEntityName];
            await chrome.storage.sync.set(keyValue);
        }
        return true;
    }
    catch (err) {
        utilAPI.onError(err, undefined, true);
        return false;
    }
}
