var nbFile = 4;
var allPassages = [];
const files = [];

getData();

// create a passage object which will be added to the sidebar and sets the listeners
function createPassage(data) {
  const passage = document.createElement("div");
  passage.setAttribute("green", "none");
  passage.setAttribute("blue", "none");
  passage.setAttribute("red", "none");
  passage.setAttribute("class", "passage draggable");
  passage.setAttribute("id", data.id);
  passage.setAttribute("draggable", "true");
  passage.setAttribute("data-fileid", data.fileId);
  passage.setAttribute("data-startOffset", data.startOffset);
  passage.setAttribute("data-endOffset", data.endOffset);
  passage.setAttribute("data-startIndex", data.startIndex);
  passage.setAttribute("data-endIndex", data.endIndex);
  passage.setAttribute("data-yPosition", data.yPosition);

  const draghandle = document.createElement("div");
  draghandle.setAttribute("class", "draghandle");

  const draghandlebutton = document.createElement("button");
  draghandlebutton.setAttribute("class", "draghandle-button");
  draghandlebutton.appendChild(
    document.createTextNode(String.fromCharCode(10005))
  );

  draghandlebutton.onclick = () => {
    passage.remove();
    for (let i = 0; i < allPassages.length; i++) {
      if (allPassages[i] == passage) {
        allPassages.splice(i, 1);
      }
    }
  };

  draghandlebutton.onmouseover = () => {
    draghandlebutton.style.color = "red";
  };

  draghandlebutton.onmouseleave = () => {
    draghandlebutton.style.color = "black";
  };

  draghandle.appendChild(draghandlebutton);

  const quote = document.createElement("div");
  quote.setAttribute("class", "quote");
  const quoteA = document.createElement("a");
  quoteA.setAttribute("class", "notes");
  quoteA.appendChild(document.createTextNode(data.passage));
  quote.ondblclick = () => {
    openWindow(
      passage.getAttribute("data-fileid"),
      passage.getAttribute("data-startOffset"),
      passage.getAttribute("data-endOffset"),
      passage.getAttribute("data-startIndex"),
      passage.getAttribute("data-endIndex"),
      passage.getAttribute("data-yPosition")
    );
  };
  quote.appendChild(quoteA);

  const annotationArea = document.createElement("div");
  annotationArea.setAttribute("class", "annotationArea");
  const title = document.createElement("span");
  title.setAttribute("class", "field-title");
  title.appendChild(document.createTextNode("Note"));
  const hide = document.createElement("button");
  hide.setAttribute("class", "hide-button");
  hide.appendChild(document.createTextNode(String.fromCharCode(9660)));
  hide.onclick = () => {
    if (
      passage.lastElementChild.lastElementChild.style.visibility != "hidden"
    ) {
      passage.lastElementChild.lastElementChild.style.visibility = "hidden";
      hide.innerText = String.fromCharCode(9658);
    } else {
      passage.lastElementChild.lastElementChild.style.visibility = "visible";
      hide.innerText = String.fromCharCode(9660);
    }
  };
  const edit = document.createElement("div");
  edit.setAttribute("class", "edit-area");
  const textarea = document.createElement("p");
  textarea.appendChild(document.createTextNode(data.annotation));
  edit.appendChild(textarea);
  annotationArea.appendChild(title);
  annotationArea.appendChild(hide);
  annotationArea.appendChild(edit);

  passage.appendChild(draghandle);
  passage.appendChild(quote);
  passage.appendChild(annotationArea);
  allPassages.push(passage);
  return passage;
}

//select passage in new window
function reselect(myWindow, startOffset, endOffset, startIndex, endIndex) {
  //scroll to the position
  //myWindow.document.getElementById("document").scrollTo(0, yPosition);

  //reselect the selection using startIndex and endIndex
  let documentNode = myWindow.document.getElementById("document");
  let node = documentNode.firstElementChild;
  let i = 0;
  let startNode;
  let endNode;

  while (node) {
    if (i == startIndex) {
      startNode = node;
    }
    if (i == endIndex) {
      endNode = node;
    }
    i++;
    node = node.nextElementSibling || node.nextSibling;
  }
  console.log(startNode);
  console.log(endNode);

  //re-create the selection using offset
  const newRange = new Range();
  console.log(startNode.firstChild.firstChild);

  if (startNode.firstChild.nodeName == "STRONG") {
    console.log("start strong");
    newRange.setStart(startNode.firstChild.firstChild, startOffset);
  } else {
    newRange.setStart(startNode.firstChild, startOffset);
  }

  if (endNode.firstChild.nodeName == "STRONG") {
    console.log("end strong");
    newRange.setEnd(endNode.firstChild.firstChild, endOffset);
  } else {
    console.log(endNode.firstChild);
    newRange.setEnd(endNode.firstChild, endOffset);
  }

  let selection = myWindow.window.getSelection();
  selection.removeAllRanges();
  selection.addRange(newRange);
}

