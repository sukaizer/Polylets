let Inline = Quill.import("blots/inline");
var nbFile = 4;
var passagesDiv = [];
getData();

class HighlightBlot extends Inline {
  static create(id) {
    let node = super.create();
    // Sanitize url if desired
    console.log("id is");
    console.log(id);

    //node.setAttribute('id', "on");
    //highlight thingy=
    node.setAttribute("id", "elementId" + iter);
    //handful for reader
    node.setAttribute(
      "data-fileId",
      document.getElementById(id).attributes[2].value
    );
    node.setAttribute(
      "data-startOffset",
      document.getElementById(id).attributes[3].value
    );
    node.setAttribute(
      "data-endOffset",
      document.getElementById(id).attributes[4].value
    );
    node.setAttribute(
      "data-startIndex",
      document.getElementById(id).attributes[5].value
    );
    node.setAttribute(
      "data-endIndex",
      document.getElementById(id).attributes[6].value
    );

    node.addEventListener("mouseenter", function (event) {
      highlight(id);
    });

    node.addEventListener("mouseleave", function (event) {
      unhighlight(id);
    });

    return node;
  }
}

HighlightBlot.blotName = "highlight";
HighlightBlot.tagName = "a";

var iter = 0;

Quill.register(HighlightBlot);

var toolbarOptions = [
  ["bold", "italic", "underline", "strike"],
  ["link", "image", "video", "formula"],
];

const quill = new Quill("#editor", {
  modules: {
    toolbar: toolbarOptions,
  },

  theme: "snow",
});

function downloadInnerHtml(filename, elId, mimeType) {
  var elHtml = document.getElementById(elId).firstElementChild.innerHTML;
  var link = document.createElement("a");
  mimeType = mimeType || "text/plain";

  link.setAttribute("download", filename);
  link.setAttribute(
    "href",
    "data:" + mimeType + ";charset=utf-8," + encodeURIComponent(elHtml)
  );
  link.click();
}

var fileName = "file.html"; // You can use the .txt extension if you want

$("#save-button").click(function () {
  console.log("save");
  downloadInnerHtml(fileName, "editor", "text/html");
  zipFile();
});

const saver = document.querySelector(".save-button");

async function zipFile() {
  var zip = new JSZip();

  const resNotes = await fetch("/notes");
  const dataNotes = await resNotes.json();

  const reshtml = await fetch("/files");
  const datahtml = await reshtml.json();

  var i = 0;

  for (item of dataNotes) {
    const id = `${item.fileId}`;

    const element = document.createElement("div");
    buildDOM(element, datahtml[id - 1]);

    console.log("fileId");
    console.log(element);
    console.log(element.outerHTML);
    zip.file("file" + i + ".html", element.outerHTML);
    i += 1;
  }

  zip.file("Hello.txt", "Hello World\n");

  zip.generateAsync({ type: "blob" }).then(function (content) {
    // see FileSaver.js
    saveAs(content, "example.zip");
  });
}

function buildDOM(element, jsonObject) {
  // element is the parent element to add the children to
  if (typeof jsonObject == "string") {
    jsonObject = JSON.parse(jsonObject);
  }
  if (Array.isArray(jsonObject)) {
    for (var i = 0; i < jsonObject.length; i++) {
      this.buildDOM(element, jsonObject[i]);
    }
  } else {
    var e = document.createElement(jsonObject.tag);
    for (var prop in jsonObject) {
      if (prop != "tag") {
        if (prop == "children" && Array.isArray(jsonObject[prop])) {
          this.buildDOM(e, jsonObject[prop]);
        } else if (prop == "html") {
          e.innerHTML = jsonObject[prop];
        } else {
          e.setAttribute(prop, jsonObject[prop]);
        }
      }
    }
    element.appendChild(e);
  }
}

function highlight(id) {
  //document.getElementById(id).className = "hightlighted-element";
  $("#" + id).css({ transform: "scale(1.2)" });
  $("#" + id).css({ transition: "transform .2s" });
}

function unhighlight(id) {
  $("#" + id).css({ transform: "scale(1)" });
}

function iterId() {
  console.log("iteration");
  console.log(iter);
  iter += 1;
}

