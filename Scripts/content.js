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
veXButtonNode.innerHTML="🔼";

const dods = {
  dod: {
    title: "What is the Definition of Done?",
    desc: "The definition of done (DoD) is when all conditions, or acceptance criteria, that a software product must satisfy are met and ready to be accepted by a user, customer, team, or consuming system.  We must meet the definition of done to ensure quality.  It lowers rework, by preventing user stories that don’t meet the definition from being promoted to higher level environments. It will prevent features that don’t meet the definition from being delivered to the customer or user.",
    list: []
  },
  epic: {
    title: "Completion of Epic",
    desc: "The Epic is considered done when all associated user stories and tasks are completed and accepted by the Product Owner, and it delivers the intended value.",
    list: [
      "All associated stories and tasks are complete.",
      "Acceptance criteria for all stories are met.",
      "Product Owner has accepted the deliverable.",
      "Documentation (if applicable) is complete.",
      "All dependencies and blockers are resolved."
    ]
  },
  feature: {
    title: "Feature Ready for Release",
    desc: "The Feature is complete when it fulfills its requirements, passes all acceptance criteria, and is ready for production deployment.",
    list: [
      "Feature passes all acceptance criteria.",
      "Code is fully tested (unit, integration, and UAT).",
      "Documentation is updated.",
      "Stakeholders have reviewed and approved.",
      "All related bugs have been addressed."
    ]
  },
  defect: {
    title: "Defect Resolution",
    desc: "A defect is done when it is identified, fixed, and tested in all applicable environments to ensure the issue does not recur.",
    list: [
      "Defect is reproduced and root cause identified.",
      "Fix is implemented and code is reviewed.",
      "Fix passes all levels of testing (unit, integration, UAT).",
      "No new defects are introduced by the fix.",
      "Stakeholder approval and defect closure."
    ]
  },
  enhancement: {
    title: "Enhancement Complete",
    desc: "An enhancement is complete when it improves the functionality as requested, passes acceptance criteria, and does not introduce any regressions.",
    list: [
      "Enhancement passes all acceptance tests.",
      "No regression issues are introduced.",
      "Code is tested and peer-reviewed.",
      "Documentation is updated to reflect changes.",
      "Stakeholders have approved the changes."
    ]
  },
  cpeincident: {
    title: "CPE Incident Resolution",
    desc: "The CPE (Customer Premises Equipment) incident is resolved when the issue is addressed, service is restored, and root cause analysis is documented.",
    list: [
      "Incident is fully diagnosed and resolved.",
      "Root cause analysis is completed.",
      "No further issues observed in monitoring.",
      "Service is fully restored.",
      "Customer has been informed and issue closed."
    ]
  },
  userstory: {
    title: "User Story Completion",
    desc: "A user story is complete when it meets its acceptance criteria, passes testing, and the Product Owner has reviewed and accepted it.",
    list: [
      "Acceptance criteria are met.",
      "Code is peer-reviewed and tested.",
      "Stakeholders/Product Owner sign-off.",
      "All related tasks are complete.",
      "No critical bugs or issues remain."
    ]
  },
  spike: {
    title: "Spike Resolution",
    desc: "A spike is complete when the research or prototype work is done and documented, and the team has enough information to proceed with implementation or further work.",
    list: [
      "Research or prototype completed.",
      "Findings are documented and shared.",
      "Questions driving the spike are answered.",
      "Next steps are clearly defined for the team."
    ]
  },
  documentation: {
    title: "Documentation Finalized",
    desc: "Documentation is done when it accurately describes the feature or product, is reviewed for clarity and accuracy, and is stored in the appropriate repository.",
    list: [
      "Documentation is complete and up-to-date.",
      "Reviewed by relevant team members.",
      "Stored in the correct repository.",
      "Stakeholders have reviewed and approved."
    ]
  }
};


veXPopUpNode.innerHTML =
  `
    <header>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=checklist" /> 
   <h1>Defination Of Done</h1>
</header>
<div class="veX_content-wrapper">
   <div class="veX_sidebar">
      <button id="veX_sidebar_epic" name="epic">Epic</button>
      <button id="veX_sidebar_feature" name="feature">Feature</button>
      <button id="veX_sidebar_enhancement" name="enhancement" >Enhancement</button>
      <button id="veX_sidebar_cpeIncident" name="cpeincident">CPE Incident</button>
      <button id="veX_sidebar_userStory" name="userstory">UserStory</button>
      <button id="veX_sidebar_spike" name="spike" >Spike</button>
      <button id="veX_sidebar_documentation" name="documentation">Documentation</button>
   </div>
   <div class="veX_main-content">
      <div id="tiles" class="veX_tab-content">
         <div class="veX_dod_title">a</div>
         <div class="veX_dod_desc">a</div>
         <div class="veX_dod_list_container">
            <ul class="veX_dod_list" id="myUL">
               <li>Documentation is complete and up-to-date.</li>
               <li>Reviewed by relevant team members.</li>
               <li>Stored in the correct repository.</li>
               <li>Stakeholders have reviewed and approved.</li>
            </ul>
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
    veXButtonNode.innerHTML="🔽"

  }
  else {
    veXPopUpNode.style.display = 'none';
    veXButtonNode.innerHTML="🔼"
  }
}

function showTab(tabId) {

  let tabTitle = document.getElementsByClassName('veX_dod_title')[0];
  let tabDesc = document.getElementsByClassName('veX_dod_desc')[0];
  let tabList = document.getElementsByClassName('veX_dod_list_container')[0];
  let dod = dods[tabId];
  tabTitle.innerHTML = dod.title;
  tabDesc.innerHTML = dod.desc;
  updateTheListView(dod.list);
}

function addClickEventForSideBarTab() {
  let sideBar = document.querySelector('.veX_sidebar');
  let tabs = sideBar.children;
  Array.from(tabs).forEach(tab => {
    tab.addEventListener('click',
      () => {
        showTab(tab.name);
      }
    );
  });

}
function updateTheListView(listItems)
{
 let list = document.getElementsByClassName("veX_dod_list")[0];
 list.innerHTML='';
 listItems.forEach(item => {
  const li = document.createElement('li');
  li.textContent = item;
  list.appendChild(li);
})


}
addClickEventForSideBarTab();
showTab('dod');
// Create a "close" button and append it to each list item
var myNodelist = document.getElementsByTagName("LI");
var i;
for (i = 0; i < myNodelist.length; i++) {
  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  myNodelist[i].appendChild(span);
}

// Click on a close button to hide the current list item
var close = document.getElementsByClassName("close");
var i;
for (i = 0; i < close.length; i++) {
  close[i].onclick = function() {
    var div = this.parentElement;
    div.style.display = "none";
  }
}

// Add a "checked" symbol when clicking on a list item
var list = document.querySelector('ul');
list.addEventListener('click', function(ev) {
  if (ev.target.tagName === 'LI') {
    ev.target.classList.toggle('checked');
  }
}, false);

// Create a new list item when clicking on the "Add" button
function newElement() {
  var li = document.createElement("li");
  var inputValue = document.getElementById("myInput").value;
  var t = document.createTextNode(inputValue);
  li.appendChild(t);
  if (inputValue === '') {
    alert("You must write something!");
  } else {
    document.getElementById("myUL").appendChild(li);
  }
  document.getElementById("myInput").value = "";

  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  li.appendChild(span);

  for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
      var div = this.parentElement;
      div.style.display = "none";
    }
  }
}