$("#save-button").click(function () {
  console.log("save");
  downloadInnerHtml(fileName, "editor", "text/html");
  zipFile();
});

function toDOM(input) {
  let obj = typeof input === "string" ? JSON.parse(input) : input;
  let propFix = { for: "htmlFor", class: "className" };
  let node;
  let nodeType = obj.nodeType;
  switch (nodeType) {
    // ELEMENT_NODE
    case 1: {
      node = document.createElement(obj.tagName);
      if (obj.attributes) {
        for (let [attrName, value] of obj.attributes) {
          let propName = propFix[attrName] || attrName;
          // Note: this will throw if setting the value of an input[type=file]
          node[propName] = value;
        }
      }
      break;
    }
    // TEXT_NODE
    case 3: {
      return document.createTextNode(obj.nodeValue);
    }
    // COMMENT_NODE
    case 8: {
      return document.createComment(obj.nodeValue);
    }
    // DOCUMENT_FRAGMENT_NODE
    case 11: {
      node = document.createDocumentFragment();
      break;
    }
    default: {
      // Default to an empty fragment node.
      return document.createDocumentFragment();
    }
  }
  if (obj.childNodes && obj.childNodes.length) {
    for (let childNode of obj.childNodes) {
      node.appendChild(this.toDOM(childNode));
    }
  }
  return node;
}

async function getData() {
  const rf = await fetch("/files");
  const filesData = await rf.json();
  filesData.sort((a, b) => parseFloat(a.index) - parseFloat(b.index));

  for (let index = 0; index < filesData.length; index++) {
    var element = toDOM(filesData[index].file);
    element.setAttribute("id", "document");
    files[index] = element;
  }

  // for (let i = 0; i < nbFile; i++) {
  //     const container = document.createElement('div');
  //     document.getElementById("annotations").append(container);
  //     const doc = document.createElement('p');
  //     doc.appendChild(document.createTextNode("Document " + (i + 1)));
  //     doc.setAttribute("class", "docName");
  //     container.append(doc);
  //     passagesDiv[i] = container;
  // }
  const res = await fetch("/notes");
  const data = await res.json();
  var i = 100;
  for (item of data) {
    document.getElementById("sidebar").append(createPassage(item));
    i += 10;
  }
}

//open window when double click
function openWindow(
  id,
  startOffset,
  endOffset,
  startIndex,
  endIndex,
  yPosition
) {
  var left = (screen.width - 700) / 2;
  var top = (screen.height - 1000) / 4;

  var myWindow = window.open(
    "",
    "",
    "resizable=yes, width=" +
      700 +
      ", height=" +
      1000 +
      ", top=" +
      top +
      ", left=" +
      left
  );
  var element = document.createElement("div");
  element.setAttribute("id", "document");
  element.appendChild(files[id]);
  myWindow.document.write(element.innerHTML);

  //parse the indexes
  var startIndex = startIndex.split(",").map(function (item) {
    return parseInt(item, 10);
  });

  var endIndex = endIndex.split(",").map(function (item) {
    return parseInt(item, 10);
  });

  console.log(startIndex);
  console.log(endIndex);

  let object = {
    startOffset: startOffset,
    endOffset: endOffset,
    startIndex: startIndex,
    endIndex: endIndex,
    yPosition: yPosition,
  };
  reselect(myWindow, object);
}

//input a reference
//ouput the node using that reference in the dom tree
function getElement(window, ref) {
  console.log(ref);
  var positions = ref;
  //var positions = ref.split(/,/),
  var elem = window.document.getElementById("document");

  while (elem && positions.length) {
    if (positions.length == 1) {
      elem = elem.childNodes[positions.shift()];
    } else {
      elem = elem.children[positions.shift()];
    }
    console.log(positions[0]);
    console.log(elem);
  }
  console.log(positions);
  return elem;
}

function reselect(window, selectionObject) {
  console.log(selectionObject.startOffset);
  console.log(selectionObject.endOffset);

  setTimeout(() => {
    window.document.documentElement.style = "scroll-behavior: smooth";
    window.window.scroll(0, selectionObject.yPosition);
  }, 200);

  console.log(selectionObject);

  console.log(selectionObject.startIndex);
  let startNode = this.getElement(window, selectionObject.startIndex);
  let endNode = this.getElement(window, selectionObject.endIndex);

  console.log("start");
  console.log(startNode);
  console.log("end");
  console.log(endNode);

  console.log("start node");
  console.log(startNode);
  console.log("end node");
  console.log(endNode);
  console.log("sibling");

  const newRange = new Range();

  console.log(selectionObject.startOffset);
  console.log(selectionObject.endOffset);

  //console.log(endNode.length);

  newRange.setStart(startNode, selectionObject.startOffset);
  newRange.setEnd(endNode, selectionObject.endOffset);

  console.log(newRange);
  let selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(newRange);
}

