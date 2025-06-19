const veXIconsURLs = {
    add: chrome.runtime.getURL("icons/add_24dp_000000.png"),
    edit: chrome.runtime.getURL("icons/edit_24dp_000000.png"),
    send: chrome.runtime.getURL("icons/send_24.png"),
    expand: chrome.runtime.getURL("icons/keyboard_arrow_down_24.png"),
    markAllCompleted: chrome.runtime.getURL("icons/CategoryDone.png"),
    markAllNotDone: chrome.runtime.getURL("icons/CategoryNotDone.png"),
    markAllNotApplicable: chrome.runtime.getURL("icons/CategotyNotApplicable.png"),
    logo: chrome.runtime.getURL("icons/fact_check_48_FFFFFF.png"),
    check: chrome.runtime.getURL("icons/save_24.png"),
    close: chrome.runtime.getURL("icons/keyboard_arrow_up_24dp.png"),
    unselect: chrome.runtime.getURL("icons/check_box_outline_blank_24dp.png")
};
const ChecklistUI = `
<header class="veX_header veX_banner">
    <div class="veX_logo_container">
        <img class="veX_logo" src="${veXIconsURLs.logo}" title="Checklist Tool for OpenText ValueEdge" alt="VE Checklist">
    </div>
    <p class="veX_header_title veX_truncate"></p>
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
        <div class="veX_segment veX_footer_icon_container veX_leave_comment_btn">
        <img class="veX_material_icons" alt="Leave a new comment" title="Leave a new comment" src="${veXIconsURLs.add}"/>
             <span class="veX_leave_comment_btn_txt">Leave Comment</span> 
        </div>
         <div class=" veX_segment veX_footer_icon_container veX_edit_comment_btn">
         <img class="veX_material_icons" alt="Edit exisiting comment" title="Edit exisiting comment" src="${veXIconsURLs.edit}"/>
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
        </div>
    </div>
    
    <div id="veX_prompts_list_container">
      <h3>No prompts available. Please upload prompt.json.</h3>
    </div>
`;

export {
    ChecklistUI,
    PromptsUI,
    veXIconsURLs
}