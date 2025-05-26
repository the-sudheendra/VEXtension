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
const checklistIconsUrl = {
    add: chrome.runtime.getURL("icons/add_24dp_000000.png"),
    edit: chrome.runtime.getURL("icons/edit_24dp_000000.png"),
    send: chrome.runtime.getURL("icons/send_24.png"),
    expand: chrome.runtime.getURL("icons/keyboard_arrow_down_24.png"),
    markAllCompleted: chrome.runtime.getURL("icons/done_all_24dp_FFFFFF.png"),
    logo: chrome.runtime.getURL("icons/fact_check_48_FFFFFF.png")
};
const promptIconsUrl = {
    send: chrome.runtime.getURL("icons/send_24.png"),
    expand: chrome.runtime.getURL("icons/keyboard_arrow_down_24.png"),
    close: chrome.runtime.getURL("icons/keyboard_arrow_up_24dp.png"),
    wrong: chrome.runtime.getURL("icons/close_24dp_000000.png")
}
const ChecklistUI = `
<header class="veX_header veX_banner">
    <div class="veX_logo_container">
        <img class="veX_logo" src="${checklistIconsUrl.logo}" title="Checklist Tool for OpenText ValueEdge" alt="VE Checklist">
    </div>
    <p class="veX_header_title"></p>
        <div class="veX_header_actions">
            <!--<img class="veX_mark_all_completed_icon" title="Mark all as completed" alt="Mark all as completed" src="${checklistIconsUrl.markAllCompleted}">-->
            <!--<span class="veX_mark_all_completed_txt">Mark all as completed</span>-->
        </div>
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
         <!-- <div class="veX_header_actions">
            <button id="mark-all-completed">Mark all as completed</button> 
        </div> -->
        <div class="veX_ui_list_container">
        </div>
    </div>
</div>
<div class="veX_banner veX_footer ">
    <div class="veX_segmented-button">
        <div class="veX_segment veX_footer_icon_container veX_leave_comment_btn">
        <img class="material-icons" alt="Leave a new comment" title="Leave a new comment" src="${checklistIconsUrl.add}"/>
             <span class="veX_leave_comment_btn_txt">Leave Comment</span> 
        </div>
         <div class=" veX_segment veX_footer_icon_container veX_edit_comment_btn">
         <img class="material-icons" alt="Edit exisiting comment" title="Edit exisiting comment" src="${checklistIconsUrl.edit}"/>
             <span class="veX_edit_comment_btn_txt">Edit Comment</span> 
        </div>
    </div>
</div>
`;

