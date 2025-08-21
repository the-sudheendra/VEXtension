const veXIconsURLs = {
    add: chrome.runtime.getURL("icons/add_24dp_000000.png"),
    addTask: chrome.runtime.getURL("icons/add_task_24dp.png"),
    calendarAddOn: chrome.runtime.getURL("icons/calendar_add_on.png"),
    edit: chrome.runtime.getURL("icons/edit_24dp_000000.png"),
    send: chrome.runtime.getURL("icons/send_24.png"),
    expand: chrome.runtime.getURL("icons/keyboard_arrow_down_24.png"),
    markAllCompleted: chrome.runtime.getURL("icons/CategoryDone.png"),
    markAllNotDone: chrome.runtime.getURL("icons/CategoryNotDone.png"),
    markAllNotApplicable: chrome.runtime.getURL("icons/CategotyNotApplicable.png"),
    logo: chrome.runtime.getURL("icons/fact_check_48_FFFFFF.png"),
    check: chrome.runtime.getURL("icons/save_24.png"),
    close: chrome.runtime.getURL("icons/keyboard_arrow_up_24dp.png"),
    unselect: chrome.runtime.getURL("icons/check_box_outline_blank_24dp.png"),
    closeSmall: chrome.runtime.getURL("icons/close_small_24.png"),
    quick_phrases: chrome.runtime.getURL("icons/quick_phrases_24.png")
};
const ChecklistUI = `
<header class="veX_header veX_banner">
    <div class="veX_header_main">
        <div class="veX_logo_container">
            <img class="veX_logo" src="${veXIconsURLs.logo}" title="Checklist Tool for OpenText ValueEdge" alt="VE Checklist">
        </div>
        <p class="veX_header_title veX_truncate"></p>
    </div>
    <div class="veX_header_actions">
        <button class="veX_add_task_btn" id="veX_add_task_btn" title="Add a new checklist for the current ticket type.">
            <img class="veX_material_icons" src="${veXIconsURLs.addTask}" alt="Add Checklist"  title="Add a new checklist for the current ticket type."/>
            <span class="veX_add_task_btn_txt" title="Add a new checklist for the current ticket type.">Add</span>
        </button>
        <button class="veX_add_task_btn" id="veX_set_reminder_btn" title="Set a reminder">
            <img class="veX_material_icons" src="${veXIconsURLs.calendarAddOn}" alt="Set Reminder" title="Set a reminder"/>
            <span class="veX_add_task_btn_txt" title="Set a reminder">Later</span>
        </button>
        <div class="veX_close_btn">
            <img class="veX_popup_close_icon" id="veX_checklist_close_btn" src="${veXIconsURLs.closeSmall}" alt="Close" title="Close" style="cursor:pointer;"/>
        <div>
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
        <div class="veX_ui_title_container">
          <div class="veX_ui_title">No Item</div>
          <div class="veX_mark_category_buttons_wrapper">
            <span class="veX_mark_category_label">Mark as:</span>
            <div class="veX_mark_category_buttons">
              <button class="veX_mark_category_completed_btn" title="Mark as done">
                <img class="veX_material_icons" src="${veXIconsURLs.markAllCompleted}" alt="Mark as done">
              </button>
              <button class="veX_mark_category_not_done_btn" title="Mark as not done">
                <img class="veX_material_icons" src="${veXIconsURLs.markAllNotDone}" alt="Mark as not done">
              </button>
              <button class="veX_mark_category_not_applicable_btn" title="Mark as not applicable">
                <img class="veX_material_icons" src="${veXIconsURLs.markAllNotApplicable}" alt="Mark as not applicable">
              </button>
              <button class="veX_mark_category_unselect_btn" title="Unselect all items">
                <img class="veX_material_icons" src="${veXIconsURLs.unselect}" alt="Unselect all items">
              </button>
            </div>
          </div>
        </div>
         <!-- <div class="veX_header_actions">
            <button id="mark-all-completed">Mark all as completed</button> 
        </div> -->
        <div class="veX_ui_list_container">
        </div>
    </div>
</div>
<div class="veX_banner veX_footer ">
    <div class="veX_segmented-button">
        <div class="veX_segment veX_footer_icon_container veX_leave_comment_btn" title="Leave a New Comment with a Checklist">
        <img class="veX_material_icons" alt="Leave a new comment" src="${veXIconsURLs.add}"/>
             <span class="veX_leave_comment_btn_txt">Leave Comment</span> 
        </div>
        <div class="veX_segment veX_footer_icon_container veX_get_checklist_btn" title="Retrieve Checklist from Existing Comments">
        <img class="veX_material_icons" alt="Edit exisiting comment"  src="${veXIconsURLs.quick_phrases}"/>
             <span class="veX_edit_comment_btn_txt">Retrieve Checklist</span> 
        </div>
         <div class="veX_segment veX_footer_icon_container veX_edit_comment_btn" title="Edit Existing Comment with Checklist">
         <img class="veX_material_icons" alt="Edit exisiting comment"  src="${veXIconsURLs.edit}"/>
             <span class="veX_edit_comment_btn_txt">Edit Comment</span> 
        </div>
    </div>
</div>
`;

