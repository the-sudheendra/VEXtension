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
const listTypes = {
    "checklist": 0,
    "prompts": 1
}

const defaultCheklistRemoteURL = "https://the-sudheendra.github.io/VEXHub/Checklist/DefaultChecklist.json";
const defaultPromptsRemoteURL = "https://the-sudheendra.github.io/VEXHub/AviatorPrompts/DefaultPrompts.json";
const defaultPromptsTonesURL = "https://the-sudheendra.github.io/VEXHub/AviatorPromptsTones/DefaultPromptsTone.json";


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
    RightSidebarCommentButton: ".collapsable-panel",
    NewCommentBox: "[data-aid='comments-pane-add-new-comment-placeholder-state']",
    InputCommentBox: ".mqm-writing-new-comment-div",
    AddCommentButton: "[ng-click='comments.onAddNewCommentClicked()']",
    PhaseNode: "[data-aid='entity-life-cycle-widget-phase']",
    CollapseRightSidebar: ".collapsable-panel",
    CommentsContainer: "comment-lines",
    AviatorButton: "[data-aid='panel-item-aviatorPanel']",
    CommentButton: "[data-aid='panel-item-commentsPanel']",
    AviatorTextArea: "[data-aid='chat-with-entity-panel-bottom-section-textarea']",
    AviatorPromptSubmitButton: "[data-aid = 'chat-with-entity-panel-bottom-section-on-submit-btn']"
}


const ErrorMessages = {
    UnHandledException: [
    "Oops! Sorry for the inconvenience 😔<br>$0 failed – $1.<br>Please report this issue <a href='https://github.com/the-sudheendra/VEXtension/issues' target='_blank' rel='noopener noreferrer'>here</a>.<br>– Team VEXtension"
    ],
    SomethingWentWrong: [
    "Oops! Something went wrong.<br>Sorry for the inconvenience 😔<br>Please report the issue <a href='https://github.com/the-sudheendra/VEXtension/issues' target='_blank' rel='noopener noreferrer'>here</a>.<br>– Team VEXtension",
    ]
}

const Notifications = {
    SelectAtLeastOneItem: [
        "Please select at least one item to continue."
    ],
    ChecklistSavedSuccessfully: [
        "🚀 Your checklist is saved! Time to tackle those tasks! 💪"
    ],
    AviatorPromptsSavedSuccessfully: [
        "💡 Prompts saved. Next stop: smarter decisions!"
        ],
    ReminderToUpdateChecklist: [
        "🔔 Reminder: Don't forget to update the checklist! 😊",
        "📝 Hey there! Give your checklist a quick update before switching phases.",
        "💡 Reminder: A quick checklist update would be great! 😊",
        "🔔 Tiny task: Just update the checklist when you have a moment!",
        "📝 Checklist needs a little love! Give it a quick update.",
        "🤔 Did you forget something? The checklist needs an update!",
        "😊 No rush! Just a gentle nudge to update the checklist.",
        "✅ You're doing great! Just update the checklist and keep going!",
        "✏️ Don't forget to update the checklist!",
        "📌 A quick checklist update, please!",
        "🔄 Time for a small checklist update!",
        "📝 Just a tiny update needed for the checklist!",
        "⏳ Quick check—update the checklist when ready!",
        "🛠 Almost there! Just update the checklist.",
        "🎯 Quick checklist update, and you're good!",
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
        "🤔 No ticket opened yet. Open a ticket to view the checklist",
        "✨ Almost there! Open a ticket to see the checklist.",
    ],
    OpenTicketToSeePrompts: [
        "🤔 No ticket opened yet. Open a ticket to view the Aviator Prompts."
    ],
    UnableToFindChecklist: [
       "📋 No checklist found for '$0'. Consider uploading one."
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
        "🤔 No checklist found—it may still be loading or you can create a new one!",
    ],
    ChecklistEditSuccess: [
        "📝 Checklist updated! Review the changes and save.",
        "📝 Checklist edited successfully! Take a look and save.",
    ],
    NotAbleToEditComment: [
        "This comment can't be edited. Add a new one instead."
    ],
    DoneMessages: {
        "10": [
            "Let's start the work! 🚀",
            "Nice and easy — just getting into the groove! 🎯",
            "Checklist started — good beginning! ✅"
        ],
        "25": [
            "Good start! Keep it up! 💪",
            "Work has begun! Let's roll! 🔥",
            "This is just the warm-up... the real fun begins now! 😉",
            "The party's just getting started! 🔥"
        ],
        "50": [
            "Half the work's done! Great going! 👏",
            "You're crushing it! Keep up the momentum! 🔥",
            "Midway milestone reached 🚀",
            "Just a bit more push – 'All is well, remember?' 😄"
        ],
        "75": [
            "Just a few tasks left! You're on fire! 🚀",
            "Getting close — let's wrap it up strong! 💪",
            "Great effort — you're in the final lap! 😄",
        ],
        "90": [
            "Last few steps! You got this! 🙌",
            "Almost done! Just a little more hustle! 🚀",
            "Just a final touch! Wrap it up in style! 😎",
            "So close! One final push! ✨",
            "Almost there! 🎉 'Now it's gonna be fun, pal!' 😄",
            "Just a little more — you're nearly through! 🎉"
        ],
        "100": [
            "When you said you'd do it – you *actually* did! 😄",
            "Mission complete – 'How's the josh?' HIGH, Sir! 🫡",
            "Definition of Done met! 🥇 You're the boss of tasks! 🫡",
            "Checklist completed — fantastic work! 🥇",
            "Great job — everything's marked complete! ✅",
            "All tasks done. This ticket is cleaner than your weekend plans. 😉",
            "Every box is ticked. The ticket is at peace. So are we. 🥳",
            "The only thing left is to brag about it in the stand-up tomorrow. 🤣"
        ],
        "Common": "Good progress! Keep it going! 🚀"
    }
}

const StatusColors = {
    Completed: "#1aa364",
    NotCompleted: "#dd4a40",
    NotApplicable: "#808080",
    NotSelected: "#666666"
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

export {
    EntityMetaData,
    ValueEdgeNodeSelectors,
    VEChecklistNodeSelectors,
    ErrorMessages,
    Notifications,
    VEPhaseOrder,
    CheckListStatus,
    NotificationType,
    listTypes,
    defaultCheklistRemoteURL,
    defaultPromptsRemoteURL,
    defaultPromptsTonesURL,
    StatusColors
};