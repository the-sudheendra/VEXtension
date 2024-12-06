//-->veX Objects Declarations
var veXDODInfo = {};
var veXCurrentTicketInfo = {};
var veXCurrentTicketChecklist = {};
var veXCheckedItems = {};
var veXPhaseMap = {};
var veXTotalCompletedtems = 0;
var veXCurrentTicketCategoryNames = [];
var veXTotalItems = 0;
var veXPopUpNode = document.createElement("div");
var veXPopUpOverlay = document.createElement("div");
var veXCategoryTitleNode;
var veXSidebarParentNode;
var veXChecklistParentNode;
var veXHeaderTitleNode;
var veXDODcategoriesNode;
var veXTicketPhaseMutationObserver;
var veXTicketTitleMutationObserver;
var veXTicketPhaseTextNode;
var veXDonePercentageNode;
var veXTicketPhaseNode;
var veXCurrentPhaseCategories = [];
var veXIsViewInitialised = false;
var veXCurrentCategory = {};
var root = document.querySelector(':root');
var utilAPI;
(async () => {
  const utilURL = chrome.runtime.getURL("src/Utility/util.js");
  utilAPI = await import(utilURL);
})();
const veXEntityMetaData = {
  'E':
  {
    'name': 'Epic',
    'colorHex': '#7425ad'
  },
  'F':
  {
    'name': 'Feature',
    'colorHex': '#e57828'
  },
  'D':
  {
    'name': 'Defect',
    'colorHex': '#b5224f'
  },
  'ER':
  {
    'name': 'Enhancement',
    'colorHex': '#5555cf'
  },
  'IM':
  {
    'name': 'CPE Incident',
    'colorHex': '#ff404b'
  },
  'I':
  {
    'name': 'CPE Incident',
    'colorHex': '#ff404b'
  },
  'US':
  {
    'name': 'User Story',
    'colorHex': '#ffaa00'
  },
  'INT':
  {
    'name': 'Internal',
    'colorHex': '#be52e4'
  },
  'SK':
  {
    'name': 'Spike',
    'colorHex': '#0baaf3'
  },
  'QS':
  {
    'name': 'Quality Story',
    'colorHex': '#2fc07e'
  },
  'T':
  {
    'name': 'Task',
    'colorHex': '#1365c0'
  }
}

var vexDODUI = `
<header class="veX_header veX_banner">
    <div class="veX_logo_container">
        <img class="veX_logo" alt="Logo">
    </div>
    <p class="veX_header_title"></p>
</header>
<div class="veX_done_status"></div>
<div class="veX_content_wrapper">
    <div class="veX_sidebar">
        <div class="veX_sidebar_header">
            <div class="veX_ticket_phase">
                <p class="veX_ticket_phase_txt">Not Available</p>
                <div class="veX_all_phases">
                </div>
            </div>
            <div class="veX_done_percentage">0%</div>
        </div>
        <div class="veX_dod_categories">No Item</div>
    </div>
    <div class="veX_main_content">
        <div class="veX_dod_title">No Item</div>
        <div class="veX_dod_list_container">
        </div>
    </div>
</div>
<div class="veX_banner veX_footer">
    <button class="veX_common_btn">Comment Checklist</button>
</div>
`;

//<-- veX Objects Declarations

//->Initialising Mutation Observers to notify whenever DOM changes.
function initTicketTitleMutationObserver() {
  try {
    let targetNode = document.head.querySelector('title');
    if (!targetNode) return;
    let options = { attributes: true, childList: true, subtree: true };
    veXTicketTitleMutationObserver = new MutationObserver(
      (mutationList, observer) => {
        for (const mutation of mutationList) {
          onTicketTitleChange(mutation);
        }
      }
    );
    veXTicketTitleMutationObserver.observe(targetNode, options);
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred during the setup.");
  }
}