function getCursorPosition() {
  var range = quill.getSelection();
  if (range) {
    if (range.length == 0) {
      console.log("User cursor is at index", range.index);
      return range.index;
    } else {
      var text = quill.getText(range.index, range.length);
      console.log("User has highlighted: ", text);
    }
  } else {
    console.log("User cursor is not in editor");
  }
}

// This name will be passed to the destination window during drag-and-drop
// and can be used to distinguish among several source windows
let windowId = "demo";

// Return the id of the closest enclosing dropzone, if any
function getDropZoneId(elem) {
  return $(elem).closest(".dropzone").attr("id");
}

// Move jQuery `elem` by deltaX, deltaY
function moveElem(elem, deltaX, deltaY) {
  let offset = elem.offset();
  offset.left += deltaX;
  offset.top += deltaY;
  elem.offset(offset);
}

function moveNoteToContent(note, sidebar, ev, dnd) {
  // Compute destination position
  // NOTE: this does account for scrolling of content, but not of scrolling in a parent element
  let offset = $("#snaptarget").offset();
  let scroll = {
    x: $("#snaptarget").scrollLeft(),
    y: $("#snaptarget").scrollTop(),
  };
  let x =
    ev.originalEvent.clientX - offset.left + scroll.x - dnd.cursorOffset.x;
  let y = ev.originalEvent.clientY - offset.top + scroll.y - dnd.cursorOffset.y;

  // Copy note and append it to sidebar
  var data = {
    id: note.getAttribute("id"),
    fileId: note.getAttribute("data-fileid"),
    startOffset: note.getAttribute("data-startoffset"),
    endOffset: note.getAttribute("data-endoffset"),
    startIndex: note.getAttribute("data-startindex"),
    endIndex: note.getAttribute("data-endoffset"),
    passage: note.firstElementChild.nextSibling.firstElementChild.innerText,
    annotation: note.lastElementChild.lastElementChild.innerText,
  };
  console.log(data);

  $("#snaptarget").append(createPassage(data));

  // Remove it with the 0 timeout otherwise the dragend event is lost (because the note does not exist)
  setTimeout(() => note.remove(), 0);
}

// // Return the HTML content of a note
// function getNoteContent(note) {
//   return note.lastElementChild.innerHTML;
// }

// // Return the HTML content of a note
// function getPassageContent(note) {
//   return note.firstElementChild.nextElementSibling.innerHTML;
// }

// Copy a note from a remote window to the sidebar
function copyNoteToSidebar(xferData, sidebar, ev, dnd) {
  // Copy note and append it to sidebar
  $("#sidebar").append(createPassage(xferData));
}

// Global holding the current drag-and-drop interaction, if any
let dnd = null;

// Singleton class holding the state for a drag-and-drop interaction
class DragAndDropInteraction {
  draggedElem = null;
  dropZone = null;

  constructor(ev) {
    console.log(ev.type + ": new dnd interaction", ev);
    this.draggedElem = ev.target;
    this.dropZone = null;

    // absolute position of cursor (used for local move)
    this.startPos = {
      x: ev.originalEvent.screenX,
      y: ev.originalEvent.screenY,
    };

    // position of cursor relative to dragged element (used for non-local move)
    let offset = $(this.draggedElem).offset();
    this.cursorOffset = {
      x: ev.originalEvent.pageX - offset.left,
      y: ev.originalEvent.pageY - offset.top,
    };

    // fill out dataTransfor info in case we drag out of the window
    ev.originalEvent.dataTransfer.effectAllowed = "copy";
  }

  // ==== utilities ====

  getMovement() {
    // return a string sourceDropZone->destinationDropZone
    let from = getDropZoneId(this.draggedElem);
    let to = getDropZoneId(this.dropZone);
    if (from && to) return from + "->" + to;
    return null;
  }

  // ==== Event Handlers ===
  drag(ev) {
    // console.log('drag')
  }

  dragEnd(ev) {
    console.log("dragEnd", ev);
    dnd = null; // reset interaction
  }

  dragEnter(ev) {
    //console.log("dragEnter", ev);
    this.dragOver(ev);
  }

  dragOver(ev) {
    this.dropZone = ev.currentTarget;
    let mvt = this.getMovement();
    //console.log(ev.type, mvt, ev);
    if (mvt && mvt !== "sidebar->sidebar") {
      // this signals that we are able to handle a drop here
      ev.preventDefault();
      ev.stopPropagation();
    }
  }

