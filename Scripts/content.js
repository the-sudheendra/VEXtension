const veXButtonId = "veX-Button";
const veXPopUpId = "veX-PopUp-Container"
const veXButtonNode = document.createElement("div");
const veXPopUpNode = document.createElement("div");
document.body.appendChild(veXButtonNode);
document.body.appendChild(veXPopUpNode);

let isveXPopOpen = false;
veXPopUpNode.style.display = "none";
veXPopUpNode.id = veXPopUpId;
veXButtonNode.id = veXButtonId;

veXPopUpNode.innerHTML =
  `
    <header>
        <h1>Defination Of Done</h1>
    </header>
    <div class="veX_content-wrapper">
        <div class="veX_sidebar">
          <button id="veX_sidebar_epic">Epic</button>
          <button id="veX_sidebar_feature">Feature</button>
          <button id="veX_sidebar_enhancement">Enhancement</button>
          <button id="veX_sidebar_cpeIncident">CPE Incident</button>
          <button id="veX_sidebar_userStory">UserStory</button>
          <button id="veX_sidebar_spike">Spike</button>
          <button id="veX_sidebar_documentation">Documentation</button>
        </div>
        <div class="veX_main-content">
            <div id="tiles" class="veX_tab-content">
                <h2>Tiles</h2>
                <div class="veX_checkbox-group">
                  
                </div>
            </div>
        </div>
    </div>
`







veXButtonNode.addEventListener('click', toggleveXPopup)
function toggleveXPopup() {
  this.isveXPopOpen = !this.isveXPopOpen;
  if (this.isveXPopOpen) {
    veXPopUpNode.style.display = 'block';
  }
  else {
    veXPopUpNode.style.display = 'none';
  }
}

function showTab(tabId) {
  var tabContents = document.getElementsByClassName('tab-content');
  for (var i = 0; i < tabContents.length; i++) {
    tabContents[i].classList.remove('active');
  }

  document.getElementById(tabId).classList.add('active');
}

function addClickEventForSideBarTab()
{
  let sideBar = document.querySelector('.veX_sidebar');
  let tabs = sideBar.children;
  Array.from(tabs).forEach(tab => {
    tab.addEventListener('click',
      ()=>{
        showTab(tab.id);
      }
    );
});


}
addClickEventForSideBarTab();
showTab('tiles');





