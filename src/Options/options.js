
const fileInput = document.getElementById('veX_dod_file');
const validVETickets = ["Epic", "Feature", "Defect", "Enhancement", "CPE Incident", "User Story", "Internal", "Spike", "Quality Story", "Task"];
var utilAPI;
(async () => {
    const utilURL = chrome.runtime.getURL("src/Utility/util.js");
    utilAPI = await import(utilURL);
})();

fileInput.addEventListener('change', onFileUpload);
function onFileUpload(event) {
    const file = event.target.files[0];
    if (file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = async() => {
            try {
                const veXDODInfo = JSON.parse(reader.result);
                if (validateDoD(veXDODInfo) === true && await SaveDoD(veXDODInfo) === true) {
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
        utilAPI.notify("Upload a valid JSON file to proceed.", "warning", true);
    }
}
function validateDoD(veXDODInfo) {
    try {
        if (utilAPI.isEmptyObject(veXDODInfo)) {
            utilAPI.notify("The checklist JSON file appears to be empty. Please upload a valid file to continue.", "warning", true);
            return false;
        }
        let entitiesArray = Object.keys(veXDODInfo);
        for (let i = 0; i < entitiesArray.length; i++) {
            let ticketEntityName = entitiesArray[i];
            let entityDOD = veXDODInfo[ticketEntityName];
            if (utilAPI.isEmptyObject(entityDOD)) {
                utilAPI.notify(`It looks like the '${ticketEntityName}' entity is empty. Please add the necessary fields to continue.`, "warning", true);
                return false;
            }
            if (!validVETickets.some(item => item === ticketEntityName)) {
                utilAPI.notify(`The '${ticketEntityName}' is not a valid Ticket. Please enter a valid ticket name.`, "warning", true);
                return false;
            }
            if (!entityDOD.hasOwnProperty("title")) {
                utilAPI.notify(`The key 'title' is missing from the '${ticketEntityName}' entity. Please add it, as it is a mandatory field.`, "warning", true);
                return false;
            }
            if (!validVETickets.some(item => item === entityDOD["title"])) {
                utilAPI.notify(`The '${entityDOD.title}' is not a valid Ticket. Please enter a valid ticket name.`, "warning", true);
                return false;
            }
            if (!entityDOD.hasOwnProperty("categories")) {
                utilAPI.notify(`The key 'categories' is missing from the '${ticketEntityName}' entity. Please add it, as it is a mandatory field.`, "warning", true);
                return false;
            }
            if (utilAPI.isEmptyArray(entityDOD["categories"])) {
                utilAPI.notify(`No categories are specified in the '${ticketEntityName}' DoD. Please add it, as it is a mandatory field.`, "warning", true);
                return false;
            }
            if (validateDoDCategories(entityDOD["categories"], ticketEntityName) === false)
                return false;
        }
        return true;
    } catch (err) {
        utilAPI.onError(err, undefined, true);
        return false;
    }


}
function validateDoDCategories(DoDCategories, ticketEntityName) {
    try {
        for (let i = 0; i < DoDCategories.length; i++) {
            let DoDcategory = DoDCategories[i];
            if (!DoDcategory.hasOwnProperty("name")) {//
                utilAPI.notify(`The 'name' key is missing in the ${i} category of the '${ticketEntityName}' entity, and it is a required field.`, "warning", true);
                return false;
            }
            if (!DoDcategory.hasOwnProperty("checklist")) {
                utilAPI.notify(`The 'checklist' key is missing in the '${DoDcategory.name}' category of the '${ticketEntityName}' entity. Please add it, as it is required.`, "warning", true);
                return false;
            }
            if (utilAPI.isEmptyArray(DoDcategory["checklist"])) {
                utilAPI.notify(`The 'checklist' array is empty in the '${DoDcategory.name}' category for the '${ticketEntityName}' entity. Please add it, as it is required."`, "warning", true);
                return false;
            }
        }
        return true;
    } catch (err) {
        utilAPI.onError(err, undefined, true);
        return false;
    }
}

async function SaveDoD(veXDODInfo) {
    try {
        await chrome.storage.sync.clear();
        let entites = Object.keys(veXDODInfo);
        for (let i = 0; i < entites.length; i++) {
            let ticketEntityName = entites[i];
            let keyValue = {};
            if (utilAPI.isEmptyObject(veXDODInfo[ticketEntityName]))
                return false;
            keyValue[ticketEntityName] = veXDODInfo[ticketEntityName];
            await chrome.storage.sync.set(keyValue);
        }
        return true;
    }
    catch (err) {
        utilAPI.onError(err, undefined, true);
        return false;
    }
}