async function getData() {
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

  for (item of data) {
    const newAnnot = document.createElement("div");
    const handle = document.createElement("div");
    const passage = document.createElement("a");
    const note = document.createElement("p");
    const strPassage = document.createTextNode(`${item.passage}`);
    const strNote = document.createTextNode(`${item.annotation}`);

    newAnnot.setAttribute("id", `${item._id}`);
    newAnnot.setAttribute("draggable", "true");

    newAnnot.setAttribute("data-fileid", `${item.fileId}`);
    newAnnot.setAttribute("data-startOffset", `${item.startOffset}`);
    newAnnot.setAttribute("data-endOffset", `${item.endOffset}`);
    newAnnot.setAttribute("data-startIndex", `${item.startIndex}`);
    newAnnot.setAttribute("data-endIndex", `${item.endIndex}`);

    note.setAttribute("class", "note-content");
    passage.setAttribute("class", "passage-content");
    newAnnot.setAttribute("class", "note draggable");
    handle.setAttribute("class", "draghandle");

    passage.appendChild(strPassage);
    note.appendChild(strNote);
    newAnnot.appendChild(handle);
    newAnnot.appendChild(passage);
    newAnnot.appendChild(note);

    //passagesDiv[`${item.fileId}`-1].append(newAnnot);

    document.getElementById("sidebar").append(newAnnot);
  }
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

// Create a note with the given content and optional position
function createNote(data, left, top) {
  let style = "";
  if (top !== undefined && left !== undefined)
    style = `style="top: ${top}px; left: ${left}px"`;
  let html = `<div id=${data.id} draggable="true" data-fileid=${data.fileId} data-startoffset=${data.startOffset} data-endoffset=${data.endOffset} data-startindex=${data.startIndex} data-endindex=${data.endIndex} class="note draggable">
        <div class="draghandle"></div>
        <a class="passage-content">
            ${data.passage}
        </a>
        <p class="note-content">
            ${data.annotation}
        </p>
    </div>`;
  return html;
}

// Return the HTML content of a note
function getNoteContent(note) {
  return note.lastElementChild.innerHTML;
}

// Return the HTML content of a note
function getPassageContent(note) {
  return note.firstElementChild.nextElementSibling.innerHTML;
}

function moveNoteToEditor(note, sidebar, ev, dnd) {
  const cursor = getCursorPosition();
  console.log(note);
  // quill.format('highlight', note);
  var highlength = 0;
  if (note.lastElementChild.innerText.length != 0) {
    quill.insertText(getCursorPosition(), " [");
    quill.insertText(
      getCursorPosition(),
      note.lastElementChild.innerText,
      true
    );
    quill.insertText(getCursorPosition(), "] ");
    highlength = 4;
  }
  quill.insertText(
    getCursorPosition(),
    note.firstElementChild.nextElementSibling.innerText,
    true
  );
  quill.insertText(getCursorPosition(), " ");

  quill.formatText(
    cursor + note.lastElementChild.innerText.length + highlength,
    note.firstElementChild.nextElementSibling.innerText.length,
    "highlight",
    note.id
  );

  iterId();
}

// Copy a note from a remote window to the sidebar
function copyNoteToSidebar(xferData, sidebar, ev, dnd) {
  // Copy note and append it to sidebar
  let html = createNote(xferData);
  $("#sidebar").append(html);
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
    let xferData = {
      windowId: windowId,
      passage: getPassageContent(this.draggedElem),
      annotation: getNoteContent(this.draggedElem),
      cursorOffset: this.cursorOffset,
    };
    ev.originalEvent.dataTransfer.setData(
      "text/plain",
      JSON.stringify(xferData)
    );
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

      case "content->sidebar": // move note from content pane to sidebar
        // remove note from content and append it to sidebar
        moveNoteToSidebar(this.draggedElem, this.dropZone, ev, this);
        break;

      case "sidebar->content": // move note from sidebar to content pane
        // remove note from sidebar and append it to panel
        moveNoteToContent(this.draggedElem, this.dropZone, ev, this);
        break;

      case "sidebar->editor": // move note from sidebar to content pane
        // remove note from sidebar and append it to panel
        //moveNoteToContent(this.draggedElem, this.dropZone, ev, this)
        moveNoteToEditor(this.draggedElem, this.dropZone, ev, this);
        break;

      case "sidebar->sidebar": // move note within sidebar: do nothing
      //break

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
        console.log("hey");
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
