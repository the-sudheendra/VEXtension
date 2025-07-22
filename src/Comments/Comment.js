var Util;
var Constants;
var veXChecklistCommentData = {};
async function loadModules() {
  let URL = chrome.runtime.getURL("src/Common/Util.js");
  if (!Util)

/**
 * Dynamically imports the Util and Constants modules.
 */
    Util = await import(URL);
  URL = chrome.runtime.getURL("src/Common/Constants.js");
  if (!Constants)
    Constants = await import(URL);
}
async function initialize() {
  await loadModules();
}/**
 * Initializes the comment functionality by loading required modules.
 */
initialize();

/**
 * Checks if adding a comment is allowed based on the checklist items.
 * @param {object} veXChecklistItems - The checklist items.
 * @returns {boolean} - True if adding a comment is allowed, false otherwise.
 */
function isCommentAllowed(veXChecklistItems) {
  try {
    if (Util.isEmptyObject(veXChecklistItems))
      return false;
    let categories = Object.keys(veXChecklistItems);
    for (let i = 0; i < categories.length; i++) {
      let categoryName = categories[i];
      let checklist = veXChecklistItems[categoryName];
      for (let j = 0; j < checklist.length; j++) {
        let item = checklist[j];
        let status = Util.getChecklistStatus(item);
        if (status == Constants.CheckListStatus.Completed || status == Constants.CheckListStatus.NotCompleted || status == Constants.CheckListStatus.NotApplicable)
          return true;
      }
    }
    return false;
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Comment Allowed Check", err.message), true);
    return false;
  }
}

/**
 * Adds the checklist items to the comments section.
 * @param {object} veXChecklistItems - The checklist items.
 * @param {number} donePercentage - The percentage of completed items.
 */