function initTicketPhaseMutationObserver() {
  let targetNode = document.querySelector("[data-aid='entity-life-cycle-widget-phase']").childNodes[3];
  if (!targetNode) return;
  let options = { attributes: true };
  veXTicketPhaseMutationObserver = new MutationObserver(
    (mutationList, observer) => {
      for (const mutation of mutationList) {
        onTicketPhaseChange(mutation);
      }
    }
  );
  veXTicketPhaseMutationObserver.observe(targetNode, options);
}
//<-Initialising Mutation Observers


//->Utility Functions
function veXSetup() {
  try {
    veXPopUpNode.id = "veX-PopUp-Container";
    veXPopUpNode.classList.add("veX_pop_deactive");
    veXPopUpOverlay.id = "veX-PopUp-Overlay";
    veXPopUpNode.innerHTML = vexDODUI;
    document.body.appendChild(veXPopUpNode);
    document.body.appendChild(veXPopUpOverlay);
    veXPopUpNode.querySelector(".veX_common_btn").addEventListener("click", addDoneListToComments);
    veXPopUpOverlay.addEventListener("click", closeveXPopUp);
    initTicketTitleMutationObserver();
    initVEXNodes();
  } catch (err) {
    utilAPI.onError(err, "An error occurred during the setup.");
  }
}

function initVEXNodes() {
  veXCategoryTitleNode = veXPopUpNode.querySelector('.veX_dod_title');
  veXSidebarParentNode = veXPopUpNode.querySelector('.veX_sidebar');
  veXChecklistParentNode = veXPopUpNode.querySelector('.veX_dod_list_container');
  veXHeaderTitleNode = veXPopUpNode.querySelector(".veX_header_title");
  veXDODcategoriesNode = veXPopUpNode.querySelector(".veX_dod_categories");
  veXTicketPhaseTextNode = veXPopUpNode.querySelector(".veX_ticket_phase_txt");
  veXTicketPhaseNode = veXPopUpNode.querySelector(".veX_ticket_phase");
  veXDonePercentageNode = veXPopUpNode.querySelector(".veX_done_percentage");
}

function getCurrentTicketInfo(title) {
  try {
    if (!title) return;
    ticketArr = title.split(" ");
    if (ticketArr.length < 2) return;
    const match = ticketArr[0].match(/^([a-zA-Z]+)(\d+)$/);
    if (!match || match.length == 0) return;
    let ticketType = (document.querySelector('[ng-if="header.shouldShowEntityLabel"]').innerText).toUpperCase();
    veXCurrentTicketInfo =
    {
      type: veXEntityMetaData[ticketType].name,
      id: match[2],
      color: veXEntityMetaData[ticketType].colorHex,
      title: getTicketTitle(title.slice(ticketArr[0].length + 1)),
      phase: getCurrentTicketPhase()
    }
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred while attempting to retrieve the current ticket information.");
  }
}

function getTicketTitle(title) {
  try {
    if (title.endsWith("- Core Software Delivery Platform")) {
      let x = "- Core Software Delivery Platform".length;
      title = title.slice(0, -x);
    }
  }
  finally {
    return title;
  }
}

function veXReset() {
  veXCurrentCategory = {};
  veXCheckedItems = {};
  veXCurrentTicketChecklist = {};
  veXCurrentTicketInfo = {};
  veXPhaseMap = {};
  veXTotalCompletedtems = 0;
  veXTotalItems = 0;
  if (veXTicketPhaseMutationObserver) {
    veXTicketPhaseMutationObserver.disconnect();
    veXTicketPhaseMutationObserver = undefined;
  }
  root.style.setProperty('--veX-checkedItemsPercentage', `0%`);
  root.style.setProperty('--veX-fontColorAgainstTicketColor', `#000000`);
  root.style.setProperty('--veX-ticktColor', `#fff`);
}

