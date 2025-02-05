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

async function addChecklistToComments(veXChecklistItems) {
  try {
    if (!isCommentAllowed(veXChecklistItems)) {
      Util.notify(Util.getRandomMessage(Constants.Notifications.SelectAtLeastOneItem), Constants.NotificationType.Warning, true);
      return;
    }
    // Open comment sidebar
    let rightSidebarCommentButton = document.querySelector(Constants.ValueEdgeNodeSelectors.RightSidebarCommentButton)

    if (!rightSidebarCommentButton) {
      Util.notify(Util.getRandomMessage(Constants.ErrorMessages.SomethingWentWrong), Constants.NotificationType.Error, true);
      return;
    }
    rightSidebarCommentButton.click();
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

    // Draft checklist for comments
    let finalComment = await draftChecklistForComments();
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
      Util.notify(Util.getRandomMessage(Constants.Notifications.ChecklistAddedToComments), Constants.NotificationType.Success, true);
    }
  }
  catch (ex) {
    Util.onError(ex, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Add Checklist to Comments", ex.message), true)
  }

}
async function draftChecklistForComments() {
  try {
    let dummyCommentNode = document.createElement('div');
    let CommentDraftNode = document.createElement('div');
    dummyCommentNode.appendChild(CommentDraftNode);
    CommentDraftNode.classList.add("veX_checklist_comment_wrapper");
    CommentDraftNode.style.color = "#333"
    let CommentHeaderNode = document.createElement("p");
    let donePercentage = ((veXTotalCompletedItems / veXTotalItems).toFixed(2) * 100).toFixed(0);
    CommentHeaderNode.innerHTML = `<strong><span style="color:#008000;" class="veX_checklist_comment_done_percentage @totalCompletedItems_${veXTotalCompletedItems}">${donePercentage}% Done</span></strong>`;
    CommentHeaderNode.style.color = "#333";
    CommentDraftNode.appendChild(CommentHeaderNode);
    let categories = Object.keys(veXChecklistItems);
    categories.forEach((categoryName) => {
      let checklist = veXChecklistItems[categoryName];
      if (checklist.every((item) => Util.getChecklistStatus(item) == Constants.CheckListStatus.NotSelected))
        return;
      let categoryNameNode = document.createElement("p")
      categoryNameNode.style.borderBottom = "1px dotted gray";
      categoryNameNode.style.paddingBottom = "2px";
      categoryNameNode.style.color = "#333"
      categoryNameNode.style.fontWeight = "bold";
      categoryNameNode.innerHTML = `Category:<b class="veX_checklist_comment_category_name @category_${categoryName}"> ${categoryName}</b>`;
      let checkedListNode = document.createElement("div");
      checkedListNode.style.paddingLeft = "0px";
      checkedListNode.style.listStyleType = "none";
      checklist.forEach(async (item) => {
        let status = Util.getChecklistStatus(item);
        if (status != Constants.CheckListStatus.NotSelected) {
          let itemNode = document.createElement("div");

          if (item.Note != "") {
            itemNode.innerHTML = `<div class="veX_checklist_comment_item @category_${categoryName}@status_${Util.getChecklistStatus(item)}" style="color: #333;margin-bottom:1px; "><p style="font-weight: bold; color:#333;margin-bottom:0px;"><span style="color:${setColor(item)};">[${setPrefixForList(item)}]</span>&nbsp;&nbsp;<span class="veX_checklist_comment_item_value">${DOMPurify.sanitize(item.ListContent)}</span></p>
              <div style="margin-bottom:3px;"><b style="color: #333;">Details:</b><br/><span class="veX_checklist_comment_item_note" >${DOMPurify.sanitize(item.Note)}</span></div>
              </div>`
          } else {
            itemNode.innerHTML = `<div class="veX_checklist_comment_item @category_${categoryName}@status_${Util.getChecklistStatus(item)}" style="color: #333;margin-bottom:1px;"><p style="font-weight: bold; color:#333;margin-bottom:0px;"><span style="color:${setColor(item)};">[${setPrefixForList(item)}]</span>&nbsp;&nbsp;<span class="veX_checklist_comment_item_value">${DOMPurify.sanitize(item.ListContent)}</span></p></div>`
          }
          checkedListNode.appendChild(itemNode);
        }
      });
      CommentDraftNode.appendChild(categoryNameNode);
      CommentDraftNode.appendChild(checkedListNode);

    })
    let finalComment = dummyCommentNode.innerHTML;
    dummyCommentNode.remove();
    return finalComment;
  }
  catch (ex) {
    Util.onError(ex, Util.formatMessage(Util.getRandomMessage(Constants.ErrorMessages.UnHandledException), "Draft Checklist for Comments", ex.message), true);
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

async function editExistingComment(veXChecklistItems) {
  try {
    if (!isCommentAllowed(veXChecklistItems)) {
      Util.notify(Util.getRandomMessage(Constants.Notifications.SelectAtLeastOneItem), Constants.NotificationType.Info, true);
      return;
    }
    let rightSidebarCommentButton = document.querySelector(Constants.ValueEdgeNodeSelectors.RightSidebarCommentButton)
    if (rightSidebarCommentButton) rightSidebarCommentButton.click();
    await Util.delay(500);

    let lastComment = getLastChecklistComment();
    if (!lastComment) {
      addChecklistToComments(veXChecklistItems);
      return;
    }
    if (!lastComment.querySelectorAll("[data-aid='inline-menu-Edit-cmd']") || lastComment.querySelectorAll("[data-aid='inline-menu-Edit-cmd']").length == 0) {
      Util.notify(Util.getRandomMessage(Constants.Notifications.NotAbleToEditComment), Constants.NotificationType.Warning, true);
      return;
    }
    lastComment.querySelectorAll("[data-aid='inline-menu-Edit-cmd']")[0].click();
    await Util.delay(500);
    lastComment.querySelector('.veX_checklist_comment_wrapper').parentElement.innerHTML = await draftChecklistForComments(veXChecklistItems);
    lastComment.querySelector('.veX_checklist_comment_wrapper').blur();
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
export {
  getChecklistCommentData, addChecklistToComments, onSyncChecklistComments, editExistingComment
}