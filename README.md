<div align="center">
   <div align="center" style="text-align: center;">
      <b>VE Checklist </b> 
      <span><img alt="Version" src="https://img.shields.io/chrome-web-store/v/aeiiagpokicaeifancpnndjanamdmmdn?style=flat-square&label=latest&labelColor=white&color=white&link=https%3A%2F%2Fchromewebstore.google.com%2Fdetail%2Fve-checklist%2Faeiiagpokicaeifancpnndjanamdmmdn%2Freviews"/> </span> 
   </div>
   <h4>Checklist Tool for OpenText ValueEdge platform.</h4>
<div style="text-align: center;">
  <a href="https://chromewebstore.google.com/detail/ve-checklist/aeiiagpokicaeifancpnndjanamdmmdn/reviews" target="_blank" rel="noopener noreferrer">
    Download from Chrome Web Store
  </a>
</div>

<p style="text-align: center;">
  Above link works with all Chromium-based browsers, including <b>Microsoft Edge</b>, <b>Brave</b>, <b>Opera</b>, and others.
</p>
</div>


## Features 🚀
- Displays relevant Definition of Done (DoD) & Definition of Ready (DOR) Checklist based on the currently opened ticket and its status.
- Reminds users to review and complete Checklist when changing ticket phases.
- Users can create their own customized Checklist based on their project requirements.
- Users can add text or HTML notes to each checklist, and these notes will be included in the comments
- Allows users to add completed Checklist in comments to track and maintain a record of the completion status for each item.

## How to 💡
**Use the Extension?**
* Open a ValueEdge ticket in your browser.
* Right-click anywhere on the page.
* In the context menu, you will see an option called **VE Checklist**.
* Click on it to open a pop-up displaying the Done Checklist for the ticket.


#### Example Checklist

```json
{
  "Defect": {
    "categories": {
      "Reproduction": {
        "checklist": [
          "Steps to reproduce the issue are clearly documented",
          "Actual vs expected behavior is described",
          "Screenshots or logs are attached, if applicable"
        ],
        "phases": ["New", "In Progress"]
      },
      "Resolution": {
        "checklist": [
          "Root cause analysis is documented",
          "Solution has been tested and verified",
          "All relevant stakeholders are informed of the fix",
          "Test cases are updated to cover the issue"
        ],
        "phases": ["Done", "Resolved"]
      }
    }
  },
  "Spike": {
    "categories": {
      "Planning": {
        "checklist": [
          "Objective of the spike is clearly defined",
          "Expected deliverables are documented",
          "Team has agreed on a timebox for the spike"
        ],
        "phases": ["New", "In Progress"]
      },
      "Analysis": {
        "checklist": [
          "Relevant research and findings are documented",
          "Any discovered blockers or risks are noted",
          "Recommendations or next steps are provided"
        ],
        "phases": ["Done", "Resolved"]
      }
    }
  }
}
```
Get started with the **[predefined checklists](https://github.com/the-sudheendra/ChecklistHub)** ✅.

**Please note ⚠️**
- The schema is case-sensitive. Ensure that all keys and values match the required casing exactly.
- Whenever you refresh this extension, please do refresh the currently opened ValueEdge pages


## Third-Party Libraries

This project uses the following open-source libraries:

- [Quill](https://quilljs.com) — BSD 3-Clause License
- [DOMPurify](https://github.com/cure53/DOMPurify) — Apache License 2.0

See the [THIRD_PARTY_LICENSES](./third_party_licenses) folder for full license texts and attribution notices.