function initView() {
  try {
    initHeaderView();
    initSidebarHeaderView();
    initPhaseMap();
    initPhaseDropdownView();
    let currentPhase = veXCurrentTicketInfo.phase;
    utilAPI.isEmptyObject(veXPhaseMap[currentPhase]) ? initCategoriesView(veXCurrentTicketChecklist.categories) : initCategoriesView(veXPhaseMap[currentPhase]);
    updateMainContentView();
    initStyle();
    return true;
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred while initiating the view.");
    return false;
  }
}
// Set the initial title for the checklist popup.
async function initHeaderView() {
  try {
    veXPopUpNode.querySelector('.veX_logo').src = await chrome.runtime.getURL("icons/fact_check_48_FFFFFF.png");
    veXHeaderTitleNode.innerHTML = veXCurrentTicketInfo.title;
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred while initializing the header view.");
  }
}
// This function initialise veXPhaseMap object 
function initPhaseMap() {
  try {
    let categories = Object.keys(veXCurrentTicketChecklist.categories);
    veXPhaseMap["All"] = {};
    categories.forEach(
      (categoryName) => {
        let phases = veXCurrentTicketChecklist.categories[categoryName]["phases"];
        if (!utilAPI.isEmptyArray(phases)) {
          phases.forEach((phase) => {
            if (phase in veXPhaseMap) {
              veXPhaseMap[phase][categoryName] = veXCurrentTicketChecklist.categories[categoryName];
            }
            else {
              veXPhaseMap[phase] = {};
              veXPhaseMap[phase][categoryName] = veXCurrentTicketChecklist.categories[categoryName];
            }
          });
        }
        veXPhaseMap["All"][categoryName] = veXCurrentTicketChecklist.categories[categoryName];
      });
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred while initializing the veXPhaseMap.")
  }
}

function initStyle() {
  root.style.setProperty('--veX-ticktColor', veXCurrentTicketInfo.color);
  root.style.setProperty('--veX-fontColorAgainstTicketColor', "#FFFFFF");
}

function initSidebarHeaderView() {
  try {
    veXDonePercentageNode.innerHTML = "0%";
    veXTicketPhaseTextNode.innerHTML = veXCurrentTicketInfo.phase;
    veXTicketPhaseNode.addEventListener('click', OnTicketPhaseClick);
    //veXPopUpNode.querySelector(".veX_all_phases").style.display = "none";
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred while initializing the sidebar header view.");
  }
}
// function initPhaseDropdownView() {
//   try
//   {
//     if (utilAPI.isEmptyObject(veXPhaseMap)) return;
//     Object.keys(veXPhaseMap).forEach((phase) => {
//       let phaseItemNode = document.createElement('div');
//       phaseItemNode.innerText = phase;
//       phaseItemNode.setAttribute('phaseName', phase);
//       phaseItemNode.addEventListener('click', (event) => {
//         let phaseName = event.target.getAttribute('phaseName');
//         initCategoriesView(veXPhaseMap[phaseName]);
//       });
//       veXPopUpNode.querySelector(".veX_all_phases").appendChild(phaseItemNode);
//     });
//   }catch(err)
//   {
//     utilAPI.onError(err, "An error occurred while initializing the Phase dropdown");
//     throw err;
//   }
// }
function initPhaseDropdownView() {
  try {
    let veXPhaseDropDown = veXPopUpNode.querySelector(".veX_all_phases");
    veXPhaseDropDown.innerHTML = "";
    if (utilAPI.isEmptyObject(veXPhaseMap)) return;
    let avaliablePhases = Object.keys(veXPhaseMap);
    for (let i = 0; i < avaliablePhases.length; i++) {
      let dropdownListNode = document.createElement('div');
      dropdownListNode.classList.add("veX_phase");
      dropdownListNode.setAttribute("phaseName", avaliablePhases[i]);
      dropdownListNode.textContent = avaliablePhases[i];
      dropdownListNode.addEventListener('click', (event) => {
        let phaseName = event.target.getAttribute('phaseName');
        veXTicketPhaseTextNode.innerText = phaseName;
        initCategoriesView(veXPhaseMap[phaseName]);
        updateMainContentView();
      });
      veXPhaseDropDown.appendChild(dropdownListNode);
    }
  } catch (err) {
    utilAPI.onError(err, "An error occurred while initializing the Phase dropdown");
  }
}
function initCategoriesView(categories) {
  veXDODcategoriesNode.innerHTML = "";
  try {
    if (utilAPI.isEmptyObject(categories)) {
      veXDODcategoriesNode.innerHTML = "No Item";
      return;
    };
    let categoryNames = Object.keys(categories);
    categoryNames.forEach(
      (categoryName) => {
        let sideBarItemNode = document.createElement('button');
        sideBarItemNode.className = "veX-Button";
        sideBarItemNode.setAttribute("categoryName", categoryName);
        sideBarItemNode.addEventListener('click', onCategoryChange);
        sideBarItemNode.textContent = categoryName;
        veXDODcategoriesNode.appendChild(sideBarItemNode);
      }
    );
    veXCurrentCategory = {
      name: categoryNames[0],
      value: categories[categoryNames[0]]
    }
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred while initializing the categories view.");
  }
}

