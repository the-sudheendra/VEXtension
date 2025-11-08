var Util;
var veXTicketPhaseMutationObserver;
var veXTicketTitleMutationObserver;
var veXTicketTypeMutationObserver;
var veXAviatorPanelMutationObserver;

(async () => {
    const utilURL = chrome.runtime.getURL("src/Common/Util.js");
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
function initTicketTypeMutationObserver(onTicketTitleChange, onTicketPhaseChange) {
    try {
        veXTicketTypeMutationObserver = null;
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
        veXTicketPhaseMutationObserver = null;
        let targetNode = document.querySelector("[data-aid='entity-life-cycle-widget-phase']");
        if (!targetNode) return;
        targetNode = targetNode.childNodes[3];
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

function initAviatorPanelMutationObserver(callback) {
    try {
        // Clean up existing observer
        if (veXAviatorPanelMutationObserver) {
            veXAviatorPanelMutationObserver.disconnect();
            veXAviatorPanelMutationObserver = null;
        }

        // Observe the entire document body for the Aviator panel appearing
        const targetNode = document.body;
        if (!targetNode) return;

        const options = {
            childList: true,
            subtree: true,
            attributeFilter: ['data-aid'] // Only watch data-aid changes for better performance
        };

        let debounceTimer = null;

        veXAviatorPanelMutationObserver = new MutationObserver((mutationList, observer) => {
            // Debounce to avoid excessive calls during rapid DOM changes
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }

            debounceTimer = setTimeout(() => {
                // Only check once after mutations settle
                const chatBottomSection = document.querySelector("[data-aid='chat-with-entity-panel-bottom-section']");
                if (chatBottomSection) {
                    const existingButton = document.querySelector('#veX_aviator_prompts_button');
                    if (!existingButton) {
                        callback();
                        // Disconnect observer after successful injection to stop observing
                        observer.disconnect();
                        veXAviatorPanelMutationObserver = null;
                    }
                }
            }, 150); // Wait 150ms for mutations to settle
        });

        veXAviatorPanelMutationObserver.observe(targetNode, options);
    } catch (err) {
        Util.onError(err, "An error occurred during Aviator panel observer setup.");
    }
}

export {
    initTicketTitleMutationObserver,
    initTicketTypeMutationObserver,
    initTicketPhaseMutationObserver,
    initAviatorPanelMutationObserver,
    veXTicketPhaseMutationObserver,
    veXTicketTitleMutationObserver,
    veXTicketTypeMutationObserver,
    veXAviatorPanelMutationObserver
}