  dragLeave(ev) {
    // console.log('dragLeave', ev)
    // this.dropZone = null
    // ev.preventDefault()
  }

  drop(ev) {
    console.log("drop", ev);
    if (!this.dropZone) return;

    // let e = ev.originalEvent
    // console.log(`client ${e.x} ${e.y} - layer ${e.layerX} ${e.layerY} - offset ${e.offsetX} ${e.offsetY} - screen ${e.screenX} ${e.screenY}`)

    let movement = this.getMovement();
    console.log(movement);
    switch (movement) {
      case "content->content": // move note withing the content pane
        // simply move the note
        moveElem(
          $(this.draggedElem),
          ev.screenX - this.startPos.x,
          ev.screenY - this.startPos.y
        );

        break;

      case "sidebar->snaptarget": // move note from sidebar to content pane
        // remove note from sidebar and append it to panel
        moveNoteToContent(this.draggedElem, this.dropZone, ev, this);
        break;

      case "snaptarget->snaptarget": // move note within sidebar: do nothing
        moveElem(
          $(this.draggedElem),
          ev.screenX - this.startPos.x,
          ev.screenY - this.startPos.y
        );

      default:
        console.log("unknown/unsupported movement ");
    }
  }
}

// Singleton class holding the state for a drag-and-drop interaction
// when dragging from another window
class DropInteraction {
  dropZone = null;

  constructor(ev) {
    console.log(ev.type + ": new drop interaction", ev);
    this.dragOver(ev);
  }

  // ==== utilities ====

  getMovement() {
    // return a string sourceDropZone->destinationDropZone
    let to = getDropZoneId(this.dropZone);
    if (to) return "->" + to;
    return null;
  }

  // ==== Event Handlers ===

  dragEnter(ev) {
    this.dragOver(ev);
  }

  dragOver(ev) {
    this.dropZone = ev.currentTarget;
    let mvt = this.getMovement();
    //console.log(ev.type, mvt, ev);
    if (mvt) {
      // this tells that we can drop remotely
      ev.originalEvent.dataTransfer.dropEffect = "copy";

      // this signals that we are able to handle a drop here
      ev.preventDefault();
      ev.stopPropagation();
    }
  }

  dragLeave(ev) {
    console.log("remote dragLeave", ev);
    ev.preventDefault();
  }

  drop(ev) {
    console.log("remote drop", ev);
    if (!this.dropZone) {
      dnd = null;
      return;
    }

    // Parse transfer data
    let xferData = ev.originalEvent.dataTransfer.getData("text/plain");
    console.log(xferData);
    let data = null;
    if (xferData && xferData.length > 0) data = JSON.parse(xferData);
    if (!data) {
      dnd = null;
      return;
    }

    let movement = this.getMovement();
    console.log(movement);
    switch (movement) {
      case "->sidebar": // copy remote note to sidebar
        // remove note from content and append it to sidebar
        copyNoteToSidebar(data, this.dropZone, ev, this);
        break;

      default:
        console.log("unknown/unsupported movement ");
    }

    dnd = null;
  }
}

$(function () {
  // this disables dragging a note by clicking its content
  $(".note-content").on("mousedown", (ev) => {
    console.log("note-content");
    ev.preventDefault();
  });

  $(".passage-content").on("mousedown", (ev) => {
    console.log("note-content");
    ev.preventDefault();
  });

  // we set these handlers on the container so that they are inherited by any new draggable item
  $("#container").on("dragstart", ".draggable", (ev) =>
    dnd
      ? console.warn("spurious dragstart event")
      : (dnd = new DragAndDropInteraction(ev))
  );
  $("#container").on("drag", ".draggable", (ev) =>
    dnd ? dnd.drag(ev) : console.warn("spurious drag event")
  );
  $("#container").on("dragend", ".draggable", (ev) =>
    dnd ? dnd.dragEnd(ev) : console.warn("spurious dragend event")
  );

  // these handlers are the only ones that are called when we receive a remote drag
  $(".dropzone").on("dragenter", (ev) =>
    dnd ? dnd.dragEnter(ev) : (dnd = new DropInteraction(ev))
  );
  $(".dropzone").on("dragover", (ev) =>
    dnd ? dnd.dragOver(ev) : console.warn("spurious dragover event")
  );
  $(".dropzone").on("dragleave", (ev) =>
    dnd ? dnd.dragLeave(ev) : console.warn("spurious dragleave event")
  );

  $(".dropzone").on("drop", (ev) =>
    dnd ? dnd.drop(ev) : console.warn("spurious drop event")
  );
});