function updateMainContentView() {
  try {
    if (utilAPI.isEmptyObject(veXCurrentCategory)) {
      veXCategoryTitleNode.innerHTML = "No Item";
      veXChecklistParentNode.innerHTML = "No Item";
      return;
    }
    veXCategoryTitleNode.innerHTML = veXCurrentCategory.name;
    veXPopUpNode.querySelectorAll('.veX-Button').forEach((buttonNode) => {
      buttonNode.classList.remove("veX-Active-Button");
    });
    veXSidebarParentNode.querySelector(`[categoryName="${veXCurrentCategory.name}"]`).classList.add("veX-Active-Button");
    updateCheckList();
  } catch (err) {
    utilAPI.onError(err, "An error occurred while updating main content view.", true);
  }
}

function initCheckListView() {

}
function initCheckedItems() {
  veXTotalItems = 0;
  veXCheckedItems = {};
  try {
    let categories = Object.keys(veXCurrentTicketChecklist.categories);
    if (utilAPI.isEmptyArray(categories)) {
      utilAPI.notify("No category found while initializing checklist item");
      return;
    }
    categories.forEach((categoryName) => {
      veXCheckedItems[categoryName] = [];
      let currentCategory = veXCurrentTicketChecklist.categories[categoryName];
      currentCategory.checklist.forEach((listContent) => {
        veXCheckedItems[categoryName].push(
          {
            isSelected: false,
            note: "",
            listContent: listContent,
            isCompleted: false
          }
        );
        veXTotalItems++;
      }
      );
    });
  } catch (err) {
    utilAPI.onError(err, "An error occurred while initializing the CheckedItems Array.")
  }
}

