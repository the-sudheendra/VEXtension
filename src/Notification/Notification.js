var toastNode = document.createElement('div');
var root = document.querySelector(':root');

toastNode.innerHTML = `
 <div id="veX_icon_wrapper">
    <img id="veX_icon"></img>
</div>
<div id="veX_toast_message">
    <h4></h4>
</div>
<button id="veX_toast_close"></button>
<div id="veX_timer"></div>
`;

toastNode.id = "veX_toast";
toastNode.className = "veX_toast_info";
document.body.appendChild(toastNode);

const toastTimerNode = document.querySelector("#veX_timer");
const closeToastBtnNode = document.querySelector("#veX_toast_close");
let countdown;

function closeToastNode() {
  try {
    toastNode.style.animation = "close 0.3s cubic-bezier(.87,-1,.57,.97) forwards";
    toastTimerNode.classList.remove("veX_timer_animation");
    clearTimeout(countdown);
    toastNode.style.visibility = "hidden";
  }
  catch (err) {
    alert("An error occurred. Please review the console logs for details and report the issue if needed.");
    console.dir(err);
  }
}

async function openToastNode(type, message) {
  try {
    if(!toastNode) return;
    let messageNode = toastNode.querySelector("#veX_toast_message");
    if(!messageNode) return;
    if (type)
      messageNode.querySelector('h4').innerHTML=message;
    switch (type) {
      case "success":
        root.style.setProperty('--veX-notification-primary', "#2DD743");
        toastNode.querySelector("#veX_icon").src = await chrome.runtime.getURL("icons/check_circle_24.png");
        break;
      case "warning":
        root.style.setProperty('--veX-notification-primary', "#F29208");
        toastNode.querySelector("#veX_icon").src = await chrome.runtime.getURL("icons/warning_24.png");
        break;
      case "error":
        root.style.setProperty('--veX-notification-primary', "#E63435");
        toastNode.querySelector("#veX_icon").src = await chrome.runtime.getURL("icons/error_24.png");
        break;
      default:
        root.style.setProperty('--veX-notification-primary', "#42C0F2");
        toastNode.querySelector("#veX_icon").src = await chrome.runtime.getURL("icons/info_24.png");

    }
    toastNode.style.visibility = "visible";
    toastNode.style.animation = "open 0.3s cubic-bezier(.47,.02,.44,2) forwards";
    toastTimerNode.classList.add("veX_timer_animation");
    clearTimeout(countdown)
    countdown = setTimeout(() => {
      closeToastNode();
    }, 4000)
  }
  catch (err) {
    alert("An error occurred. Please review the console logs for details and report the issue if needed.");
    console.dir(err);
  }
}
closeToastBtnNode.addEventListener("click", closeToastNode);

export {
  openToastNode
}