const PromptsUI = `
    <div class="veX_prompts_header">
        <h2 class="gradient-text">Aviator Prompts ✨</h2>
        <div class="veX_prompts_header_actions">
            <div class="veX_prompts_tone_selector_container">
            <label>Prompt Tone:</label>
            <div class="veX_prompts_tone_selector">
                <div class="veX_dropdown_selected">Conversational</div>
                    <div class="veX_dropdown_options">
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div id="veX_prompts_list_container">
      <h3>No prompts available. Please upload prompt.json.</h3>
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
    RightSidebarCommentButton: ".collapsable-panel",
    NewCommentBox: "[data-aid='comments-pane-add-new-comment-placeholder-state']",
    InputCommentBox: ".mqm-writing-new-comment-div",
    AddCommentButton: "[ng-click='comments.onAddNewCommentClicked()']",
    PhaseNode: "[data-aid='entity-life-cycle-widget-phase']",
    CollapseRightSidebar: ".collapsable-panel",
    CommentsContainer: "comment-lines",
    AviatorButton:"[data-aid='panel-item-label-aviatorPanel']"
}

const veXDefaultPrompts = [
    {
      "name": "Summarize Ticket for Standup",
      "description": "Generate a concise summary of the ticket suitable for a daily standup update.",
      "template": "Create a 2-3 sentence summary of this ticket that I can share during standup. Include current status, any blockers, and what I'm working on next:\nTitle: {{title}}\nDescription: {{description}}\nStatus: {{status}}",
      "variables": [
        { "name": "title", "selector": "#ticket-title" },
        { "name": "description", "selector": "#ticket-description" },
        { "name": "status", "selector": "#ticket-status" }
      ]
    },
    {
      "name": "Identify Dependencies",
      "description": "Analyze the ticket and identify potential dependencies or blockers.",
      "template": "Analyze this ticket and identify:\n1. Technical dependencies that must be completed first\n2. Team dependencies requiring coordination\n3. External dependencies outside our control\n4. Suggested actions to resolve each dependency\n\nTicket details:\n{{title}}\n{{description}}",
      "variables": [
        { "name": "title", "selector": "#ticket-title" },
        { "name": "description", "selector": "#ticket-description" }
      ]
    },
    {
      "name": "Draft Sprint Goal",
      "description": "Propose a measurable sprint goal based on selected tickets.",
      "template": "Based on these tickets, suggest a SMART sprint goal (Specific, Measurable, Achievable, Relevant, Time-bound) that aligns with our product vision. Include how we'll measure success by the end of the sprint.\n\nTickets:\n{{tickets}}",
      "variables": [
        { "name": "tickets", "selector": ".sprint-ticket-summary" }
      ]
    },
    {
      "name": "Generate Retrospective Topics",
      "description": "Create discussion points for retrospective based on sprint challenges.",
      "template": "Based on these completed tickets and their challenges, suggest 3-5 retrospective topics focusing on:\n1. What went well (celebrate successes)\n2. What could be improved (process issues)\n3. Action items (specific, actionable improvements)\n\nTickets from the sprint:\n{{sprintTickets}}",
      "variables": [
        { "name": "sprintTickets", "selector": ".sprint-completed-tickets" }
      ]
    },
    {
      "name": "Generate Acceptance Criteria",
      "description": "Create comprehensive, testable acceptance criteria following the Given-When-Then format.",
      "template": "Based on this ticket description, generate detailed acceptance criteria in Given-When-Then format. Include edge cases, error states, and clear success definitions. Focus on the user perspective and business value:\n\nTicket: {{title}}\n{{description}}",
      "variables": [
        { "name": "title", "selector": "#ticket-title" },
        { "name": "description", "selector": "#ticket-description" }
      ]
    },
    {
      "name": "Conduct Risk Assessment",
      "description": "Identify implementation risks and suggest mitigation strategies.",
      "template": "Conduct a thorough risk assessment for this ticket, analyzing:\n1. Technical risks (performance, security, scalability)\n2. Business risks (user adoption, stakeholder concerns)\n3. Team risks (skill gaps, capacity issues)\n4. Timeline risks (dependencies, scope uncertainties)\n5. Suggested mitigation strategies for each risk identified\n\nTicket details:\n{{title}}\n{{description}}",
      "variables": [
        { "name": "title", "selector": "#ticket-title" },
        { "name": "description", "selector": "#ticket-description" }
      ]
    },
    {
      "name": "Identify Documentation Needs",
      "description": "Determine documentation requirements based on the changes described.",
      "template": "Based on this ticket, identify all documentation that needs updating or creation:\n1. User documentation (guides, tutorials, FAQs)\n2. Technical documentation (APIs, architecture diagrams)\n3. Internal team documentation (processes, decision records)\n4. Testing documentation (test plans, QA scenarios)\n\nFor each item, explain why it needs updating and what specific content should be addressed.\n\nTicket: {{title}}\n{{description}}",
      "variables": [
        { "name": "title", "selector": "#ticket-title" },
        { "name": "description", "selector": "#ticket-description" }
      ]
    },
    {
      "name": "Create Developer Handoff Notes",
      "description": "Provide comprehensive context for developers starting implementation.",
      "template": "Generate detailed handoff notes for developers including:\n1. Business context and user value\n2. Technical approach considerations\n3. Known constraints or limitations\n4. Suggested implementation steps\n5. Testing considerations\n6. Security/performance requirements\n7. Points needing clarification\n\nTicket: {{title}}\n{{description}}",
      "variables": [
        { "name": "title", "selector": "#ticket-title" },
        { "name": "description", "selector": "#ticket-description" }
      ]
    },
    {
      "name": "Definition of Ready Checklist",
      "description": "Verify if the ticket meets all criteria to be ready for development.",
      "template": "Evaluate if this ticket meets our Definition of Ready by checking:\n1. Clear business value defined?\n2. Acceptance criteria complete and testable?\n3. Dependencies identified and resolved/planned?\n4. UI/UX designs available if needed?\n5. Technical approach agreed upon?\n6. Scope clearly defined and reasonably sized?\n7. Testing requirements specified?\n\nFor any missing items, provide specific improvement suggestions.\n\nTicket: {{title}}\n{{description}}",
      "variables": [
        { "name": "title", "selector": "#ticket-title" },
        { "name": "description", "selector": "#ticket-description" }
      ]
    },
    {
      "name": "Story Size Assessment",
      "description": "Evaluate if a story should be broken down into smaller pieces.",
      "template": "Analyze this user story for size and complexity. If it appears too large for a single sprint, suggest how to split it into smaller, independently valuable stories while preserving functionality. Consider technical complexity, uncertainty, and dependencies.\n\nTicket: {{title}}\n{{description}}",
      "variables": [
        { "name": "title", "selector": "#ticket-title" },
        { "name": "description", "selector": "#ticket-description" }
      ]
    },
    {
      "name": "Definition of Done Verification",
      "description": "Check if the ticket meets all Definition of Done criteria before closing.",
      "template": "Verify if this ticket meets our Definition of Done by checking:\n1. All acceptance criteria demonstrably met?\n2. Code reviewed and approved?\n3. Tests written and passing?\n4. Documentation updated?\n5. Performance impact considered?\n6. Security requirements addressed?\n7. Accessibility standards met?\n8. Product Owner reviewed and approved?\n\nHighlight any missing items that need addressing before closing.\n\nTicket: {{title}}\n{{description}}\n{{comments}}",
      "variables": [
        { "name": "title", "selector": "#ticket-title" },
        { "name": "description", "selector": "#ticket-description" },
        { "name": "comments", "selector": "#ticket-comments" }
      ]
    },
    {
      "name": "Write Technical Implementation Plan",
      "description": "Generate a technical approach for implementing the ticket.",
      "template": "Based on this ticket, create a technical implementation plan including:\n1. System components affected\n2. Data model changes needed\n3. API endpoints to modify/create\n4. Suggested architecture approach\n5. Testing strategy (unit, integration, E2E)\n6. Deployment considerations\n7. Monitoring/observability needs\n\nTicket: {{title}}\n{{description}}",
      "variables": [
        { "name": "title", "selector": "#ticket-title" },
        { "name": "description", "selector": "#ticket-description" }
      ]
    },
    {
      "name": "Convert Requirements to User Story",
      "description": "Transform detailed requirements into a well-structured user story.",
      "template": "Convert these requirements into a properly formatted user story following the pattern 'As a [type of user], I want [goal] so that [benefit]'. Include acceptance criteria, background context, and any technical notes. Make sure the story is focused on user value:\n\nRequirements: {{description}}",
      "variables": [
        { "name": "description", "selector": "#ticket-description" }
      ]
    },
    {
      "name": "Test Case Generator",
      "description": "Create comprehensive test cases based on ticket requirements.",
      "template": "Generate detailed test cases for this ticket including:\n1. Happy path scenarios\n2. Edge cases and boundary conditions\n3. Error/exception handling scenarios\n4. Performance considerations\n5. Security testing scenarios\n\nFor each case, include preconditions, steps to execute, and expected results.\n\nTicket: {{title}}\n{{description}}",
      "variables": [
        { "name": "title", "selector": "#ticket-title" },
        { "name": "description", "selector": "#ticket-description" }
      ]
    },
    {
      "name": "Estimate Story Points",
      "description": "Suggest story point estimation based on complexity analysis.",
      "template": "Analyze this user story and suggest an appropriate story point estimate (using Fibonacci: 1, 2, 3, 5, 8, 13). Consider:\n1. Technical complexity\n2. Uncertainty and risk\n3. Amount of work required\n4. Dependencies and coordination needed\n\nProvide reasoning for your estimate to help team discussion.\n\nTicket: {{title}}\n{{description}}",
      "variables": [
        { "name": "title", "selector": "#ticket-title" },
        { "name": "description", "selector": "#ticket-description" }
      ]
    },
    {
      "name": "Sprint Planning Preparation",
      "description": "Prepare key points to discuss during sprint planning for this ticket.",
      "template": "Help me prepare for discussing this ticket in sprint planning by highlighting:\n1. Key implementation considerations\n2. Questions that need answering before work begins\n3. Dependencies that might affect scheduling\n4. Resource or skill requirements\n5. Suggested approach for breaking down the work\n\nTicket: {{title}}\n{{description}}",
      "variables": [
        { "name": "title", "selector": "#ticket-title" },
        { "name": "description", "selector": "#ticket-description" }
      ]
    },
    {
      "name": "Clarify Ambiguous Requirements",
      "description": "Identify vague or ambiguous aspects of the ticket that need clarification.",
      "template": "Review this ticket and identify any ambiguous or unclear requirements. For each ambiguity found, craft a specific clarifying question to ask the Product Owner or stakeholders. Also suggest potential interpretations of each ambiguity.\n\nTicket: {{title}}\n{{description}}",
      "variables": [
        { "name": "title", "selector": "#ticket-title" },
        { "name": "description", "selector": "#ticket-description" }
      ]
    },
    {
      "name": "Bug Report Enhancement",
      "description": "Improve a bug report with structured information for faster resolution.",
      "template": "Enhance this bug report by structuring it with:\n1. Clear description of expected vs. actual behavior\n2. Step-by-step reproduction steps\n3. Environment details needed\n4. Potential impact assessment\n5. Suggested areas of the codebase to investigate\n6. Screenshots or logs needed (with placeholders)\n\nOriginal bug: {{description}}",
      "variables": [
        { "name": "description", "selector": "#ticket-description" }
      ]
    },
    {
      "name": "Write Release Notes",
      "description": "Generate user-friendly release notes from completed tickets.",
      "template": "Create user-friendly release notes based on these completed tickets. Organize by feature categories, highlight key user benefits, explain any changes to existing functionality, and note any required user actions.\n\nCompleted tickets:\n{{completedTickets}}",
      "variables": [
        { "name": "completedTickets", "selector": ".release-tickets" }
      ]
    },
    {
      "name": "Create Implementation Subtasks",
      "description": "Break down a user story into specific implementation subtasks.",
      "template": "Break down this user story into 5-8 specific implementation subtasks. For each subtask, provide:\n1. Clear, actionable title\n2. Brief description of work required\n3. Logical sequence/dependencies between subtasks\n4. Estimated effort (Small/Medium/Large)\n\nParent story: {{title}}\n{{description}}",
      "variables": [
        { "name": "title", "selector": "#ticket-title" },
        { "name": "description", "selector": "#ticket-description" }
      ]
    },
    {
      "name": "Analyze Team Velocity",
      "description": "Provide insights on team velocity and capacity planning based on historical data.",
      "template": "Analyze our team's velocity data and provide insights on:\n1. Velocity trend analysis (improving, stable, declining?)\n2. Factors potentially affecting our velocity\n3. Suggested capacity for next sprint\n4. Recommendations for improving predictability\n\nRecent sprints velocity data:\n{{velocityData}}",
      "variables": [
        { "name": "velocityData", "selector": ".velocity-data" }
      ]
    },
    {
        "name": "Suggest Code Review Improvements",
        "description": "Analyzes a code review ticket and suggests potential areas for improvement based on common patterns or best practices.",
        "template": "As an AI assistant, analyze the context of this code review  ticket. Based on the 'Description' (which may contain code snippets or links) and 'Comments', suggest potential areas for code improvement, common pitfalls, or adherence to best practices (e.g., performance, security, readability, maintainability). Focus on actionable feedback.\n\nCode Review Ticket Title: {{ title}}\nCode Review Description: {{ description}}\nCode Review Comments: {{ comments.all}}",
        "variables": [
          { "name": "title", "selector": "#issue-title" },
          { "name": "description", "selector": "#issue-description" },
          { "name": "comments", "selector": "#issue-comments" }
        ],
      },
      {
        "name": "Generate Test Case Scenarios",
        "description": "Generates a set of functional test case scenarios based on a user story or bug description.",
        "template": "As an AI assistant, generate a list of functional test case scenarios for the following Jira issue. Focus on positive, negative, and edge cases. Include preconditions, steps, and expected results. Use the 'Description' and 'Acceptance Criteria' fields for context.\n\nIssue Title: {{ title}}\nIssue Description: {{ description}}\nAcceptance Criteria: {{ acceptanceCriteria}}",
        "variables": [
          { "name": "title", "selector": "#issue-title" },
          { "name": "description", "selector": "#issue-description" },
          { "name": "acceptanceCriteria", "selector": "#issue-acceptance-criteria" }
        ],
      },
      {
        "name": "Estimate Story Points from Description",
        "description": "Provides a preliminary story point estimate for a user story based on its description and acceptance criteria.",
        "template": "As an AI assistant, provide a preliminary story point estimate (e.g., 1, 2, 3, 5, 8, 13) for the following Jira User Story. Justify your estimate based on perceived complexity, effort, and uncertainty. Consider the 'Description' and 'Acceptance Criteria'.\n\nUser Story Title: {{ title}}\nUser Story Description: {{ description}}\nAcceptance Criteria: {{ acceptanceCriteria}}",
        "variables": [
          { "name": " title", "selector": "#issue-title" },
          { "name": " description", "selector": "#issue-description" },
          { "name": " acceptanceCriteria", "selector": "#issue-acceptance-criteria" }
        ],
      },
      {
        "name": "Summarize Technical Discussion Thread",
        "description": "Condenses a long Jira comment thread or linked discussion into a concise summary of key decisions, action items, and outstanding questions.",
        "template": "As an AI assistant, summarize the following technical discussion thread (Jira comments or linked external discussion) into key decisions made, action items assigned, and any remaining open questions or unresolved points. Focus on technical implications.\n\nDiscussion Thread: {{ comments.all}}",
        "variables": [
          { "name": "comments.all", "selector": "#issue-comments" }
        ]
      }   

  ];
  const veXDefaultPromptsTone = {
    "Concise": "Provide a concise summary of the key points discussed in the technical discussion thread.",
    "Technical": "Respond with a detailed explanation suitable for a technical audience, using engineering terms and logic.",
    "Non-Technical": "Explain the content in simple terms suitable for non-technical stakeholders like customers or product managers.",    
    "Action-Oriented": "Summarize the content with a focus on next steps or action items the user should take.",
    "Formal": "Use a professional and formal tone suitable for documentation or external communication.",
    "Casual": "Use a friendly and informal tone as if you're explaining it to a teammate in a Slack message.",
    "Critical Thinking": "Analyze the content deeply and highlight assumptions, risks, or missing pieces that require clarification.",
    "Support-Focused": "Craft the response as if you're a support agent explaining the issue to a customer.",
    "Summarized with Bullet Points": "Return the answer in a clean, bulleted format for easy readability.",
    "Release Note Style": "Format the content as a release note entry for inclusion in changelogs or customer updates.",
    "Direct": "Be straightforward and to the point, avoiding fluff or overly detailed explanations.",
    "Pragmatic": "Focus on realistic, practical solutions that can be implemented with minimal effort.",
    "Respectful": "Use a polite, diplomatic tone especially when identifying potential issues or improvement areas.",
    "Corporate": "Maintain a polished, conservative tone appropriate for senior stakeholders or official communication.",
    "Humble": "Acknowledge that there may be alternative interpretations or room for improvement in the suggestion.",
    "Silly": "Add a light, humorous tone to the response while preserving the core information.",
    "Chill": "Use a relaxed, informal style as if casually explaining something to a colleague.",
    "Outside the Box": "Offer creative, unconventional ideas that go beyond standard approaches."
  };


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
    "DoneMessages": {
        "10": [
            "Let's start the work! 🚀",
            "Nice and easy — just getting into the groove! 🎯",
            "Checklist started — good beginning! ✅"
        ],
        "25": [
            "Good start! Keep it up! 💪",
            "Work has begun! Let’s roll! 🔥",
            "This is just the warm-up... the real fun begins now! 😉",
            "The party’s just getting started! 🔥"
        ],
        "50": [
            "Half the work’s done! Great going! 👏",
            "You’re crushing it! Keep up the momentum! 🔥",
            "Midway milestone reached 🚀",
            "Just a bit more push – 'All is well, remember?' 😄"
        ],
        "75": [
            "Just a few tasks left! You're on fire! 🚀",
            "Getting close — let’s wrap it up strong! 💪",
            "Great effort — you're in the final lap! 😄",
        ],
        "90": [
            "Last few steps! You got this! 🙌",
            "Almost done! Just a little more hustle! 🚀",
            "Just a final touch! Wrap it up in style! 😎",
            "So close! One final push! ✨",
            "Almost there! 🎉 'Now it’s gonna be fun, pal!' 😄",
            "Just a little more — you're nearly through! 🎉"
        ],
        "100": [
            "DoD completed! Super work! 🥇",
            "When you said you’d do it – you *actually* did! 😄",
            "Mission complete – ‘How’s the josh?’ HIGH, Sir! 🫡",
            "Definition of Done met! 🥇 You’re the boss of tasks! 🫡",
            "Checklist completed — fantastic work! 🥇",
            "Great job — everything's marked complete! ✅",
            "Clean sweep — well done! 🧹"
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

export {
    EntityMetaData,
    ChecklistUI,
    ValueEdgeNodeSelectors,
    VEChecklistNodeSelectors,
    ErrorMessages,
    Notifications,
    VEPhaseOrder,
    CheckListStatus,
    NotificationType,
    PromptsUI,
    checklistIconsUrl,
    promptIconsUrl,
    veXDefaultPrompts,
    veXDefaultPromptsTone
};