function updateCheckList() {
  let checkList = veXCurrentCategory.value.checklist;
  veXChecklistParentNode.innerHTML = "";
  try {
    if (utilAPI.isEmptyArray(checkList)) {
      return;
    }
    let currentCheckList = veXCheckedItems[veXCurrentCategory.name];
    let index = 0;
    checkList.forEach(
      (itemValue) => {
        let listItem = document.createElement('div');
        let listNodeUI = `
            <div class="veX_done_check">
                <img class="veX_done_icon" src="${chrome.runtime.getURL("icons/check_box_outline_blank_24dp.png")}">
            </div>
            <div class="veX_list_content">
                <div class="veX_list_text">${itemValue}</div>
                <div class="veX_list_actions">
                    <div class="veX_note">
                        <img class="veX_note_icon" src="${chrome.runtime.getURL("icons/notes_24dp.png")}">
                    </div>
                </div>
            </div>
            <textarea class="veX_checklist_note veX_hide_checklist_note" placeholder="Note...">${currentCheckList[index].note}</textarea>
        `;
        listItem.innerHTML = listNodeUI;
        listItem.classList.add("veX_list_item")
        listItem.setAttribute('listIndex', index);
        listItem.addEventListener("click", (event) => {
          onListItemClick(event, listItem);
        });
        if (currentCheckList[index].isSelected == true && currentCheckList[index].isCompleted == true) {
          setSelectedState(listItem, index);
          setCompletedState(listItem, index);
        } else if (currentCheckList[index].isSelected == true && currentCheckList[index].isCompleted == false) {
          setSelectedState(listItem, index);
        }
        else if (currentCheckList[index].isSelected == false && currentCheckList[index].isCompleted == true) {
          setCompletedState(listItem, index);
        }
        else if (currentCheckList[index].isSelected == false && currentCheckList[index].isCompleted == false) {
          setUnSelectedState(listItem, index);
        }

        updateNotesIcon(listItem);
        listItem.querySelector(".veX_note").addEventListener("click", (event) => {
          onListNoteClick(event, listItem);
        });
        listItem.querySelector(".veX_done_check").addEventListener("click", (event) => {
          onListDoneCheckClick(event, listItem);
        });
        listItem.querySelector('.veX_checklist_note').addEventListener('click', (event) => {
          event.stopPropagation();
        });
        listItem.querySelector('.veX_checklist_note').addEventListener('change', (event) => {
          onListNoteChange(event, listItem);
          event.stopPropagation();
        });
        veXChecklistParentNode.appendChild(listItem);
        index++;
      }
    );
  } catch (err) {
    utilAPI.onError(err, "An error occurred while updating checklist", true);
  }
}
function updateNotesIcon(listItem) {
  if (listItem.querySelector('.veX_checklist_note').value.trim() == "") {
    listItem.querySelector(".veX_note_icon").src = chrome.runtime.getURL("icons/notes_24dp.png");
  }
  else {
    listItem.querySelector(".veX_note_icon").src = chrome.runtime.getURL("icons/edit_note_24dp.png");
  }
}
function isChecklistCanAddToComments() {
  let categories = Object.keys(veXCheckedItems);
  let unselected = 0;
  for (let i = 0; i < categories.length; i++) {
    let categoryName = categories[i];
    let checklist = veXCheckedItems[categoryName];
    for (let j = 0; j < checklist.length; j++) {
      let item = checklist[j];
      if (item.isCompleted == false) {
        if (item.isSelected == true) {
          if (item.note.trim() == "")
            return false;
        }
        else
          unselected++;
      }
    }
  }
  return unselected == veXTotalItems ? false : true;

}
function addDoneListToComments() {
  try {
    if (!isChecklistCanAddToComments()) {
      utilAPI.notify("Mark at least one item as complete or add a note to selected items", "warning", true);
      return;
    }
    let rightSidebarCommentButton = document.querySelector("[data-aid='panel-item-label-commentsPanel']")
    if (rightSidebarCommentButton)
      rightSidebarCommentButton.click();
    setTimeout(() => {
      let dummyAddNewCommentBox = document.querySelector("[data-aid='comments-pane-add-new-comment-placeholder-state']")
      if (dummyAddNewCommentBox)
        dummyAddNewCommentBox.click();
      setTimeout(() => {
        let commentBox = document.querySelector(".mqm-writing-new-comment-div").querySelector(".fr-wrapper").childNodes[0];
        if (commentBox) {
          let finalComment = draftCommentForCheckedItems();
          if (finalComment != "")
            commentBox.innerHTML = finalComment;
          else return;
        }
        setTimeout(() => {
          let commentSubmitButton = document.querySelector("[ng-click='comments.onAddNewCommentClicked()']");
          if (commentSubmitButton) {
            setTimeout(() => {
              commentSubmitButton.click();
              utilAPI.notify("The checklist has been successfully added to the comments.", "success", true);
            }, 3000);
          }
        }, 100);
      }, 100);
    }, 100);
  }
  catch (ex) {
    utilAPI.onError(ex, "An exception occurred while trying to open comments in response to a click event", true)
  }
}

