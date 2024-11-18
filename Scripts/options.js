
const fileInput = document.getElementById('veX_dod_file');
const validVETickets=["Epic","Feature","Defect","Enhancement","CPE Incident","User Story","Internal","Spike","Quality Story","Task"];

function isEmptyObject(obj) {
    return obj == null || (typeof obj === 'object' && Object.keys(obj).length === 0)
}

function isEmptyArray(arr) {
    return !Array.isArray(arr) || arr.length === 0;
}
function notify(message, display = false) {
    let _message = `Message from veXtension:${message}`;
    if (display == true) {
        alert(message)
    }
    else {
        console.info(_message);
    }
}

function onError(error, info = "Please upload a valid DOD file to proceed", display = false) {
    notify(info, display);
    console.dir(error);
}

fileInput.addEventListener('change', onFileUpload);
function onFileUpload(event) {
    const file = event.target.files[0];
    if (file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const veXDODInfo = JSON.parse(reader.result);
                if (validateDoD(veXDODInfo) && SaveDoD(veXDODInfo)) {
                    notify("DoD JSON has been successfully updated.", true);
                }
                fileInput.value = '';
            } catch (err) {
                onError(err, undefined, true);
                fileInput.value = '';
            }
        };
        reader.readAsText(file);
    } else {
        notify("Please upload a valid JSON file to proceed.", true);
    }
}
function validateDoD(veXDODInfo) {
    if (isEmptyObject(veXDODInfo)) {
        notify("It looks like the DoD JSON file is empty. Please upload a valid file to continue.", true);
        return false;
    }
    let entitiesArray = Object.keys(veXDODInfo);
    for (let i = 0; i < entitiesArray.length; i++) {
        let ticketEntityName = entitiesArray[i];
        let entityDOD = veXDODInfo[ticketEntityName];
        if (isEmptyObject(entityDOD)) {
            notify(`It looks like the '${ticketEntityName}' entity is empty. Please add the necessary fields to continue.`, true);
            return false;
        }
        
        if(!validVETickets.some(item => item === ticketEntityName))
        {
            notify(`The '${ticketEntityName}' is not a valid Edge Ticket value. Please enter a valid ticket name.`, true);
            return false;
        }
        if (!entityDOD.hasOwnProperty("title")) {
            notify(`The key 'title' is missing from the '${ticketEntityName}' entity. Please add it, as it is a mandatory field.`, true);
            return false;
        }
        if (!entityDOD.hasOwnProperty("categories")) {
            notify(`The key 'categories' is missing from the '${ticketEntityName}' entity. Please add it, as it is a mandatory field.`, true);
            return false;
        }
        if (isEmptyArray(entityDOD["categories"])) {
            notify(`No categories are specified in the '${ticketEntityName}' DoD. Please add it, as it is a mandatory field.`, true);
            return false;
        }
        if (validateDoDCategories(entityDOD["categories"], ticketEntityName) === false)
            return false;
    }
    return true;
}
function validateDoDCategories(DoDCategories, ticketEntityName) {
    for (let i = 0; i < DoDCategories.length; i++) {
        let DoDcategory = DoDCategories[i];
        if (!DoDcategory.hasOwnProperty("name")) {//
            notify(`The 'name' key is missing in the ${i} category of the '${ticketEntityName}' entity, and it is a required field.`, true);
            return false;
        }
        if (!DoDcategory.hasOwnProperty("checkList")) {
            notify(`The 'checkList' key is missing in the '${DoDcategory.name}' category of the '${ticketEntityName}' entity. Please add it, as it is required.`, true);
            return false;
        }
        if (isEmptyArray(DoDcategory["checkList"])) {
            notify(`The 'checkList' array is empty in the '${DoDcategory.name}' category for the '${ticketEntityName}' entity. Please add it, as it is required."`, true);
            return false;
        }
    }
    return true;
}

async function SaveDoD(veXDODInfo) {
    try {
        await chrome.storage.sync.clear();
        Object.keys(veXDODInfo).forEach(async (ticketEntityName) => {
            let keyValue = {};
            if (isEmptyObject(veXDODInfo[ticketEntityName]))
                return;
            keyValue[ticketEntityName] = veXDODInfo[ticketEntityName];
            await chrome.storage.sync.set(keyValue);
        });
        return true;
    }
    catch (err) {
        onError(err, true);
        return false;
    }
}
