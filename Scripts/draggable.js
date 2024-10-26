const draggableDiv = document.getElementById("veX-PopUp-Container");
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

draggableDiv.addEventListener('mousedown', dragStart);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);

function dragStart(e) {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;

    if (e.target === draggableDiv) {
        isDragging = true;
    }
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, draggableDiv);
    }
}

function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;

    isDragging = false;
}

function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
}

// class DraggableElement {
//     constructor(elementId) {
//         this.elementId = elementId;
//         this.isDragging = false;
//         this.xOffset = 0;
//         this.yOffset = 0;
//         this.draggableDiv = document.getElementById(this.elementId);
//     }

//     dragStart(e) {
//         this.initialX = e.clientX - this.xOffset;
//         this.initialY = e.clientY - this.yOffset;
//         if (e.target === this.draggableDiv) {
//             this.isDragging = true;
//         }
//     }
//     drag(e) {
//         if (this.isDragging) {
//             e.preventDefault();
//             this.currentX = e.clientX - this.initialX;
//             this.currentY = e.clientY - this.initialY;
//             this.xOffset = this.currentX;
//             this.yOffset = this.currentY;
//             this.setTranslate(this.currentX, this.currentY, this.draggableDiv);
//         }
//     }
//     setTranslate(xPos, yPos, el) {
//         el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
//     }
//     dragEnd(e) {
//         this.initialX = this.currentX;
//         this.initialY = this.currentY;
//         this.isDragging = false;
//     }
// }
// let draggableveXButton = new DraggableElement("veX-Button");
// draggableveXButton.draggableDiv.addEventListener('mousedown', draggableveXButton.dragStart);
// document.addEventListener('mousemove', draggableveXButton.drag);
// document.addEventListener('mouseup', draggableveXButton.dragEnd);