function draftCommentForCheckedItems() {
  try {
    let CommentDraftNode = document.createElement('div');
    let CommentHeaderNode = document.createElement("p");
    let donePercentage = ((veXTotalCompletedtems / veXTotalItems).toFixed(2) * 100).toFixed(0);
    CommentHeaderNode.innerHTML = `<strong>**Checklist Completion: ${donePercentage}%**</strong>`;
    CommentHeaderNode.style.color = "#22BB33";
    CommentDraftNode.appendChild(CommentHeaderNode);
    let categories = Object.keys(veXCheckedItems);
    categories.forEach((categoryName) => {
      let checklist = veXCheckedItems[categoryName];
      let categoryNameNode = document.createElement("p")
      categoryNameNode.innerHTML = `<b>${categoryName}</b>`;
      let checkedListNode = document.createElement("ul");
      checkedListNode.style.listStyleType = "none";
      checklist.forEach((item) => {
        if (item.isCompleted == true || item.isSelected == true) {
          let itemNode = document.createElement("li");
          itemNode.style.display = "flex";
          itemNode.style.flexDirection = "column";
          itemNode.style.justifyContent = "space-between";
          itemNode.style.alignItems = "flex-start";
          if (item.note != "") {
            itemNode.innerHTML = `<li style="font-weight: bold; color: #333;">[${item.isCompleted == true ? "✔" : "X"}] ${item.listContent}<li>`
            itemNode.innerHTML += `<li style="font-size: 12px; color: #777;">Notes: "${item.note}"</li>`
          }
          else
            itemNode.innerHTML = `<li style="font-weight: bold; color: #333;">[${item.isCompleted == true ? "✔" : "X"}] ${item.listContent}<li>`
          checkedListNode.appendChild(itemNode);
        }
      });
      CommentDraftNode.appendChild(categoryNameNode);
      CommentDraftNode.appendChild(checkedListNode);

    })

    let finalComment = CommentDraftNode.innerHTML;
    CommentDraftNode.remove();
    return finalComment;
  }
  catch (ex) {
    utilAPI.onError(ex, "An error occurred while drafting your comment. Please report the issue", true);
  }
}


function getCurrentTicketPhase() {
  try {
    return document.querySelector("[data-aid='entity-life-cycle-widget-phase']").childNodes[3].innerText;
  }
  catch (err) {
    utilAPI.onError(err, undefined, false);
  }
}
function updateDonePercentage() {
  let donePercentage = ((veXTotalCompletedtems / veXTotalItems).toFixed(2) * 100).toFixed(0);
  if (donePercentage > 100)
    donePercentage = 100
  else if (donePercentage == 0)
    donePercentage = 0;
  veXDonePercentageNode.innerHTML = `${donePercentage}%`;
  root.style.setProperty('--veX-checkedItemsPercentage', `${donePercentage}%`);
}
function setUnSelectedState(listItemNode, listIndex) {
  veXCheckedItems[veXCurrentCategory.name][listIndex].isSelected = false;
  listItemNode.classList.remove('veX_selected');
  listItemNode.querySelector(".veX_done_icon").src = chrome.runtime.getURL("icons/check_box_outline_blank_24dp.png");
  updateDonePercentage();
}
function setSelectedState(listItemNode, listIndex) {
  veXCheckedItems[veXCurrentCategory.name][listIndex].isSelected = true;
  listItemNode.classList.add('veX_selected');
  listItemNode.querySelector(".veX_done_icon").src = chrome.runtime.getURL("icons/indeterminate_check_box_24dp.png");
  updateDonePercentage();
}
function setCompletedState(listItemNode, listIndex) {
  veXCheckedItems[veXCurrentCategory.name][listIndex].isCompleted = true;
  listItemNode.classList.add('veX_completed');
  listItemNode.querySelector('.veX_done_check').classList.add("veX_checked");
  listItemNode.querySelector(".veX_done_icon").src = chrome.runtime.getURL("icons/check_box_24dp_FFFFFF.png");
  updateDonePercentage();
}
function setUnCompletedState(listItemNode, listIndex) {
  veXCheckedItems[veXCurrentCategory.name][listIndex].isCompleted = false;
  listItemNode.classList.remove('veX_completed');
  listItemNode.querySelector('.veX_done_check').classList.remove("veX_checked");
  if (listItemNode.classList.contains("veX_selected")) {
    listItemNode.querySelector(".veX_done_icon").src = chrome.runtime.getURL("icons/indeterminate_check_box_24dp.png");
  }
  else {
    listItemNode.querySelector(".veX_done_icon").src = chrome.runtime.getURL("icons/check_box_outline_blank_24dp.png");
  }
  updateDonePercentage();
}
//<-Utility Functions


