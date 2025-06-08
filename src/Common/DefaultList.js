const veXDefaultPrompts = [
  {
    "name": "Summarize Ticket for Standup",
    "description": "Generate a concise summary of the ticket suitable for a daily standup update.",
    "template": "Create a 2-3 sentence summary of this ticket that I can share during standup. Include current status, any blockers, and what I'm working on next:\nTitle: {{title}}\nDescription: {{description}}\nStatus: {{status}}", "variables": [
      { "name": "title", "selector": "#ticket-title" },
      { "name": "description", "selector": "#ticket-description" },
      { "name": "status", "selector": "#ticket-status" }
    ]
  },
  {
    "name": "Generate Tasks for current ticket",
    "description": "Break down the current ticket into actionable tasks, each with a title, description, and estimated time.",
    "template": "Based on the following ticket, generate a list of development tasks. For each task, include:\n1. Task Title\n2. Task Description (1-2 sentences)\n3. Time Estimation (in hours)\n\nTicket Title: {{title}}\nTicket Description: {{description}}",
    "variables": [
      { "name": "title", "selector": "#ticket-title" },
      { "name": "description", "selector": "#ticket-description" }
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
    "template": "As an AI assistant, analyze the context of this code review  ticket. Based on the 'Description' (which may contain code snippets or links) and 'Comments', suggest potential areas for code improvement, common pitfalls, or adherence to best practices (e.g., performance, security, readability, maintainability). Focus on actionable feedback.\n\nCode Review Ticket Title: {{ title}}\nCode Review Description: {{ description}}\nCode Review Comments: {{ comments}}",
    "variables": [
      { "name": "title", "selector": "#issue-title" },
      { "name": "description", "selector": "#issue-description" },
      { "name": "comments", "selector": "#issue-comments" }
    ],
  },
  {
    "name": "Generate Test Case Scenarios",
    "description": "Generates a set of functional test case scenarios based on a user story or bug description.",
    "template": "As an AI assistant, generate a list of functional test case scenarios for the following  issue. Focus on positive, negative, and edge cases. Include preconditions, steps, and expected results. Use the 'Description' and 'Acceptance Criteria' fields for context.\n\nIssue Title: {{ title}}\nIssue Description: {{ description}}\nAcceptance Criteria: {{ acceptanceCriteria}}",
    "variables": [
      { "name": "title", "selector": "#issue-title" },
      { "name": "description", "selector": "#issue-description" },
      { "name": "acceptanceCriteria", "selector": "#issue-acceptance-criteria" }
    ],
  },
  {
    "name": "Estimate Story Points from Description",
    "description": "Provides a preliminary story point estimate for a user story based on its description and acceptance criteria.",
    "template": "As an AI assistant, provide a preliminary story point estimate (e.g., 1, 2, 3, 5, 8, 13) for the following  User Story. Justify your estimate based on perceived complexity, effort, and uncertainty. Consider the 'Description' and 'Acceptance Criteria'.\n\nUser Story Title: {{ title}}\nUser Story Description: {{ description}}\nAcceptance Criteria: {{ acceptanceCriteria}}",
    "variables": [
      { "name": " title", "selector": "#issue-title" },
      { "name": " description", "selector": "#issue-description" },
      { "name": " acceptanceCriteria", "selector": "#issue-acceptance-criteria" }
    ],
  },
  {
    "name": "Summarize Technical Discussion Thread",
    "description": "Condenses a long  comment thread or linked discussion into a concise summary of key decisions, action items, and outstanding questions.",
    "template": "As an AI assistant, summarize the following technical discussion thread ( comments or linked external discussion) into key decisions made, action items assigned, and any remaining open questions or unresolved points. Focus on technical implications.\n\nDiscussion Thread: {{ comments}}",
    "variables": [
      { "name": "comments", "selector": "#issue-comments" }
    ]
  }
];
const veXDefaultPromptsTone = {
  "Concise": "Use a clear and direct tone. Avoid unnecessary details or fluff. Summarize the key points briefly and efficiently.",
  "Technical": "Respond with precision and use appropriate engineering terminology. Ensure the explanation is thorough and suitable for a technical audience.",
  "Non-Technical": "Explain the content in simple, easy-to-understand language. Avoid jargon and make it accessible for non-technical stakeholders like customers or product managers.",
  "Action-Oriented": "Focus on actionable insights. Highlight clear next steps or recommended actions the user should take.",
  "Formal": "Maintain a professional and polished tone. Use language appropriate for documentation, reports, or external communication.",
  "Casual": "Use a relaxed and conversational tone, as if you're chatting with a teammate on Slack. Keep it friendly and informal.",
  "Critical Thinking": "Approach the content analytically. Identify assumptions, risks, or missing information, and suggest areas that may need further clarification.",
  "Support-Focused": "Write as if you're a customer support agent. Clearly explain the issue, provide guidance, and maintain a helpful and empathetic tone.",
  "Bullet Points": "Present the response in a clean and organized bulleted list for easy scanning and readability."
};

export {
  veXDefaultPrompts,
  veXDefaultPromptsTone
}