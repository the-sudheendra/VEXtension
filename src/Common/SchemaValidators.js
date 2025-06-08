var Util;
var Constants;

async function loadModules() {
  let URL = chrome.runtime.getURL("src/Common/Util.js");
  if (!Util)
      Util = await import(URL);
  URL = chrome.runtime.getURL("src/Common/Constants.js");
  if (!Constants)
      Constants = await import(URL);
}

await loadModules();
//Start Checklist Validation

function validateChecklist(veXChecklistInfo) {
    try {
      if (!veXChecklistInfo) {
        Util.notify("The checklist data is missing. Please provide a valid JSON file.", "error", true);
        return false;
      }
  
      if (Object.keys(veXChecklistInfo).length === 0) {
        Util.notify("The checklist JSON file appears to be empty. Please upload a valid file to continue.", Constants.NotificationType.Error, true);
        return false;
      }
  
      const entitiesArray = Object.keys(veXChecklistInfo);
      for (const ticketEntityName of entitiesArray) {
        const entityChecklist = veXChecklistInfo[ticketEntityName];
  
        if (!entityChecklist) {
          Util.notify(`The '${ticketEntityName}' entity is null or undefined. Please provide valid data.`, "error", true);
          return false;
        }
  
        if (Object.keys(entityChecklist).length === 0) {
          Util.notify(`It looks like the '${ticketEntityName}' entity is empty. Please add the necessary fields to continue.`, Constants.NotificationType.Error, true);
          return false;
        }
  
        if (!entityChecklist.hasOwnProperty("categories")) {
          Util.notify(`The 'categories' is missing from the '${ticketEntityName}' entity. Please add it, as it is a mandatory field.`, Constants.NotificationType.Error, true);
          return false;
        }
  
        if (!entityChecklist.categories) {
          Util.notify(`The 'categories' in '${ticketEntityName}' is null or undefined. Please provide valid category data.`, "error", true);
          return false;
        }
  
        if (Object.keys(entityChecklist.categories).length === 0) {
          Util.notify(`No categories are specified in the '${ticketEntityName}'. Please add at least one, as it is a mandatory field.`, Constants.NotificationType.Error, true);
          return false;
        }
  
        if (!validateChecklistCategories(entityChecklist.categories, ticketEntityName)) {
          return false;
        }
      }
  
      return true;
    } catch (err) {
      Util.onError(err, "Error validating checklist schema", true);
      return false;
    }
  }
  
  
  function validateChecklistCategories(checklistCategories, ticketEntityName) {
    try {
  
      if (!checklistCategories) {
        Util.notify(`The categories in '${ticketEntityName}' are invalid. Please provide valid data.`, "error", true);
        return false;
      }
  
      const categories = Object.keys(checklistCategories);
  
      for (const categoryName of categories) {
        const category = checklistCategories[categoryName];
  
        if (!category) {
          Util.notify(`The '${categoryName}' category in '${ticketEntityName}' is null or undefined. Please provide valid data.`, "error", true);
          return false;
        }
  
        if (!category.hasOwnProperty("checklist")) {
          Util.notify(`The 'checklist' key is missing in the '${categoryName}' category of the '${ticketEntityName}' entity. Please add it, as it is required.`, Constants.NotificationType.Error, true);
          return false;
        }
  
        if (!category.checklist) {
          Util.notify(`The 'checklist' in '${categoryName}' category of '${ticketEntityName}' is null or undefined. Please provide valid data.`, "error", true);
          return false;
        }
  
        if (!Array.isArray(category.checklist)) {
          Util.notify(`The 'checklist' in '${categoryName}' category of '${ticketEntityName}' must be an array.`, "error", true);
          return false;
        }
  
        if (category.checklist.length === 0) {
          Util.notify(`The 'checklist' array is empty in the '${categoryName}' category for the '${ticketEntityName}' entity. Please add at least one item, as it is required.`, Constants.NotificationType.Error, true);
          return false;
        }
  
        for (let i = 0; i < category.checklist.length; i++) {
          const item = category.checklist[i];
  
          if (item === null || item === undefined) {
            Util.notify(`Checklist item at position ${i + 1} in '${categoryName}' category of '${ticketEntityName}' is null or undefined. Please provide valid data.`, "error", true);
            return false;
          }
  
          if (typeof item !== 'string') {
            Util.notify(`Checklist item at position ${i + 1} in '${categoryName}' category of '${ticketEntityName}' must be a string.`, "error", true);
            return false;
          }
  
          if (item.trim().length === 0) {
            Util.notify(`Checklist item at position ${i + 1} in '${categoryName}' category of '${ticketEntityName}' is empty. All items must contain text.`, Constants.NotificationType.Error, true);
            return false;
          }
        }
      }
      return true;
    } catch (err) {
      Util.onError(err, `Error validating categories for ${ticketEntityName}`, true);
      return false;
    }
  }
  
