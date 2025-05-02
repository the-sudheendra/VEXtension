var Util;
var Constants;
var veXChecklistCommentData = {};
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

async function addChecklistToComments(veXChecklistItems, donePercentage) {
  try {
    if (!isCommentAllowed(veXChecklistItems)) {
      Util.notify(Util.getRandomMessage(Constants.Notifications.SelectAtLeastOneItem), Constants.NotificationType.Warning, true);
      return;
    }
    // Open comment sidebar
    if(openCommentSideBar()==false)
    {
      Util.notify("Comment box icon not found in the sidebar. Please try again.", Constants.NotificationType.Error, true);
      return;
    }
    await Util.delay(500);

    // Click on add new comment box
    let addNewCommentBox = document.querySelector(Constants.ValueEdgeNodeSelectors.NewCommentBox)
    if (!addNewCommentBox) {
      Util.notify(Util.getRandomMessage(Constants.Notifications.CommentsBoxNotFound), Constants.NotificationType.Info, true);
      return;
    }
    addNewCommentBox.click();
    // getting new input comment box
    await Util.delay(500);
    let commentBox = document.querySelector(Constants.ValueEdgeNodeSelectors.InputCommentBox).querySelector(".fr-wrapper").childNodes[0];
    if (!commentBox) {
      Util.notify(Util.getRandomMessage(Constants.Notifications.CommentsBoxNotFound), Constants.NotificationType.Info, true);
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
      Util.notify(Util.getRandomMessage(Constants.Notifications.CommentsBoxNotFound), Constants.NotificationType.Info, true);
      return;
    }

    let commentSubmitButton = document.querySelector(Constants.ValueEdgeNodeSelectors.AddCommentButton);
    if (commentSubmitButton) {
      commentSubmitButton.removeAttribute("disabled");
      await Util.delay(500);
      closeveXPopUp();
      commentSubmitButton.click();
      Util.notify(`${donePercentage}% done. ${Util.getDoneMessage(donePercentage)}`, Constants.NotificationType.Success, true);
      if (donePercentage == 100) {
        await Util.delay(1500);
        Util.createCelebration();
      }
    }
  }
  catch (ex) {
    Util.onError(ex, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Add Checklist to Comments", ex.message), true)
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

async function draftChecklistForComments(veXChecklistItems, donePercentage) {
  try {
    const fragment = document.createElement("div");
    const commentWrapper = createCommentWrapper();
    fragment.appendChild(commentWrapper);
    commentWrapper.appendChild(createCommentHeader(donePercentage));
    await processCategories(commentWrapper, veXChecklistItems, donePercentage);
    const finalComment = fragment.innerHTML;
    return finalComment;

  } catch (ex) {
    throw ex;
  }

}

function createCommentWrapper() {
  const wrapper = document.createElement('div');
  wrapper.classList.add("veX_checklist_comment_wrapper");
  wrapper.style.color = COMMENT_STYLES.DEFAULT_COLOR;
  return wrapper;
}

function createCommentHeader(donePercentage) {
  if (!donePercentage) donePercentage = 0;
  const headerNode = document.createElement("p");
  headerNode.innerHTML = `
    <strong>
      <span style="color:#008000;" class="veX_checklist_comment_done_percentage @totalCompletedItems_${veXTotalCompletedItems}">${donePercentage}% Done</span>
    </strong>`;
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
    categoryNode.innerHTML = `<b class="veX_checklist_comment_category_name @category_${categoryName}">${categoryName} - ${doneItemsInCategory} of ${totalItemsInCategory} items done : </b>`;
  }

  return categoryNode;
}

function createItemNode(item, categoryName) {
  const itemNode = document.createElement("div");
  const status = Util.getChecklistStatus(item);
  const baseClassName = `veX_checklist_comment_item @category_${categoryName}@status_${status}`;
  const itemContent = `
    <div class="${baseClassName}" style="${COMMENT_STYLES.ITEM_STYLES.wrapper}">
      <p style="${COMMENT_STYLES.ITEM_STYLES.text}"><span style="color:${setColor(item)};">[${setPrefixForList(item)}]</span>&nbsp;&nbsp;<span class="veX_checklist_comment_item_value">${DOMPurify.sanitize(item.ListContent)}</span>
      </p>
      ${item.Note ? createNoteSection(item) : ''}
    </div>`;
  itemNode.innerHTML = itemContent;
  return itemNode;
}

function createNoteSection(item) {
  return `
    <div style="${COMMENT_STYLES.ITEM_STYLES.details}">
      <span style="${COMMENT_STYLES.ITEM_STYLES.text}">Details:</span><br/>
      <span class="veX_checklist_comment_item_note">${DOMPurify.sanitize(item.Note)}</span>
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

function setPrefixForList(item) {
  let status = Util.getChecklistStatus(item);
  switch (status) {
    case Constants.CheckListStatus.Completed: return "✔";
    case Constants.CheckListStatus.NotCompleted: return "✗";
    case Constants.CheckListStatus.NotApplicable: return "NA";
  }
}
function setColor(item) {
  let status = Util.getChecklistStatus(item);
  switch (status) {
    case Constants.CheckListStatus.Completed: return "#1aa364";
    case Constants.CheckListStatus.NotCompleted: return "#dd4a40";
    case Constants.CheckListStatus.NotApplicable: return "#808080"
    default: return "#000";
  }
}

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

async function editExistingComment(veXChecklistItems, donePercentage) {
  try {
    if(!isVexChecklistCommentAvailable())
    {
      Util.notify(Util.getRandomMessage(Constants.Notifications.NoChecklistFoundInComments), Constants.NotificationType.Info, true);
      return;
    }
    if (!isCommentAllowed(veXChecklistItems)) {
      Util.notify(Util.getRandomMessage(Constants.Notifications.SelectAtLeastOneItem), Constants.NotificationType.Info, true);
      return;
    }
    if(openCommentSideBar()==false)
    {
      Util.notify("Comment box icon not found in the sidebar. Please try again.", Constants.NotificationType.Error, true);
      return;
    }
    await Util.delay(500);

    let lastComment = getLastChecklistComment();
    if (!lastComment) {
      Util.notify(Util.getRandomMessage(Constants.Notifications.NoChecklistFoundInComments), Constants.NotificationType.Info, true); return;
    }
    if (!lastComment.querySelectorAll("[data-aid='inline-menu-Edit-cmd']") || lastComment.querySelectorAll("[data-aid='inline-menu-Edit-cmd']").length == 0) {
      Util.notify(Util.getRandomMessage(Constants.Notifications.NotAbleToEditComment), Constants.NotificationType.Warning, true);
      return;
    }
    lastComment.querySelectorAll("[data-aid='inline-menu-Edit-cmd']")[0].click();
    await Util.delay(500);
    try {
      let finalComment = await draftChecklistForComments(veXChecklistItems, donePercentage);
      lastComment.querySelector('.veX_checklist_comment_wrapper').parentElement.innerHTML = finalComment;
      lastComment.querySelector('.veX_checklist_comment_wrapper').blur();
    }
    catch (err) {
      Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Drafting Checklist for Comments", err.message), true);
    }
    let commentSubmitButton = document.querySelector("[ng-click='commentLines.saveComment(comment)']");
    if (!commentSubmitButton) {
      Util.notify("Not able to save the comment", Constants.NotificationType.Warning, true);
      return;
    }
    commentSubmitButton.removeAttribute("disabled");
    await Util.delay(500);
    closeveXPopUp();
    commentSubmitButton.click();
    Util.notify(Util.getRandomMessage(Constants.Notifications.ChecklistEditSuccess), Constants.NotificationType.Success, true);
  }
  catch (err) {
    Util.onError(err, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Edit Existing Comment", err.message), true);
  }

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

function isVexChecklistCommentAvailable() {
  let doWeOpenedCommentBox=false;
  try
  {
    if(!isCommentBarOpen())
    {
      doWeOpenedCommentBox=openCommentSideBar();
    }
    let commentData = document.querySelector(".veX_checklist_comment_wrapper");
    if (!commentData) return false;
    return true;
  }
  finally
  {
    if(doWeOpenedCommentBox==true)
      closeCommentSideBar();
  }
}

function isCommentBarOpen()
{
  let CommentsContainer = document.querySelector(Constants.ValueEdgeNodeSelectors.CommentsContainer);
  if(CommentsContainer)
    return true;
  return false;
}

function openCommentSideBar()
{
  
  let rightSidebarCommentButton = document.querySelector(Constants.ValueEdgeNodeSelectors.RightSidebarCommentButton)

  if (!rightSidebarCommentButton) {
    return false;
  }
  rightSidebarCommentButton.click();
  return true;
}

function closeCommentSideBar()
{
  let rightSidebarCollapseBtn = document.querySelector(Constants.ValueEdgeNodeSelectors.CollapseRightSidebar)
  if (!rightSidebarCollapseBtn) {
    return false;
  }
  rightSidebarCollapseBtn.click();
  return true;
}

export {
  getChecklistCommentData, addChecklistToComments, onSyncChecklistComments, editExistingComment
}