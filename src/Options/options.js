const fileInput = document.getElementById('veX_dod_file');
const urlInputSaveBtn = document.getElementById('veX_dod_url_save');
var Util;
(async () => {
    const utilURL = chrome.runtime.getURL("src/Utility/util.js");
    Util = await import(utilURL);
})();
if (fileInput)
    fileInput.addEventListener('change', onFileUpload);
else
    Util.onError(err, undefined, true);

// Add event listeners for the URL items
if(urlInputSaveBtn) {
    urlInputSaveBtn.addEventListener('click', onURLSave);
    window.addEventListener('load', onURLInputLoad);
} else {
    Util.onError(undefined, 'Could not find the URL input box', true);
}

/**
 * Load the saved URL from sync storage
 * when the page loads. Pre-fill it in
 * the URL input box.
 */
async function onURLInputLoad() {
    const veX_dod_url = await chrome.storage.sync.get('veX_dod_url');
    // If the url exists, show it.
    // Else, show an empty string
    document.getElementById('veX_dod_url').value = veX_dod_url?.veX_dod_url ?? "";
}

/**
 * Invoked when the user clicks on
 * the Save button for the URL input
 */
async function onURLSave() {
    const url = document.getElementById('veX_dod_url').value;
    if(!url || url === '') {
        // user is trying to clear the URL.
        // So, just clear it and return the execution
        if (await saveChecklistURL('') === true) {
            Util.notify("Checklist URL cleared successfully! 🙌🏻", "success", true);
        }
        return;
    }
    try {
        // Fetch the checklist from the remote URL,
        // validate it, and save the URL only if it is valid.
        // Note that the actual content of the JSON will be
        // retrieved on demand only - that is, whenever the user
        // loads the ValueEdge page.
        const response = await fetch(url);
        if (!response.ok) {
            Util.notify("Couldn't fetch JSON from the URL", "warning", true);
            return;
        }
        const veXChecklistInfo = await response.json();
        if (Util.validateChecklist(veXChecklistInfo) === true && await Util.saveChecklistURL(url) === true) {
            Util.notify("Checklist URL saved successfully! 🙌🏻", "success", true);
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
                    Util.notify("Checklist saved successfully! 🙌🏻", "success", true);
                    // clear the url input box since
                    // we are now using the file mode
                    document.getElementById('veX_dod_url').value = '';
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

async function saveChecklistURL(veX_dod_url) {
    try {
        await chrome.storage.sync.clear();
        await chrome.storage.sync.set({"veX_dod_url": veX_dod_url});
        return true;
    }
    catch (err) {
        Util.onError(err, "Error occured when saving the Checklist URL", true);
        return false;
    }
}
