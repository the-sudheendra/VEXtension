//**Declaration**
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
var veXDODInfo = {
  "Epic": {
    "title": "Epic",
    "desc": "A large, overarching initiative that groups multiple related features and user stories to achieve a significant objective.",
    "categories": [
      {
        "name": "Planning",
        "checkList": [
          "Define the overall objective",
          "Identify necessary features",
          "Prioritize tasks within the Epic",
          "Allocate resources"
        ]
      },
      {
        "name": "Tracking",
        "checkList": [
          "Monitor feature progress",
          "Adjust timelines as needed",
          "Communicate updates to stakeholders",
          "Ensure alignment with product goals"
        ]
      }
    ],
    "metaData": {
      "priority": "High",
      "estimatedCompletion": "3-6 months"
    }
  },
  "Feature": {
    "title": "Feature",
    "desc": "A standalone piece of functionality that provides specific value to users and supports an Epic’s goal.",
    "categories": [
      {
        "name": "Design",
        "checkList": [
          "Outline user flow",
          "Create wireframes or prototypes",
          "Review designs with stakeholders",
          "Finalize design requirements"
        ]
      },
      {
        "name": "Development",
        "checkList": [
          "Write feature code",
          "Conduct code reviews",
          "Integrate with existing systems",
          "Deploy to staging environment"
        ]
      }
    ],
    "metaData": {
      "priority": "Medium",
      "estimatedCompletion": "4-6 weeks"
    }
  },
  "Defect": {
    "title": "Defect",
    "desc": "A bug or issue that causes incorrect or undesired functionality, impacting user experience or system performance.",
    "categories": [
      {
        "name": "Investigation",
        "checkList": [
          "Reproduce the issue",
          "Gather logs and screenshots",
          "Determine root cause",
          "Document findings"
        ]
      },
      {
        "name": "Resolution",
        "checkList": [
          "Implement fix",
          "Run regression tests",
          "Confirm issue resolution",
          "Close defect after verification"
        ]
      }
    ],
    "metaData": {
      "severity": "High",
      "impactArea": "User Interface"
    }
  },
  "Enhancement": {
    "title": "Enhancement",
    "desc": "A modification to improve functionality, usability, or performance of an existing feature.",
    "categories": [
      {
        "name": "Requirement Analysis",
        "checkList": [
          "Identify enhancement goals",
          "Review user feedback",
          "Determine scope of changes",
          "Get approvals from stakeholders"
        ]
      },
      {
        "name": "Implementation",
        "checkList": [
          "Modify existing code",
          "Run unit and integration tests",
          "Deploy to staging",
          "Gather feedback on enhancement"
        ]
      }
    ],
    "metaData": {
      "priority": "Low",
      "expectedImpact": "User Satisfaction"
    }
  },
  "CPE Incident": {
    "title": "Support Request",
    "desc": "A user or customer request for assistance with a product issue or inquiry about functionality.",
    "categories": [
      {
        "name": "Intake",
        "checkList": [
          "Log support ticket",
          "Identify user issue",
          "Classify urgency and assign priority",
          "Assign to support team"
        ]
      },
      {
        "name": "Resolution",
        "checkList": [
          "Provide solution or workaround",
          "Communicate with user",
          "Confirm issue resolution",
          "Close support ticket"
        ]
      }
    ],
    "metaData": {
      "responseTimeTarget": "24 hours",
      "satisfactionScore": "Pending"
    }
  },
  "User Story": {
    "title": "User Story",
    "desc": "A brief, user-centered narrative describing a feature or function from the end user's perspective.",
    "categories": [
      {
        "name": "Definition",
        "checkList": [
          "Write user story in standard format",
          "Define acceptance criteria",
          "Prioritize with product owner",
          "Estimate story effort",
          "Write user story in standard format",
          "Define acceptance criteria",
          "Prioritize with product owner",
          "Estimate story effort",
          "Write user story in standard format",
          "Define acceptance criteria",
          "Prioritize with product owner",
          "Estimate story effort",
          "Write user story in standard format",
          "Define acceptance criteria",
          "Prioritize with product owner",
          "Estimate story effort",
          "Write user story in standard format",
          "Define acceptance criteria",
          "Prioritize with product owner",
          "Estimate story effort"
        ]
      },
      {
        "name": "Development and Testing",
        "checkList": [
          "Implement code changes",
          "Run unit tests",
          "Conduct code review",
          "User acceptance testing (UAT)"
        ]
      }
    ],
    "metaData": {
      "priority": "High",
      "assignedSprint": "Sprint 12"
    }
  },
  "Spike": {
    "title": "Spike",
    "desc": "A research task to investigate or prototype a solution for a technical or design challenge.",
    "categories": [
      {
        "name": "Exploration",
        "checkList": [
          "Identify technical questions",
          "Review relevant documentation",
          "Build simple prototype",
          "Evaluate technical feasibility"
        ]
      },
      {
        "name": "Conclusion",
        "checkList": [
          "Summarize findings",
          "Present results to the team",
          "Document next steps",
          "Archive research notes"
        ]
      }
    ],
    "metaData": {
      "priority": "Medium",
      "timebox": "1 week"
    }
  },
  "Documentation": {
    "title": "Documentation",
    "desc": "A task to create, update, or improve project documentation for reference and understanding.",
    "categories": [
      {
        "name": "Preparation",
        "checkList": [
          "Identify documentation goals",
          "Gather necessary resources",
          "Set documentation standards",
          "Outline key topics"
        ]
      },
      {
        "name": "Writing and Review",
        "checkList": [
          "Draft initial documentation",
          "Conduct peer review",
          "Revise based on feedback",
          "Publish final version"
        ]
      }
    ],
    "metaData": {
      "lastUpdated": "2023-08-14",
      "targetAudience": "Developers and stakeholders"
    }
  }
}
//**Declaration**

//**Utility Functions**
async function readJsonFile(file) {
  await fetch(file).then((response) => response.json().then(function (data) {
    veXDODInfo = data;
  }));
}
//**Utility Functions**

//**Event Handlers**
async function onInstalled() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'veXDoneCheckListMenu',
      title: 'Done Definition',
      documentUrlPatterns: ["https://ot-internal.saas.microfocus.com/*"],
      contexts: ['page']
    }
    );
  });
  await readJsonFile(chrome.runtime.getURL("definitions.json"));
  chrome.storage.sync.set({ veXDoneDefinations: veXDODInfo }, () => { console.info("Successfully Saved definations..") });

}
async function handleMessages(request, sender, sendResponse) {
  switch (request) {
    case 'getveXEntityMetaData':
      sendResponse(veXEntityMetaData);
      break;
    case 'loadveXDefinationsData':
      sendResponse(veXDODInfo);
      break;
  }
}
function onContextMenuClick(info, tab) {
  if (info.menuItemId === "veXDoneCheckListMenu") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, "openVexPopUp");
    });
  }
}
async function getveXDefinations() {
  if (Object.keys(veXDODInfo).length == 0) {
    veXDODInfo = await chrome.storage.sync.get("veXDoneDefinations");
  }
  return veXDODInfo;
}
//**Event Handlers**
chrome.runtime.onInstalled.addListener(onInstalled);
chrome.contextMenus.onClicked.addListener(onContextMenuClick);
chrome.runtime.onMessage.addListener(handleMessages);