const PromptsUI = `
    <div class="veX_prompts_header">
        <h2 class="veX_gradient_text">Aviator Prompts ✨</h2>
        <div class="veX_prompts_header_actions">
            <div class="veX_prompts_tone_selector_container">
            <label>Prompt Tone:</label>
            <div class="veX_prompts_tone_selector">
                <div class="veX_dropdown_selected">Conversational</div>
                    <div class="veX_dropdown_options">
                    </div>
                </div>
            </div>
            <img class="veX_popup_close_icon" id="veX_prompts_close_btn" src="${veXIconsURLs.closeSmall}" alt="Close" title="Close" style="margin-left:auto;cursor:pointer;"/>
        </div>
    </div>
    
    <div id="veX_prompts_list_container">
      <h3>No prompts available. Please upload prompt.json.</h3>
    </div>
`;
// Reminder popup UI
const RemindersUI = `
<div class="veX_popup-overlay" id="veX_reminder_popup_overlay">
    <div class="veX_popup-container">
        <button class="veX_close-btn" id="veX_reminder_close_btn" aria-label="Close">×</button>
        <div class="veX_container">
            <div class="veX_header">
                <h1>Set a Reminder</h1>
                <p>Create one-time or repeating reminders</p>
            </div>
            <div class="veX_main-content">
                <div class="veX_add-alarm-section">
                    <div class="veX_section-title">New Reminder</div>
                    <div class="veX_form-group">
                        <label for="veX_reminder_message">Message</label>
                        <input type="text" id="veX_reminder_message" placeholder="What should I remind you about?" />
                    </div>
                    <div class="veX_form-group">
                        <label for="veX_reminder_datetime">Date and Time</label>
                        <input type="datetime-local" id="veX_reminder_datetime" />
                    </div>
                    <div class="veX_form-group">
                        <label for="veX_reminder_repeat">Repeat</label>
                        <select id="veX_reminder_repeat">
                            <option value="none">Do not repeat</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>
                    <div class="veX_button-group">
                        <button class="veX_btn veX_btn-primary" id="veX_save_reminder_btn">Save Reminder</button>
                        <button class="veX_btn veX_btn-secondary" id="veX_cancel_reminder_btn">Cancel</button>
                    </div>
                </div>
                <div class="veX_alarms-section">
                    <div class="veX_section-title">Scheduled Reminders</div>
                    <div id="veX_reminders_list"></div>
                </div>
            </div>
        </div>
    </div>
</div>`;
 const addNewChecklistUI = `
<div class="veX_add_new_checklist_popup_overlay" id="veX_add_new_checklist_popup">
    <div class="veX_add_new_checklist_popup_container">
        <div class="veX_add_new_checklist_popup_header">
            <h3 class="veX_add_new_checklist_popup_title">Add New Checklist</h3>
        <button type="button" class="veX_add_new_checklist_close_btn" id="veX_add_new_checklist_close_btn" aria-label="Close">×</button>
        </div>
        <div class="veX_add_new_checklist_popup_form">
            <div class="veX_add_new_checklist_input_group">
                <label class="veX_add_new_checklist_input_label" for="veX_add_new_checklist_name">Checklist Name</label>
                <input type="text" id="veX_add_new_checklist_name" class="veX_add_new_checklist_input_field" placeholder="Enter checklist name" required>
            </div>
            
            <div class="veX_add_new_checklist_input_group">
                <label class="veX_add_new_checklist_input_label">Category</label>
                <div class="veX_add_new_checklist_category_section">
                    <select id="veX_add_new_checklist_category_select" class="veX_add_new_checklist_select_field">
                        <option value="">Select existing category</option>
                        <!-- Categories will be populated dynamically -->
                    </select>
                    
                    <div class="veX_add_new_checklist_checkbox_group">
                        <input type="checkbox" id="veX_add_new_checklist_add_category_checkbox" class="veX_add_new_checklist_checkbox" >
                        <label for="veX_add_new_checklist_add_category_checkbox" class="veX_add_new_checklist_checkbox_label">Add new category</label>
                    </div>
                    
                    <div id="veX_add_new_checklist_new_category_section" class="veX_add_new_checklist_new_category_section" style="display: none;">
                        <input type="text" id="veX_add_new_checklist_new_category_name" class="veX_add_new_checklist_input_field" placeholder="Enter new category name">
                        
                        <div class="veX_add_new_checklist_input_group">
                            <label class="veX_add_new_checklist_input_label" for="veX_add_new_checklist_phases_select">Applicable Phases</label>
                            <div class="veX_add_new_checklist_multiselect_container">
                                <div id="veX_add_new_checklist_phases_select" class="veX_add_new_checklist_multiselect_field" >
                                    <span id="veX_add_new_checklist_phases_placeholder">Select applicable phases</span>
                                    <span class="veX_add_new_checklist_dropdown_arrow">▼</span>
                                </div>
                                <div id="veX_add_new_checklist_phases_dropdown" class="veX_add_new_checklist_phases_dropdown" style="display: none;">
                                    <!-- Phases will be populated dynamically -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="veX_add_new_checklist_popup_buttons" style="display: flex; justify-content: space-between; align-items: center;">
                <button id="veX_add_new_checklist_options_btn" class="veX_add_new_checklist_btn veX_add_new_checklist_btn_secondary" style="margin-right: auto;" type="button">Upload File</button>
                <button id="veX_add_new_checklist_add_btn" class="veX_add_new_checklist_btn veX_add_new_checklist_btn_primary">Add Checklist</button>
            </div>
        </div>
    </div>
</div>
    `;

    
export {
    ChecklistUI,
    PromptsUI,
    veXIconsURLs,
    addNewChecklistUI,
    RemindersUI
}