//->Event Handlers
function closeveXPopUp() {
  try {
    veXPopUpOverlay.style.visibility = "hidden";
    veXPopUpNode.classList.remove("veX_pop_active");
    veXPopUpNode.classList.add("veX_pop_deactive");
  }
  catch (err) {
    utilAPI.onError(err, undefined, true);
  }
}

function openVexPopup() {
  try {
    veXPopUpOverlay.style.visibility = "visible";
    veXPopUpNode.classList.add("veX_pop_active");
    veXPopUpNode.classList.remove("veX_pop_deactive");
  } catch (err) {
    utilAPI.onError(err, undefined, true);
  }
}

function onCategoryChange(event) {
  let categoryName = event.target.getAttribute('categoryName');
  veXCurrentCategory = {
    name: categoryName,
    value: veXCurrentTicketChecklist.categories[categoryName]
  };
  updateMainContentView();
}
function onListItemClick(event, listItemNode) {
  try {
    let currentNode = listItemNode;
    if (!currentNode.querySelector(".veX_checklist_note").classList.contains("veX_hide_checklist_note")) {
      currentNode.querySelector(".veX_checklist_note").classList.add("veX_hide_checklist_note");
      updateNotesIcon(listItemNode);
      event.stopPropagation(currentNode);
      return;
    }
    let index = listItemNode.getAttribute('listIndex')
    let currentCheckList = veXCheckedItems[veXCurrentCategory.name];
    if (currentCheckList[index].isSelected == true && currentCheckList[index].isCompleted == true) {
      veXTotalCompletedtems--;
      setUnCompletedState(listItemNode, index);
      setSelectedState(listItemNode, index);
    } else if (currentCheckList[index].isSelected == true && currentCheckList[index].isCompleted == false) {
      setUnSelectedState(listItemNode, index);
    }
    else if (currentCheckList[index].isSelected == false && currentCheckList[index].isCompleted == true) {
      veXTotalCompletedtems--;
      setUnCompletedState(listItemNode, index);
      setUnSelectedState(listItemNode, index);
    }
    else if (currentCheckList[index].isSelected == false && currentCheckList[index].isCompleted == false) {
      setSelectedState(listItemNode, index);
    }
    event.stopPropagation();
  } catch (err) {
    utilAPI.onError(err, "An error occurred while processing the click event.", true);
  }
}

