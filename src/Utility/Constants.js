const EntityMetaData = {
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
const ChecklistUI = `
<header class="veX_header veX_banner">
    <div class="veX_logo_container">
        <img class="veX_logo" title="Checklist Tool for OpenText ValueEdge" alt="VE Checklist">
    </div>
    <p class="veX_header_title"></p>
   <!-- <div class="veX_sync_icon_container">
        <img class="veX_sync_icon" title="Sync checklist data from existing comment" alt="Sync checklist">
    </div> -->
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
        <div class="veX_ui_categories">No Item</div>
    </div>
    <div class="veX_main_content">
        <div class="veX_ui_title">No Item</div>
        <div class="veX_ui_list_container">
        </div>
    </div>
</div>
<div class="veX_banner veX_footer">
    <div class="veX_footer_options">
        <div class="veX_footer_icon_container veX_leave_comment_btn">
            <!-- <span class="veX_leave_comment_btn_txt">Leave Comment</span> -->
            <img class="veX_add_comment_icon veX_footer_icon" alt="Leave a Comment" title="Add New Comment" src="${chrome.runtime.getURL("icons/add_comment_24.png")}" alt="Add Comment"/>

        </div>
       <div class="veX_footer_icon_container veX_edit_comment_btn">
            <img class="veX_edit_comment_icon veX_footer_icon" alt="Edit Comment" title="Edit Existing Comment." src="${chrome.runtime.getURL("icons/rate_review_24.png")}" alt="Edit Comment"/>
            <!-- <span>Edit Comment</span> -->
        </div> 
    </div>
</div>
`;

const VEChecklistNodeSelectors = {
    root: ":root",
    UITitle: '.veX_ui_title',
    UISidebar: ".veX_sidebar",
    UIListContainer: ".veX_ui_list_container",
    UIHeaderTitle: ".veX_header_title",
    UICategories: ".veX_ui_categories",
    UITicketPhaseText: ".veX_ticket_phase_txt",
    UITicketPhase: ".veX_ticket_phase",
    UIDonePercentage: ".veX_done_percentage",
    UIAllPhases: ".veX_all_phases",
    UILogo: ".veX_logo",
    UISyncIcon: ".veX_sync_icon",
    UISyncIconContainer: ".veX_sync_icon_container",
    UICategoryButton: ".veX_category_button",
};
const ValueEdgeNodeSelectors = {
    CurrentTicketType: '[ng-if="header.shouldShowEntityLabel"]',
    CurrentTicketId: ".entity-form-document-view-header-entity-id-container",
    RightSidebarCommentButton: "[data-aid='panel-item-commentsPanel']",
    NewCommentBox: "[data-aid='comments-pane-add-new-comment-placeholder-state']",
    InputCommentBox: ".mqm-writing-new-comment-div",
    AddCommentButton: "[ng-click='comments.onAddNewCommentClicked()']",
    PhaseNode: "[data-aid='entity-life-cycle-widget-phase']"

}
const ErrorMessages = {
    UnHandledException: ["Oh no 🫣! An error in '$0', info: '$1'. Check console logs for more info 👀",
        "🚨 Oops! Something went wrong in '$0'. Error: '$1'. See console logs for details.",
        "🤔 Uh-oh! Error detected in '$0'. More info: '$1'. Check the console!",
        "😬 Something’s off in '$0'! Error: '$1'. Peek at the console logs for clues.",
        "🔍 Error spotted in '$0'! Details: '$1'. Check the console for deeper insights.",
        "🫣 Yikes! Error in '$0'—'$1'. Let’s crack this mystery in the console! 🔎",
        "🫣 Whoops! Something’s not right in '$0'. Error: '$1'. Console logs might help!",
        "😵‍💫 Whoa! Error in '$0'—'$1'. Check console logs before we panic!",
        "🧐 Hmm… Error in '$0': '$1'. The console might hold the answers!",
        "🫣 Oopsie! '$0' hit an error: '$1'. Check the console for the full story.",
        "📝 Something went wrong in '$0'. Error: '$1'. The console might have a solution!",
        "💡 Hit a snag in '$0'. Error: '$1'. No worries—check the console for clues!",
        "🚦 Error in '$0'! '$1' happened. Let’s debug together—check the console.",
        "🔄 '$0' ran into an issue: '$1'. Console logs might shed some light!",
        "🛠 Error in '$0'! '$1' popped up. The console might have the missing puzzle piece.",
        "🖥 System Error: '$1' detected in '$0'. See console logs for debugging.",
        "🔧 '$0' failed. Error: '$1'. See console logs for diagnostics.",
        "⚡ Unexpected error! '$0' hit a snag: '$1'. Console logs have more info.",
        "🔍 Error spotted in '$0'! Details: '$1'. Check the console for deeper insights.",

    ],
    SomethingWentWrong: [
        "⚠️ Oops! Something went wrong. Please report the bug.",
        "🚨 Uh-oh! We hit a snag. Let us know what happened!",
        "🤔 Hmm… that wasn’t supposed to happen. Report the issue?",
        "😕 Something’s off! Please report this bug.",
        "🔍 Oops! Something went wrong. Help us fix it by reporting the issue!",
        "🛠 Yikes! That wasn’t in the plan. Let’s squash this bug! 🐞",
        "🔧 Oopsie! Something broke. Mind sending us a bug report?",
        "🧐 Well, that’s unexpected! Report the bug so we can fix it.",
        "🤷‍♂️ That didn’t go as planned… Let us know what went wrong!",
        "😬 Glitch! Help us improve by reporting the bug.",
        "📝 Something’s not right. We’d appreciate a quick bug report!",
        "💡 Ran into an issue? Reporting it helps us fix it faster!",
        "🚦 Something didn’t work as expected. Please let us know!",
        "😬 We hit a roadblock. Reporting this bug will help us out!",
        "😬 Oops! Something broke. Let’s get it fixed—report the issue!",
        "🖥 Error detected. Please report the bug for analysis.",
        "❌ Unexpected error. A bug report will help us fix it.",
        "🔍 Oops! A glitch occurred. Help us improve by reporting it.",
        " Something went wrong. Let us know, and we’ll check it out!",
        "🔄 Error encountered. Reporting the issue helps us improve!",
    ]
}

const Notifications = {
    SelectAtLeastOneItem: [
        "Oops! You forgot to select an item. Pick at least one and you’re good to go! 🎉",
        "Almost there! Just select at least one item, and you’re all set! 🚀✨",
        "Wait a sec! You need to select at least one item before adding to comments. ⏳",
        "Hey there! Don’t forget to select at least one item before adding to comments. 😊",
        "You're so close! Just pick one item to continue. You got this! 💪",
        "Hmm... looks like you didn’t select anything. Please pick at least one item! 🤔",
        "Phew! Just select one item, and we’ll check this off in no time! ✅",
        "Wait a minute! 🎈 You forgot to pick an item. Choose one and let’s roll! 😃",
        "Oopsie! No worries, just select at least one item and you’re all set! 🤗",
        "💡 Just a little reminder: You need to select at least one item first.",
        "One small step left! Just pick an item, and you’re ready to go! 🎯",
        "Whoops! Looks like you missed a step. Just tap an item, and we’re golden! 😜",
        "One small click is all we need! Choose an item to continue! 🚀"
    ],
    ChecklistSavedSuccessfully: [
        "🚀 Boom! Your checklist is saved! Time to tackle those tasks! 💪",
        "💾 Checklist saved! Ready for the next step? ⏳",
        "📌 Your checklist is saved. You’re good to go! 😊",
        "😌 Phew! Your checklist is saved. No worries, it's all there!",
        "🎯 Checklist saved! That was easy, right? 😏",
        "📝 Saved successfully! Ready to check things off? ✅",
        "🎊 Your checklist is saved. Let’s get things done! 🤗",
        "🔥 Checklist locked & loaded! Time to make progress! 🚀",
        "🤨 Yep, it’s saved. Now, no excuses—let’s get to work! 😆",
        " Checklist saved successfully. Efficiency at its finest! ",
        "🖥 Checklist uploaded in the system. Mission accomplished! 🤖",
    ],
    ReminderToUpdateChecklist: [
        "🔔 Reminder: Don’t forget to update the checklist! 😊",
        "📝 Hey there! Give your checklist a quick update before switching phases.",
        "💡 Reminder: A quick checklist update would be great! 😊",
        "🔔 Tiny task: Just update the checklist when you have a moment!",
        "📝 Checklist needs a little love! Give it a quick update.",
        "🤔 Did you forget something? The checklist needs an update!",
        "😊 No rush! Just a gentle nudge to update the checklist.",
        "✅ You’re doing great! Just update the checklist and keep going!",
        "✏️ Don’t forget to update the checklist!",
        "📌 A quick checklist update, please!",
        "🔄 Time for a small checklist update!",
        "📝 Just a tiny update needed for the checklist!",
        "⏳ Quick check—update the checklist when ready!",
        "🛠 Almost there! Just update the checklist.",
        "🎯 Quick checklist update, and you’re good!",
        "🔔 Tiny task: Update the checklist!",
        "🚀 Smooth transition? Just update the checklist!",
        "💡 Quick refresh—update the checklist!",
        "⚡ One step left: update the checklist!",
        "🔄 Keep things in sync—update the checklist!",
        "✅ Just a quick checklist update, no rush!",
        "Keep the momentum going - update your checklist! 🚀",
        "⭐ When you have a moment, let's update that checklist! 😊",
        "Your checklist is calling for a tiny update! No pressure! 😊",
        "🎯 Ready for a quick checklist refresh? You've got this! 🌟",
    ],
    OpenTicketToSeeChecklist: [
        "🤔 Looks like you haven't opened a ticket yet. Open a ticket to see the checklist 🙂",
        "🔔 Oops! Open a ticket to view the checklist. 😊",
        "📝 The checklist is only available in a ticket. Open one to see it! 🙂",
        "🚀 Open a ticket first, then the checklist will be ready! 🙂",
        "✅ No ticket, no checklist! 😄  Open a ticket to access it.",
        "📌 Just a quick step! Open a ticket to check the checklist.",
        "🤔 Where’s the ticket? Open one to see the checklist!",
        "🚦 First stop: Open a ticket! Then, your checklist will appear.😄",
        "🔍 Can’t find the checklist? Open a ticket, and it’ll be there!",
        "🎟 Need access? Just open a ticket to see the checklist!",
        "✨ Almost there! Open a ticket to reveal the checklist.",
        "🛠 Checklist loading… wait! You need to open a ticket first.",
        "The checklist is inside a ticket! Open one to check it out.",
        "🚀 Just one step away! Open a ticket to access the checklist.",
        "🎯 Heads-up! The checklist only works inside a ticket.",
        "⚠️ Open a ticket to view the checklist.",
        "Checklist unavailable outside of tickets.",
        "🖥 No active ticket detected. Open one to view the checklist.",
    ],
    UnableToFindChecklist: [
        "🤔 No checklist found for '$0'. Maybe it wasn't uploaded?",
        "📝 Can’t find the checklist for '$0'. Check if it was uploaded!",
        " Checklist not available. Consider adding one for '$0'.😊",
        "💡 No checklist found. Want to upload one for '$0'?",
        " No checklist detected for '$0'. Please upload one. 😊",
        "🔍 No checklist found for '$0'. Want to upload one?",
        "📝 No checklist available for '$0'. Please add one!",
        "🚀 Looks like '$0' needs a checklist. Upload one now!",
        "📌 No checklist found for '$0'. Let’s get one added!",
        "🤔 Hmm… No checklist for '$0' yet. Time to upload?",
        "🧐 No checklist for '$0'—is it still on your to-do list?",
        "😕 Can’t find a checklist for '$0'. Let’s fix that!",
        "No checklist here! Want to add one for '$0'?",
        "🤷‍♂️ Checklist for '$0' is missing. Time to create one?",
        "No checklist detected for '$0'. Ready to upload?",
        "⚠️ No checklist found for '$0'. Consider adding one. 😊",
        "Missing checklist for '$0'. Please upload to continue. 😊",
        "🔄 No checklist exists for '$0'. Add one to stay organized! 😊",
        "📝 Heads up! No checklist for '$0' yet. Upload one now. 😊",
        "No checklist available for '$0'. Upload required. 😊",
        "❌ Checklist not found. Please upload one for '$0'.",
        "🔍 Checklist missing! No checklist uploaded for '$0'.",
        "No checklist detected for '$0'. Please add one.",
        "Checklist unavailable. Upload one for '$0' to proceed.",

    ],
    ChecklistAddedToComments: [
        "✅ Checklist successfully added to comments! 🎉",
        "📝 Done! Checklist is now in the comments. 😊",
        "📌 Your checklist has been posted in the comments! 👏",
        "🎯 Checklist added! Check the comments for details.",
        "🚀 Checklist dropped into the comments—good to go!",
        "🎉 Boom! Checklist is now in the comments.",
        "💬 Checklist sent to the comments—mission complete! 🎯",
        "🔥 Checklist is live in the comments. Go take a look!",
        "✅ Your checklist is now in the comments. No worries!😊",
        "💡 Quick update! The checklist is in the comments now.",
        "🚀 Your checklist has landed in the comments section!",
        "🔄 Checklist uploaded to comments—check it out!",
        "✅Checklist successfully posted in comments.",
        "🔄 Checklist synced! Find it in the comments section.",
        "✅ Success: Checklist has been added to the comments.👏",
        "📝 Checklist logged. You’ll find it in the comments! 👏",
    ],
    CommentsBoxNotFound: [
        "Unable to locate the new comment box 🙁",
        "🤔 Can’t find the comment box. Try again!",
        "🤔 No comment box detected. Please check and retry!",
        "❌ Oops! Can’t locate the comment box right now.",
        "📝 Comment box not found. Is it already open?",
        "⚠️ Can’t add checklist—no comment box found.",
        "🔄 No comment input detected. Check if it's already open!",
        "📝 Can’t post checklist comment box not detected.",
        "🚀 Checklist failed to post: No comment box detected.",
        "❌ Error: Unable to locate a comment input box.",
        "💡No comment box available. Check if one is already open.",
        "💡Comment box missing. Try refreshing or closing any open ones.",
    ],
    NoChecklistFoundInComments: [
        "🔍 No checklist found in the comments. Try adding one!",
        "📝 Hmm… Can’t find a checklist in the comments.",
        "🤔 No checklist detected. Maybe it was removed?",
        "🚀 No checklist here! Try adding a new one.",
        "❌ No checklist found. Check the comments again!",
        "🤷‍♂️ No checklist in sight! Maybe it vanished? 😅",
        "🧐 Where’s the checklist? It’s not in the comments.",
        "😕 Can’t find the checklist—did it disappear? 😜",
        "🔎 Searched everywhere… no checklist found!",
        "😅 No checklist here! Maybe try adding one?",
        "⚠️ No checklist detected in comments. Try creating one!",
        "⏳ Can’t edit—no checklist found in the comments.",
        "📌 No checklist available. Want to add a new one?",
        "📝 No existing checklist found. Try checking again!",
        "🚦 No checklist detected. Maybe it's in another comment?",
        "❌ Checklist not found. No matching checklist in the comments.",
        "🔍 404: Checklist Not Found in the comments.",
        " No checklist available. Check if it was deleted.",
        "🔧 Checklist missing. Try adding a new one!",
    ],
    ChecklistEditSuccess: [
        "✅ Checklist updated! Review the changes and save.",
        "📝 Checklist edited successfully! Take a look and save.",
        "🧐 Checklist updated! Please check it and hit save.",
        "🎯 Boom! Checklist updated. Give it a quick review and save.",
        " Edits done! Give it a look and don’t forget to save.",
    ],
    NotAbleToEditComment: [
        "You can’t edit this comment, but a new one is just a click away! 😃",
        "⚡ Quick tip! This comment isn’t editable, but you can drop a new one right away!😃",
        "💡 Heads up! This comment can’t be edited, but feel free to add a new one instead.",
        "😯 Hmm… looks like this comment can’t be changed. Maybe try adding a new one?",
        "🌟 Keep the conversation going! You can’t edit this comment, but adding a new one keeps things flowing!",
        "Oops! Editing is locked, but hey, who doesn’t love a fresh new comment? 😃",
        "Can’t edit 😯 No big deal! Just drop a new comment and keep things rolling.",
    ]
}



const VEPhaseOrder = {
    'new': 0,
    'ready': 1,
    'planned': 2,
    'in progress': 3,
    'code review': 4,
    'implemented': 5,
    'fixed': 6,
    'in testing': 7,
    'tested': 8,
    'done': 9,
    'completed': 10,
    'cancelled': 11,
    'rejected': 12,
    'proposed rejected': 13,
    'duplicate': 14,
    'pending support': 15,
    'awaiting decision': 16,
    'deferred': 16,
    'closed': 17,
}
const CheckListStatus = {
    Completed: 1,
    NotCompleted: 0,
    NotApplicable: -1,
    NotSelected: -2,
}

const NotificationType = {
    Info: 1,
    Warning: 2,
    Error: 3,
    Success: 4
}

export { EntityMetaData, ChecklistUI, ValueEdgeNodeSelectors, VEChecklistNodeSelectors, ErrorMessages, Notifications, VEPhaseOrder, CheckListStatus, NotificationType };