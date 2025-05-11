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
const iconUrls = {
    add: chrome.runtime.getURL("icons/add_24dp_000000.png"),
    edit: chrome.runtime.getURL("icons/edit_24dp_000000.png")
  };
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
<div class="veX_banner veX_footer ">
    <div class="veX_segmented-button">
        <div class="veX_segment veX_footer_icon_container veX_leave_comment_btn">
        <img class="material-icons" alt="Leave a new comment" title="Leave a new comment" src="${iconUrls.add}"/>
             <span class="veX_leave_comment_btn_txt">Leave Comment</span> 
        </div>
         <div class=" veX_segment veX_footer_icon_container veX_edit_comment_btn">
         <img class="material-icons" alt="Edit exisiting comment" title="Edit exisiting comment" src="${iconUrls.edit}"/>
             <span class="veX_edit_comment_btn_txt">Edit Comment</span> 
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
    PhaseNode: "[data-aid='entity-life-cycle-widget-phase']",
    CollapseRightSidebar: ".collapsable-panel",
    CommentsContainer:"comment-lines"

}
const ErrorMessages = {
    UnHandledException: ["Oh no 🫣! An error in '$0', info: '$1'. Check console logs for more info 👀",
        "Oops! Something went wrong in '$0'. Error: '$1'. See console logs for details.",
        "🤔 Uh-oh! Error detected in '$0'. More info: '$1'. Check the console!",
        "😬 Something’s off in '$0'! Error: '$1'. Peek at the console logs for clues.",
        "🫣 Whoops! Something’s not right in '$0'. Error: '$1'. Console logs might help!",
        "🔍 Error spotted in '$0'! Details: '$1'. Check the console for more info.🐞",

    ],
    SomethingWentWrong: [
        "⚠️ Oops! Something went wrong. Please report the bug.",
        "🤔 Hmm… that wasn’t supposed to happen. Report the issue?",
        "😕 Something’s off! Please report this bug.",
        "🔍 Oops! Something went wrong. Help us fix it by reporting the issue!",
        "🔧 Oopsie! Something broke. Mind sending us a bug report?",
        "🧐 Well, that’s unexpected! Report the bug so we can fix it.",
        "🤷‍♂️ That didn’t go as planned… Let us know what went wrong!",
        "📝 Something’s not right. We’d appreciate a quick bug report!",
        "😬 We hit a roadblock. Reporting this bug will help us out!",
        "😬 Oops! Something broke. Let’s get it fixed—report the issue!",
        "❌ Unexpected error. A bug report will help us fix it.",
        "🔍 Oops! A glitch occurred. Help us improve by reporting it.",
    ]
}

const Notifications = {
    SelectAtLeastOneItem: [
        "Oops! You forgot to select an item. Pick at least one and you’re good to go! 🎉",
        "Almost there! Just select at least one item, and you’re all set! 🚀✨",
        "Wait a sec! You need to select at least one item before adding to comments. ⏳",
        "You're so close! Just pick one item to continue. You got this! 💪",
        "Hmm... looks like you didn’t select anything. Please pick at least one item! 🤔",
        "Wait a minute! You forgot to pick an item. Choose one and let’s roll! 😃",
    ],
    ChecklistSavedSuccessfully: [
        "🚀 Boom! Your checklist is saved! Time to tackle those tasks! 💪",
        "💾 Checklist saved! Ready for the next step? ⏳",
        "📌 Your checklist is saved. You’re good to go! 😊",
        "😌 Your checklist is saved. No worries, it's all there!",
        "Checklist saved! That was easy, right? 😏",
        "🚀 Saved successfully! Ready to check things off? ",
        "🎊 Your checklist is saved. Let’s get things done! 🤗",
        "🔥 Checklist locked & loaded! Time to make progress! 🚀",
        " Yep, it’s saved. Now, no excuses—let’s get to work!😜 "
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
        "No ticket, no checklist! 😄  Open a ticket to access it.",
        "🤔 Where’s the ticket? Open one to see the checklist!",
        "✨ Almost there! Open a ticket to see the checklist.",
    ],
    UnableToFindChecklist: [
        "🤔 No checklist found for '$0'. Maybe it wasn't uploaded?",
        " Checklist not available. Consider adding one for '$0'.😊",
        "💡 No checklist found. Want to upload one for '$0'?",
        "🤔 Hmm… No checklist for '$0' yet. Time to upload?",
        "No checklist here! Want to add one for '$0'?",
        "🤷‍♂️ Checklist for '$0' is missing. Time to create one?",

    ],
    ChecklistAddedToComments: [
        "Checklist successfully added to comments! 🎉",
        "📝 Done! Checklist is now in the comments. 😊",
        "Your checklist has been posted in the comments! 👏",
        "🚀 Checklist dropped into the comments—good to go!",
        "Checklist sent to the comments—mission complete! 🎯",
        "🔥 Checklist is live in the comments. Go take a look!",
        "✅ Your checklist is now in the comments. No worries!😊",
        "🚀 Your checklist has landed in the comments section!",

    ],
    CommentsBoxNotFound: [
        "🤔 Can't add comment — finish or close the one already open."
    ],
    NoChecklistFoundInComments: [
        "🤔 Hmm… No existing checklist found in the comments. Try adding new one!",
    ],
    ChecklistEditSuccess: [
        "📝 Checklist updated! Review the changes and save.",
        "📝 Checklist edited successfully! Take a look and save.",
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
    ],
    DoneMessages: {
        10: [
            "Let's start the work! 🚀",
            "Chalo shuru karte hain! 👍",
            "Babu Rao style mein—‘Chalu kar re baba!’ 😄"
        ],
        25: [
            "Good start! Keep it up! 💪",
            "Work has begun! Let's go! 🔥",
            "Kaam toh bas start hua hai... asli mazaa toh ab aayega! 😉",
            'Abhi toh party shuru hui hai! 🔥' 
        ],
        50: [
            "Half work done! Great going! 👏",
            "You're doing well! Keep going! 💯",
            "Aadha kaam ho gaya, 'Bohot hard'! 🔥",
            "Bas thoda sa push aur – ‘All is well!’ 😄",
        ],
        75: [
            "Almost there! Just a bit left! 😊",
            "Few tasks left! Keep it up! 🚀",
            "Picture abhi baaki hai mere dost! 😄",
             "Bas kuch hi kaam baaki hai, 'Jhakaas' progress! 😄"
        ],
        90: [
            "Last few steps! You got this! 🙌",
            "Almost done! Just a little more! 🚀",
            "Final touch left! Finish it well! 😎",
            "So close! One last push! ✨",
            "Picture abhi baaki hai mere dost! 😄",
            "Bas thoda aur! 🎉 'Abhi maza aayega na bhidu!' 😄"
        ],
        100: [
            "DoD completed! Super work! 🥇",
            "Bhai ne bola karne ka, toh kar diya! 😄",
            "Yeh kaam dekh ke mummy bhi proud hogi!' 😄",
            "Kaam khatam – ‘How’s the josh?’ HIGH, Sir! 🫡",
            "Definition of Done met! 🥇 You're a task master! 🫡"
        ],
        "Common": "Good progress! Keep it going! 🚀"
    }

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