var Util;
var veXTicketPhaseMutationObserver;
var veXTicketTitleMutationObserver;
var veXTicketTypeMutationObserver;

(async () => {
    const utilURL = chrome.runtime.getURL("src/Utility/Util.js");
    if (!Util)
      Util = await import(utilURL);
  })();

function initTicketTitleMutationObserver(callback) {
    try {
        let targetNode = document.head.querySelector('title');
        if (!targetNode) return;
        let options = { childList: true };
        veXTicketTitleMutationObserver = new MutationObserver(
            (mutationList, observer) => {
                for (const mutation of mutationList) {
                    callback(mutation);
                }
            }
        );
        veXTicketTitleMutationObserver.observe(targetNode, options);
    }
    catch (err) {
        Util.onError(err, "An error occurred during the setup.");
    }
}
function initTicketTypeMutationObserver(onTicketTitleChange,onTicketPhaseChange) {
    try {
        veXTicketTypeMutationObserver=null;
        let targetNode = document.querySelector(Constants.ValueEdgeNodeSelectors.CurrentTicketType);
        if (!targetNode) return;
        let options = { childList: true, characterData: true, subtree: true };
        veXTicketTypeMutationObserver = new MutationObserver(
            (mutationList, observer) => {
                for (const mutation of mutationList) {
                    onTicketTitleChange(mutation);
                    initTicketPhaseMutationObserver(onTicketPhaseChange);
                }
            }
        );
        veXTicketTypeMutationObserver.observe(targetNode, options);
    }
    catch (err) {
        Util.onError(err, "An error occurred during the setup.");
    }
}
function initTicketPhaseMutationObserver(onTicketPhaseChange) {
    try {
        veXTicketPhaseMutationObserver=null;
        let targetNode = document.querySelector("[data-aid='entity-life-cycle-widget-phase']");
        if (!targetNode) return;
        targetNode=targetNode.childNodes[3];
        let options = { attributes: true, childList: true, subtree: true };
        veXTicketPhaseMutationObserver = new MutationObserver(
            (mutationList, observer) => {
                for (const mutation of mutationList) {
                    onTicketPhaseChange(mutation);
                }
            }
        );
        veXTicketPhaseMutationObserver.observe(targetNode, options);
    }
    catch (err) {
        Util.onError(err, "An error occurred during the setup.");
    }
}

export {
    initTicketTitleMutationObserver,
    initTicketTypeMutationObserver,
    initTicketPhaseMutationObserver,
    veXTicketPhaseMutationObserver,
    veXTicketTitleMutationObserver,
    veXTicketTypeMutationObserver
}