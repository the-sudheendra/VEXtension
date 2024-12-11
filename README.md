<div align="center">
    <h1>
    VE Checklist
    <h1>
    <p>Checklist Tool for OpenText ValueEdge platform.</p>
    <img width = "10%" height="10%" src="https://media.tenor.com/00XAJzV4AqAAAAAM/checklist.gif" alt="Checklist.gif"> 
    <div align="center">
        <img width = "20%" src="https://img.shields.io/badge/Google_chrome-4285F4?style=for-the-badge&logo=Google-chrome&logoColor=white">
        <img width = "20%" src="https://img.shields.io/badge/Microsoft_Edge-0078D7?style=for-the-badge&logo=Microsoft-edge&logoColor=white">
    </div>
</div>


## Features 🚀
- Displays relevant Definition of Done (DoD) & Definition of Ready (DOR) Checklist based on the currently opened ticket and its status.
- Reminds users to review and complete Checklist when changing ticket phases.
- Users can create their own customized Checklist based on their project requirements.
- Allows users to add completed Checklist in comments to track and maintain a record of the completion status for each item.

## How to 💡
**Use the Extension?**
* Open a ValueEdge ticket in your browser.
* Right-click anywhere on the page.
* In the context menu, you will see an option called "DoD Checklist".
* Click on it to open a pop-up displaying the Done Checklist for the ticket.


<div align="center" style="text-align: center;">
    <img src="screenshots/Defect-Checklist.png" style="width: 45%; display: inline-block; margin: 0 10px;" alt="Screenshot for the Defect Checklist">
    <img src="screenshots/Spike-Checklist.png" style="width: 45%; display: inline-block; margin: 0 10px;" alt="Screenshot for the Spike Checklist">
</div>


**Upload Checklist?**

Right-click the extension icon in your browser's toolbar, then select 'Options' from the menu. This will open the options page, where you can upload a new DoD file (If you encounter issues, please ensure the file is not empty and follows the below mentioned schema)
<div align="center" style="text-align: center;">
    <img src="screenshots/Upload-Checklist.png" style="width: 70%;height:70%; display: inline-block; margin: 0 10px;" alt="Screenshot for the Upload Checklis">
</div>

#### Ticket Schema

```json
{
   "Defect": {
      "categories": {
         "Investigation": {
            "checklist": [
               "Reproduce the issue",
               "Gather logs and screenshots",
               "Determine root cause",
               "Document findings"
            ]
         },
         "Resolution": {
            "checklist": [
               "Implement fix",
               "Run regression tests",
               "Confirm issue resolution",
               "Close defect after verification"
            ]
         }
      }
   },
   "CPE Incident": {
      "categories": {
         "Intake": {
            "checklist": [
               "Log support ticket",
               "Identify user issue",
               "Classify urgency and assign priority",
               "Assign to support team"
            ]
         },
         "Resolution": {
            "checklist": [
               "Provide solution or workaround",
               "Communicate with user",
               "Confirm issue resolution",
               "Close support ticket"
            ]
         }
      }
   },
   "Spike": {
      "categories": {
         "Exploration": {
            "checklist": [
               "Identify technical questions",
               "Review relevant documentation",
               "Build simple prototype",
               "Evaluate technical feasibility"
            ]
         },
         "Conclusion": {
            "checklist": [
               "Summarize findings",
               "Present results to the team",
               "Document next steps",
               "Archive research notes"
            ]
         }
      }
   }
}
```
**Please note ⚠️**
- The schema is case-sensitive. Ensure that all keys and values match the required casing exactly.
- Whenever you refresh this extension, please do refresh the currently opened ValueEdge pages
