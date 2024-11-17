# VE Xtension
A browser extension that enhances the OpenText ValueEdge platform with additional features for teams.

## Features
- Displays relevant DoD checkList based on the currently opened ticket and its status.

- Reminds users to review and complete DoD checkList when changing ticket phases.

- Allows users to add completed DoD checkList in comments to track and maintain a record of the completion status for each DoD item.

- Currently available exclusively for Google Chrome. Plans for support of additional browsers in future releases

## How to Use the Extension
* Open a ValueEdge ticket in your browser.
* Right-click anywhere on the page.
* In the context menu, you will see an option called "DoD Checklist."
* Click on "DoD Checklist" to open a pop-up displaying the Done Checklist for the ticket.
![Screenshot for DoDcheckList](Screenshots/DoDCheckList.png)

## How to Upload a Definition of Done (DoD) File:
Right-click the extension icon in your browser's toolbar, then select 'Options' from the menu. This will open the options page, where you can upload a new DoD file (If you encounter issues, please ensure the file is not empty and follows the required schema).
![Screenshot for optionpage](Screenshots/OptionPage.png)

## Definition of Done (DoD) Schema 

### Keys

```
  entityName
```

| Key | Type     | Description                | Supported Entity Types|
| :-------- | :------- | :------------------------- |:------------------------- |
| `entityName` | `string` | **Required** .The name of the entity associated with the DoD Example: "User Story", "Spike"  | `"Epic","Feature","Defect","Enhancement","CPE Incident","User Story","Internal","Spike","Task"`



```
  categories
```

| Key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `categories`      | `array` | **Required** A list of categories for the entity, each containing specific checklists (*required*).categories |

#### **Please note** that the schema is case-sensitive. Ensure that all keys and values match the required casing exactly.


## Example DoD

```JSON
{
"Defect": {
    "title": "Defect",
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
    ]
},
"Spike": {
    "title": "Spike",
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
    ]
  }
}
```