async function addChecklistToComments(veXChecklistItems, donePercentage) {
  try {
    if (!isCommentAllowed(veXChecklistItems)) {
      Util.notify(Util.getRandomMessage(Constants.Notifications.SelectAtLeastOneItem), Constants.NotificationType.Warning, true);
      return;
    }
    Util.showLoading();
    // Open comment sidebar
    if (Util.openCommentsPanel() == false) {
      Util.notify("Hmm... can't able to access the comment panel right now. 😕 Let's try again", Constants.NotificationType.Error, true);
      return;
    }
    // Click on add new comment box
    let addNewCommentBox = document.querySelector(Constants.ValueEdgeNodeSelectors.NewCommentBox)
    if (!addNewCommentBox) {
      Util.closeRightSidebar();
      await Util.delay(500);
      Util.openRightSidebar();
      await Util.delay(500);
      addNewCommentBox = document.querySelector(Constants.ValueEdgeNodeSelectors.NewCommentBox)
      if (!addNewCommentBox) {
        Util.notify(Util.getRandomMessage(Constants.Notifications.CommentsBoxNotFound), Constants.NotificationType.Warning, true);
        return;
      }
    }
    addNewCommentBox.click();
    // getting new input comment box
    await Util.delay(500);
    let commentBox = document.querySelector(Constants.ValueEdgeNodeSelectors.InputCommentBox).querySelector(".fr-wrapper").childNodes[0];
    if (!commentBox) {
      Util.notify(Util.getRandomMessage(Constants.Notifications.CommentsBoxNotFound), Constants.NotificationType.Warning, true);
      return;
    }
    let finalComment = "";

    try {
      finalComment = await draftChecklistForComments(veXChecklistItems, donePercentage);
    }
    catch (err) {
      Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Drafting Checklist for Comments", err.message), true);
    }
    if (finalComment) {
      commentBox.innerHTML = finalComment;
      commentBox.blur();
    }
    else {
      Util.notify("Uh-oh! 😕 Couldn't draft a comment from checklist. Give it another go! 🔁 Still stuck? Report the issue 🐞", Constants.NotificationType.Warning, true);
      return;
    }

    let commentSubmitButton = document.querySelector(Constants.ValueEdgeNodeSelectors.AddCommentButton);
    if (commentSubmitButton) {
      commentSubmitButton.removeAttribute("disabled");
      await Util.delay(500);
      closeChecklistPopup();
      commentSubmitButton.click();
      Util.notify(`${donePercentage}% done. ${Util.getDoneMessage(donePercentage)}`, Constants.NotificationType.Success, true);
      //await doCelebration(donePercentage);
    }
  }
  catch (ex) {
    Util.onError(ex, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Add Checklist to Comments", ex.message), true)
  }
  finally {
    Util.hideLoading();
  }

}

async function editExistingComment(veXChecklistItems, donePercentage) {
  try {
    if (!isCommentAllowed(veXChecklistItems)) {
      Util.notify(Util.getRandomMessage(Constants.Notifications.SelectAtLeastOneItem), Constants.NotificationType.Warning, true);
      return;
    }
    Util.showLoading();
    if (await isVexChecklistCommentAvailable() == false) {
      Util.notify(Util.getRandomMessage(Constants.Notifications.NoChecklistFoundInComments), Constants.NotificationType.Info, true);
      return;
    }

    let lastComment = getLastChecklistComment();
    if (!lastComment) {
      Util.notify(Util.getRandomMessage(Constants.Notifications.NoChecklistFoundInComments), Constants.NotificationType.Info, true); return;
    }
    let inLineMenuNode = lastComment.querySelector("inline-menu");
    if (!inLineMenuNode) {
      Util.notify(Util.getRandomMessage(Constants.Notifications.NotAbleToEditComment), Constants.NotificationType.Warning, true);
      return;
    }
    let commentMenu = inLineMenuNode.querySelector(".uxa-menu-content");
    if (!commentMenu) {
      inLineMenuNode.querySelector("button").click();
      await Util.delay(500);
      commentMenu = inLineMenuNode.querySelector(".uxa-menu-content");
    }
    commentMenu.childNodes[0].click();
    await Util.delay(500);
    try {
      let finalComment = await draftChecklistForComments(veXChecklistItems, donePercentage);
      lastComment.querySelector('.veX_checklist_comment_wrapper').parentElement.innerHTML = finalComment;
      lastComment.querySelector('.veX_checklist_comment_wrapper').blur();
    }
    catch (err) {
      Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Drafting Checklist for Comments", err.message), true);
    }
    let commentSubmitButton = document.querySelector("[data-aid='comments-pane-edit-comment-button']");
    if (!commentSubmitButton) {
      Util.notify("Not able to save the comment", Constants.NotificationType.Warning, true);
      return;
    }
    //commentSubmitButton.removeAttribute("disabled");
    await Util.delay(500);
    closeChecklistPopup();
    let button = document.querySelector("[data-aid='comments-pane-edit-comment-button']");

    button.removeAttribute("disabled");

    // Allow DOM reflow before clicking
    setTimeout(() => button.click(), 500);

    Util.notify(Util.getRandomMessage(Constants.Notifications.ChecklistEditSuccess), Constants.NotificationType.Success, true);
    //await doCelebration(donePercentage);

  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Edit Existing Comment", err.message), true);
  }
  finally {
    Util.hideLoading();
  }

}

const COMMENT_STYLES = {
  DEFAULT_COLOR: '#333',
  SUCCESS_COLOR: '#008000',
  ITEM_STYLES: {
    wrapper: 'color: #333;margin-bottom:1px;',
    text: 'font-weight: 400;color:#222;margin-bottom:0px;',
    details: 'margin-bottom:3px;color: #555;'
  }
};

/**
 * Drafts the checklist content for comments.
 * @param {object} veXChecklistItems - The checklist items.
 * @param {number} donePercentage - The percentage of completed items.
 */
async function draftChecklistForComments(veXChecklistItems, donePercentage) {
  try {
    const fragment = document.createElement("div");
    const commentWrapper = createCommentWrapper();
    fragment.appendChild(commentWrapper);
    const stats = {
      completed: 0,
      notCompleted: 0,
      notApplicable: 0,
      notSelected: 0,
      totalItems: 0
    };

    Object.values(veXChecklistItems).forEach(checklist => {
      checklist.forEach(item => {
        const status = Util.getChecklistStatus(item);
        switch (status) {
          case Constants.CheckListStatus.Completed:
            stats.completed++;
            break;
          case Constants.CheckListStatus.NotCompleted:
            stats.notCompleted++;
            break;
          case Constants.CheckListStatus.NotApplicable:
            stats.notApplicable++;
            break;
          case Constants.CheckListStatus.NotSelected:
            stats.notSelected++;
            break;
        }
        stats.totalItems++;
      });
    });

    commentWrapper.appendChild(createCommentHeader(donePercentage, stats));
    await processCategories(commentWrapper, veXChecklistItems, donePercentage);
    const finalComment = fragment.innerHTML;
    return finalComment;

  } catch (ex) {
    throw ex;
  }

}

/**
 * Creates the wrapper element for the comment content.
 * @returns {HTMLElement} - The created wrapper element.
 */
function createCommentWrapper() {
  const wrapper = document.createElement('div');
  wrapper.classList.add("veX_checklist_comment_wrapper");
  wrapper.style.color = COMMENT_STYLES.DEFAULT_COLOR;
  return wrapper;
}

/**
 * Creates the header section for the comment.
 * @param {number} donePercentage - The percentage of completed items.
 * @param {object} stats - Object containing statistics about checklist items
 * @returns {HTMLElement} - The created header element.
*/
function createCommentHeader(donePercentage, stats) {
  if (!donePercentage) donePercentage = 0;
  const headerNode = document.createElement("div");
  headerNode.innerHTML = `
      <p class="veX_checklist_comment_done_percentage @totalCompletedItems_${donePercentage}%" style="color: #008000;">
      <span style="color: #008000; font-weight: bold;">Done: ${donePercentage}% | </span>
    ${ 
    [
      stats.notSelected > 0 
        ? `<span style="color: #F29339; font-weight: bold;"> ${stats.notSelected} Todo</span>` 
        : '',
        stats.completed > 0 
        ? `<span style="color: #008000; font-weight: bold;"> ${stats.completed} Done</span>` 
        : '',
      stats.notApplicable > 0 
        ? `<span style="color: ${Constants.StatusColors.NotApplicable}; font-weight: bold;">${stats.notApplicable} N/A</span>` 
        : '',
        stats.notCompleted > 0 ? `<b style="color: ${Constants.StatusColors.NotCompleted};">${stats.notCompleted} Not Done</b>` : ''
    ].filter(Boolean).join(' · ')
  }
</p>
`;
  headerNode.style.color = COMMENT_STYLES.DEFAULT_COLOR;
  return headerNode;
}

function createCategorySection(categoryName, doneItemsInCategory, totalItemsInCategory) {
  const categoryNode = document.createElement("p");
  Object.assign(categoryNode.style, {
    borderBottom: "1px dotted gray",
    paddingBottom: "2px",
    color: COMMENT_STYLES.DEFAULT_COLOR,
    fontWeight: "bold"
  });

  let tickMark = `<span style="color:#1aa364;">✔</span>`;
  if (doneItemsInCategory == totalItemsInCategory) {
    categoryNode.innerHTML = `<b class="veX_checklist_comment_category_name @category_${categoryName}"> ${tickMark} ${categoryName} : </b>`;

  } else {
    categoryNode.innerHTML = `<b class="veX_checklist_comment_category_name @category_${categoryName}">${categoryName} - (${doneItemsInCategory} of ${totalItemsInCategory} done):</b>`;
  }

  return categoryNode;
}

/**
 * Creates the item node for the comment.
 * @param {object} item - The checklist item.
 * @param {string} categoryName - The name of the category.
 * @returns {HTMLElement} - The created item node element.
 */
function createItemNode(item, categoryName) {
  const itemNode = document.createElement("div");
  const status = Util.getChecklistStatus(item);
  const baseClassName = `veX_checklist_comment_item @category_${categoryName}@status_${status}`;
  const noteContent = item["RichTextNote"].getSemanticHTML();
  const itemContent = `
    <div class="${baseClassName}" style="${COMMENT_STYLES.ITEM_STYLES.wrapper}">
      <p style="${COMMENT_STYLES.ITEM_STYLES.text}"><span style="color:${setColor(item)};">[${setPrefixForList(item)}]</span>&nbsp;&nbsp;<span class="veX_checklist_comment_item_value">${DOMPurify.sanitize(item.ListContent)}</span>
      </p>
      ${item["RichTextNote"].getLength() > 1 ? createNoteSection(noteContent) : ''}
    </div>`;
  itemNode.innerHTML = itemContent;
  return itemNode;
}

function createNoteSection(noteContent) {
  return `
    <div style="${COMMENT_STYLES.ITEM_STYLES.details}">
      <b>Notes:</b><br/>
      <span class="veX_checklist_comment_item_note">${DOMPurify.sanitize(noteContent)}</span>
    </div>`;
}


async function processCategories(commentWrapper, veXChecklistItems, donePercentage) {
  const categories = Object.keys(veXChecklistItems);
  for (const categoryName of categories) {

    const checklist = veXChecklistItems[categoryName];
    if (checklist.every(item =>
      Util.getChecklistStatus(item) === Constants.CheckListStatus.NotSelected)) {
      continue;
    }
    const checklistNode = document.createElement("div");
    checklistNode.style.paddingLeft = "0px";
    checklistNode.style.listStyleType = "none";

    let doneItemsInCategory = 0;
    for (const item of checklist) {
      if (Util.getChecklistStatus(item) !== Constants.CheckListStatus.NotSelected) {
        if (Util.getChecklistStatus(item) == Constants.CheckListStatus.Completed || Util.getChecklistStatus(item) == Constants.CheckListStatus.NotApplicable) doneItemsInCategory++;
        checklistNode.appendChild(createItemNode(item, categoryName));
      }
    }

    const categorySection = createCategorySection(categoryName, doneItemsInCategory, checklist.length,);
    commentWrapper.appendChild(categorySection);
    commentWrapper.appendChild(checklistNode);
  }
}

/**
 * Sets the prefix for a checklist item based on its status.
 * @param {object} item - The checklist item.
 * @returns {string} - The prefix for the item.
 */
function setPrefixForList(item) {
  let status = Util.getChecklistStatus(item);
  switch (status) {
    case Constants.CheckListStatus.Completed: return "✔";
    case Constants.CheckListStatus.NotCompleted: return "X";
    case Constants.CheckListStatus.NotApplicable: return "N/A";
  }
}
/**
 * Sets the color for a checklist item based on its status.
 * @param {object} item - The checklist item.
 * @returns {string} - The color for the item.
 */
function setColor(item) {
  let status = Util.getChecklistStatus(item);
  switch (status) {
    case Constants.CheckListStatus.Completed: return Constants.StatusColors.Completed;
    case Constants.CheckListStatus.NotCompleted: return Constants.StatusColors.NotCompleted;
    case Constants.CheckListStatus.NotApplicable: return Constants.StatusColors.NotApplicable;
    default: return "#000";
  }
}

/**
 * Gets the last checklist comment from the comments section.
 * @returns {HTMLElement|null} - The last checklist comment element or null if not found.
 */
function getLastChecklistComment() {
  let CommentsContainer = document.querySelectorAll('.comment-container');
  for (let i = 0; i < CommentsContainer.length; i++) {
    let comment = CommentsContainer[i];
    if (comment.querySelector('.veX_checklist_comment_wrapper')) {
      return comment;
    }
  }
  return null;
}


async function doCelebration(donePercentage) {
  /* After disucssing with team we descided not to show celebration for now.
  if (donePercentage == 100) {
    await Util.delay(1500);
    Util.createCelebration();
  } */
}

function getChecklistCommentData() {
  try {
    let commentData = document.querySelector(".veX_checklist_comment_wrapper");
    if (!commentData) return {};
    let doneNode = commentData.querySelector(".veX_checklist_comment_done_percentage");
    let doneNodeData = doneNode.classList[1].split("@")[1];
    if (doneNodeData.startsWith("totalCompletedItems"))
      veXChecklistCommentData.TotalCompletedItems = doneNodeData.slice(20);
    let checklistItems = commentData.querySelectorAll(".veX_checklist_comment_item");
    checklistItems.forEach((item) => {
      let data = item.classList[1];
      if (!data) return;
      let dataArr = data.split("@");
      let category = "";
      let status = "";
      if (!dataArr || dataArr.length < 2) return;
      if (dataArr[1].startsWith("category")) {
        category = dataArr[1].slice(9);
      }
      if (dataArr[2].startsWith("status")) {
        status = dataArr[2].slice(7);
      }
      if (category != "") {
        if (Util.isEmptyObject(veXChecklistCommentData[category])) {
          veXChecklistCommentData[category] = {}
          veXChecklistCommentData[category].checklist = []
        }
        veXChecklistCommentData[category].checklist.push({
          note: item.querySelector(".veX_checklist_comment_item_note").innerText || "",
          status: status,
          value: item.querySelector(".veX_checklist_comment_item_value").innerText || "",
        })
      }
    });
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Retrieve Checklist Comment Data", err.message), true);
  }
}

/**
 * Syncs the checklist data with the comments section.
 */
function onSyncChecklistComments() {
  try {
    let backUp_checklistData = structuredClone(veXChecklistItems);
    let backUp_completedCount = veXTotalCompletedItems;
    getChecklistCommentData();
    if (Util.isEmptyObject(veXChecklistCommentData)) {
      Util.notify("Not able to fetch checklist from comment");
      return;
    }
    Object.keys(veXChecklistItems).forEach(categoryName => {
      if (isEmptyObject(veXChecklistCommentData[categoryName]))
        return;
      updateCategoryChecklistWithComments(veXChecklistCommentData[categoryName], veXChecklistItems[categoryName])
    });
    veXTotalCompletedItems = veXChecklistCommentData.TotalCompletedItems;
  } catch (err) {
    veXChecklistItems = backUp_checklistData;
    Util.onError(err, undefined, true);
  }
  finally {
    initView();
  }
}

async function isVexChecklistCommentAvailable() {
  await Util.openCommentsPanel();
  let commentData = document.querySelector(".veX_checklist_comment_wrapper");
  if (!commentData) return false;
  return true;
}

function isCommentBarOpen() {
  let CommentsContainer = document.querySelector(Constants.ValueEdgeNodeSelectors.CommentsContainer);
  if (CommentsContainer)
    return true;
  return false;
}

function encodeChecklistStatus(text, status) {
  // Map status to invisible char
  const statusMap = {
    Completed: '\u200B',
    NotCompleted: '\u200C',
    NotApplicable: '\u200D'
  };
  return text + (statusMap[status] || '');
}

function decodeChecklistStatus(text) {
  const lastChar = text.slice(-1);
  switch (lastChar) {
    case '\u200B': return 'Completed';
    case '\u200C': return 'NotCompleted';
    case '\u200D': return 'NotApplicable';
    default: return 'Unknown';
  }
}


export {
  getChecklistCommentData, addChecklistToComments, onSyncChecklistComments, editExistingComment
}