function onListNoteClick(event, listItemNode) {
  let index = listItemNode.getAttribute('listIndex')
  veXChecklistParentNode.querySelectorAll('.veX_list_item').forEach((listNode) => {
    let curIndex = listNode.getAttribute('listIndex');
    if (curIndex != index) {
      if (!listNode.querySelector('.veX_checklist_note').classList.contains("veX_hide_checklist_note")) {
        listNode.querySelector('.veX_checklist_note').classList.add("veX_hide_checklist_note");
        updateNotesIcon(listNode);
      }
    }

  });

  listItemNode.querySelector('.veX_checklist_note').classList.toggle("veX_hide_checklist_note");

  updateNotesIcon(listItemNode);
  if (!listItemNode.querySelector('.veX_checklist_note').classList.contains("veX_hide_checklist_note")) {
    listItemNode.querySelector('.veX_checklist_note').focus();
  }
  event.stopPropagation();
}
function onListNoteChange(event, listItemNode) {
  let listIndex = listItemNode.getAttribute('listIndex');
  veXCheckedItems[veXCurrentCategory.name][listIndex].note = listItemNode.querySelector('.veX_checklist_note').value;
  event.stopPropagation();
}
function onListDoneCheckClick(event, listItemNode) {
  let index = listItemNode.getAttribute('listIndex')
  let currentCheckList = veXCheckedItems[veXCurrentCategory.name];
  if (currentCheckList[index].isSelected == true && currentCheckList[index].isCompleted == true) {
    veXTotalCompletedtems--;
    setUnCompletedState(listItemNode, index);
  } else if (currentCheckList[index].isSelected == true && currentCheckList[index].isCompleted == false) {
    veXTotalCompletedtems++;
    setCompletedState(listItemNode, index);
  }
  else if (currentCheckList[index].isSelected == false && currentCheckList[index].isCompleted == true) {
    veXTotalCompletedtems--;
    setUnCompletedState(listItemNode, index);
  }
  else if (currentCheckList[index].isSelected == false && currentCheckList[index].isCompleted == false) {
    veXTotalCompletedtems++;
    setCompletedState(listItemNode, index);
  }
  event.stopPropagation();
}
async function onTicketTitleChange() {
  try {
    veXReset();
    getCurrentTicketInfo(document.head.querySelector('title').innerText);
    if (utilAPI.isEmptyObject(veXCurrentTicketInfo)) {
      return;
    }
    let tempDOD = await chrome.storage.sync.get(veXCurrentTicketInfo.type);
    if (!utilAPI.isEmptyObject(tempDOD)) {
      veXCurrentTicketChecklist = tempDOD[veXCurrentTicketInfo.type];
    }
    if (!utilAPI.isEmptyObject(veXCurrentTicketChecklist)) {
      initTicketPhaseMutationObserver();
      initCheckedItems();
      veXIsViewInitialised = initView();
    }
  }
  catch (err) {
    utilAPI.onError(err);
  }
}

function onTicketPhaseChange(mutation) {
  try {
    if (!mutation.target) return;
    let newPhase = mutation.target.innerText;
    let reminderMessage = `Before moving to "${newPhase}" phase, please ensure the checklist for current phase is completed.`;
    utilAPI.notify(reminderMessage, "info", true);
    openVexPopup();
  }
  catch (err) {
    utilAPI.onError(err, undefined, true);
  }
}

function OnTicketPhaseClick() {
  try {
    veXPopUpNode.querySelector(".veX_all_phases").classList.toggle("active");
  }
  catch (err) {
    utilAPI.onError(err, undefined, true);
  }
}

function handleMessagesFromServiceWorker(request, sender, sendResponse) {
  try {
    switch (request) {
      case "openVexPopup":
        if (!(utilAPI.isEmptyObject(veXCurrentTicketChecklist) || utilAPI.isEmptyObject(veXCurrentTicketInfo)))
          openVexPopup();
        else if (!utilAPI.isEmptyObject(veXCurrentTicketInfo) && utilAPI.isEmptyObject(veXCurrentTicketChecklist)) {
          utilAPI.notify(`Unable to find the checklist for '${veXCurrentTicketInfo.type}'`, "info", true);
        }
        else if (utilAPI.isEmptyObject(veXCurrentTicketInfo))
          utilAPI.notify("To see the checklist, please open a ticket", "info", true)
        else if (veXIsViewInitialised === false) {
          utilAPI.notify("Something went wrong while initializing the view. Please check the logs for more details.", "warning", true)
        }
        else
          utilAPI.notify("Something went wrong", "warning", true);
        break;
    }
  }
  catch (err) {
    utilAPI.onError(err, undefined, true);
  }
}

//<-Event Handlers
veXSetup();
chrome.runtime.onMessage.addListener(handleMessagesFromServiceWorker);