// End Checklist Validation

//Start Prompt Validation

function validatePromptTemplates(PromptTemplates) {
    if (!validatePromptTemplatesArray(PromptTemplates)) {
        return false;
    }

    for (const [index, template] of PromptTemplates.entries()) {
        if (!validateTemplate(template, index)) {
            return false;
        }
    }
    return true;
}


function validateTemplate(template, index) {
    const templatePosition = `Prompt template at index ${index}`;

    if (!template || typeof template !== 'object') {
        Util.notify(`${templatePosition} is not a valid object`, Constants.NotificationType.Error, true);
        return false;
    }

    const requiredProps = ['name', 'description', 'template', 'variables'];
    for (const prop of requiredProps) {
        if (!template.hasOwnProperty(prop)) {
            Util.notify(`${templatePosition} is missing required property: '${prop}'`, Constants.NotificationType.Error, true);
            return false;
        }
    }

    if (typeof template.name !== 'string' || template.name.trim().length === 0) {
        Util.notify(`${templatePosition}: 'name' must be a non-empty string`, Constants.NotificationType.Error, true);
        return false;
    }

    if (typeof template.description !== 'string' || template.description.trim().length === 0) {
        Util.notify(`${templatePosition}: 'description' must be a non-empty string`, Constants.NotificationType.Error, true);
        return false;
    }

    if (typeof template.template !== 'string' || template.template.trim().length === 0) {
        Util.notify(`${templatePosition}: 'Prompt template' must be a non-empty string`, Constants.NotificationType.Error, true);
        return false;
    }

    if (!Array.isArray(template.variables)) {
        Util.notify(`${templatePosition}: 'variables' must be an array`, Constants.NotificationType.Error, true);
        return false;
    }

    for (const [varIndex, variable] of template.variables.entries()) {
        if (!variable || typeof variable !== 'object') {
            Util.notify(`${templatePosition}: Variable at index ${varIndex} is not a valid object`, Constants.NotificationType.Error, true);
            return false;
        }

        if (!variable.name || typeof variable.name !== 'string' || variable.name.trim().length === 0) {
            Util.notify(`${templatePosition}: Variable at index ${varIndex} has an invalid 'name' property`, Constants.NotificationType.Error, true);
            return false;
        }

        if (!variable.selector || typeof variable.selector !== 'string' || variable.selector.trim().length === 0) {
            Util.notify(`${templatePosition}: Variable at index ${varIndex} has an invalid 'selector' property`, Constants.NotificationType.Error, true);
            return false;
        }

        if (variable.hasOwnProperty('attribute') && 
            (typeof variable.attribute !== 'string' || variable.attribute.trim().length === 0)) {
            Util.notify(`${templatePosition}: Variable at index ${varIndex} has an invalid 'attribute' property`, Constants.NotificationType.Error, true);
            return false;
        }

        /* const placeholder = `{{${variable.name}}}`;
        if (!template.template.includes(placeholder)) {
            Util.notify(`${templatePosition}: Prompt template does not use the defined variable '${variable.name}'`, Constants.NotificationType.Error, true);
            return false;
        } */
    }

    return true;
}


function validatePromptTemplatesArray(templates) {
    if (!templates) {
        Util.notify("Prompt templates data is missing", Constants.NotificationType.Error, true);
        return false;
    }

    if (!Array.isArray(templates)) {
        Util.notify("Prompt templates data must be an array", Constants.NotificationType.Error, true);
        return false;
    }

    if (templates.length === 0) {
        Util.notify("Prompt templates array is empty", Constants.NotificationType.Error, true);
        return false;
    }

    const names = templates.map(t => t.name);
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
        Util.notify('Duplicate prompt template names found', Constants.NotificationType.Error, true);
        return false;
    }

    return true;
}

//  End Prompt Validation 

export { validateChecklist, validatePromptTemplates };