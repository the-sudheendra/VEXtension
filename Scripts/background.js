

console.log(chrome.runtime.getURL("definitions.json"));
chrome.runtime.onInstalled.addListener(() => {
chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: 'veXDoneCheckListMenu',
            title: 'Done Definition',
            documentUrlPatterns: ["https://ot-internal.saas.microfocus.com/*"],
            contexts: ['page']
        }
        );
    });
});
chrome.contextMenus.onClicked.addListener(
    (info, tab) => {
        if (info.menuItemId === "veXDoneCheckListMenu") {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                  type: "FROM_VEX_SERVICE_WORKER",
                  payload: {openVexPopUp:true}
                }, function(response) {
                  console.log("Response from content script:", response);
                });
              });
        }
    }
);


  

