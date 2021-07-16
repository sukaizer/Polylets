let Inline = Quill.import("blots/inline");
var allPassages = [];
const files = [];
var scrollPositions = [];
var displayIsAll = true; //true if all notes are displayed currently
var el = undefined;
var fileNames = [];
var list = [];

getData();
getSavedQuillData();

setTimeout(function () {
  fillQuill();
}, 300);

setTimeout(() => {
  getSavedQuill();
}, 500);


document.getElementById("save-button").onclick = () => {
  var num = document.getElementById("editor").querySelectorAll("a").length - 3;
  let object = {
    number: num,
  };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(object),
  };

  fetch("/citate", options);
};


function refresh() {
  document.location.reload();
}


//fill quill with database
async function fillQuill() {
  //wait database
  const rs = await fetch("/tbl");
  const tbl = await rs.json();
  //split into arrays
  var data = [];
  var tmp = [];
  for (i = 1; i <= tbl.length; i++) {
    tmp = [];
    for (item of tbl) {
      if (`${item.group}` == i && `${item.nth}` == 0) {
        var tmp2 = [];
        tmp2.push(item);
        data.push(tmp2);
        tmp2 = [];
      } else if (`${item.group}` == i) {
        tmp.push(item);
      }
    }
    data.push(tmp);
  }
  console.log("data");
  console.log(data);

  //sort
  for (item of data) {
    item.sort(function (a, b) {
      return a.nth - b.nth;
    });
  }

  console.log("sorted", data);

  //any item in /tbl
  quill.setSelection(0, 0);
  for (item of data) {
    for (elem of item) {
      const cursor = getCursorPosition();

      if (elem.nth == 0) {
        quill.insertText(getCursorPosition(), "\n");
        quill.insertText(getCursorPosition(), elem.txt);
      } else {
        scrollPositions.push({
          passageId: elem.docId,
          id: iter,
          scrollPos: document.getElementById(iter).offsetTop - 148,
        });

        var id = elem.docId;
        console.log(document.getElementById(id));
        var highlength = 0;

        quill.insertText(getCursorPosition(), " [");
        quill.insertText(
          getCursorPosition(),
          document.getElementById(id).lastElementChild.lastElementChild
            .lastElementChild.innerText,
          true
        );
        quill.insertText(getCursorPosition(), "] ");
        highlength = 4;

        quill.insertText(
          getCursorPosition(),
          document.getElementById(id).firstElementChild.nextElementSibling
            .firstElementChild.innerText
        );
        quill.insertText(getCursorPosition(), " ");
        quill.formatText(
          cursor +
            document.getElementById(id).lastElementChild.lastElementChild
              .lastElementChild.innerText.length +
            highlength,
          document.getElementById(id).firstElementChild.nextElementSibling
            .firstElementChild.innerText.length,
          "highlight",
          id
        );
        iter += 1;
      }
    }
    quill.insertText(getCursorPosition(), "\n\n");
  }
}

async function getSavedQuillData() {
  const rs = await fetch("/save-quill-data");
  const savedData = await rs.json();

  for (item of savedData) {
    console.log("item", ``);
    const obj = {
      passageId: `${item.passageId}`,
      id: `${item.id}`,
      scrollPos: `${item.scrollPos}`,
    };
    scrollPositions.push(obj);
  }
}

async function getSavedQuill() {
  const rs = await fetch("/save-quill");
  const savedData = await rs.json();

  console.log("saved", savedData);
  quill.setSelection(0, 0);
  for (item of savedData) {
    document.getElementsByClassName("ql-editor")[0].innerHTML = `${item.txt}`;
    console.log("savedDATASS", `${item.saveData}`);
  }
}

async function saveQuill() {
  console.log("Save Quill content")
  const text = document.getElementsByClassName("ql-editor")[0].innerHTML;
  const save = {
    txt: text,
  };

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  console.log("data", save);
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(save),
  };
  console.log("option", options);
  fetch("/save-quill", options);

  //saveData
  const saveData = [];
  for (i = 0; i < scrollPositions.length; i++) {
    const elemData = {
      passageId: scrollPositions[i].passageId,
      id: scrollPositions[i].id,
      scrollPos: scrollPositions[i].scrollPos,
    };
    saveData.push(elemData);
  }
  const options2 = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(saveData),
  };
  console.log("option2", options2);
  fetch("/save-quill-data", options2);
}

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

  const tag = document.createElement("button");
  tag.setAttribute("class", "draghandle-button");
  tag.append(document.createTextNode("Tag"));

  const cont = document.createElement("div");
  cont.setAttribute("class", "circle");
  cont.style.visibility = "hidden";
  cont.style.position = "absolute";
  document.body.appendChild(cont);

  tag.onclick = (event) => {
    if (cont.style.visibility == "visible") {
      cont.style.visibility = "hidden";
      green.style.visibility = "hidden";
      blue.style.visibility = "hidden";
      red.style.visibility = "hidden";
    } else {
      cont.style.visibility = "visible";
      green.style.visibility = "visible";
      blue.style.visibility = "visible";
      red.style.visibility = "visible";
      cont.style.top = event.pageY + 30 + "px";
      cont.style.left = event.pageX - 30 + "px";
    }
    event.stopPropagation();
  };

  $(window).click(function () {
    cont.style.visibility = "hidden";
    green.style.visibility = "hidden";
    blue.style.visibility = "hidden";
    red.style.visibility = "hidden";
  });

  tag.onmouseover = () => {
    tag.style.color = "blue";
  };

  tag.onmouseleave = () => {
    tag.style.color = "black";
  };

  // const sidebar = document.getElementById("sidebar");
  // sidebar.onscroll = () => {
  //   console.log(sidebar.pageY);

  //   // cont.style.top = tag.offsetTop + 20 + "px";
  //   // cont.style.left = tag.offsetLeft - 10 + "px";
  // };

  const green = document.createElement("button");
  green.setAttribute("class", "tag-green");
  green.style.position = "absolute";
  green.style.left = cont.style.left + 19 + "px";
  green.style.top = cont.style.top - 75 + "px";
  green.style.width = 22 + "px";
  green.style.height = 22 + "px";
  green.onclick = () => {
    if (passage.getAttribute("green") != "green") {
      passage.setAttribute("green", "green");
      // greenEff.style.visibility = "visible";
      const greenEff = document.createElement("button");
      greenEff.setAttribute("class", "tag-green-eff");
      greenEff.onclick = () => {
        passage.setAttribute("green", "none");
        greenEff.remove();
      };
      draghandle.appendChild(greenEff);
    }
  };

  const blue = document.createElement("button");
  blue.setAttribute("class", "tag-blue");
  blue.style.position = "absolute";
  blue.style.left = cont.style.left - 5 + "px";
  blue.style.top = cont.style.left - 38 + "px";
  blue.style.width = 22 + "px";
  blue.style.height = 22 + "px";
  blue.onclick = () => {
    if (passage.getAttribute("blue") != "blue") {
      passage.setAttribute("blue", "blue");
      // blueEff.style.visibility = "visible";
      const blueEff = document.createElement("button");
      blueEff.setAttribute("class", "tag-blue-eff");
      blueEff.onclick = () => {
        passage.setAttribute("blue", "none");
        blueEff.remove();
      };
      draghandle.appendChild(blueEff);
    }
  };

  const red = document.createElement("button");
  red.setAttribute("class", "tag-red");
  red.style.position = "absolute";
  red.style.left = cont.style.left + 45 + "px";
  red.style.top = cont.style.top - 38 + "px";
  red.style.width = 22 + "px";
  red.style.height = 22 + "px";
  red.onclick = () => {
    if (passage.getAttribute("red") != "red") {
      passage.setAttribute("red", "red");
      //redEff.style.visibility = "visible";
      const redEff = document.createElement("button");
      redEff.setAttribute("class", "tag-red-eff");
      redEff.onclick = () => {
        passage.setAttribute("red", "none");
        redEff.remove();
      };
      draghandle.appendChild(redEff);
    }
  };

  draghandle.appendChild(draghandlebutton);
  draghandle.appendChild(tag);
  cont.appendChild(green);
  cont.appendChild(blue);
  cont.appendChild(red);

  const quote = document.createElement("div");
  quote.setAttribute("class", "quote");
  const quoteA = document.createElement("a");
  quoteA.setAttribute("class", "notes");
  quoteA.appendChild(document.createTextNode(data.passage));
  quote.appendChild(quoteA);

  quote.ondblclick = () => {
    openWindow(
      passage.getAttribute("data-fileid"),
      passage.getAttribute("data-startOffset"),
      passage.getAttribute("data-endOffset"),
      passage.getAttribute("data-startIndex"),
      passage.getAttribute("data-endIndex")
    );
  };

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

//display all passages
function showAllPassages() {
  displayIsAll = true;
  const annotationList = document.getElementById("sidebar");
  annotationList.innerHTML = "";
  for (i in list) {
    if (list[i] != null) {
      const newDoc = document.createElement("div");
      newDoc.setAttribute("id", "docFolder" + i);
      const h3 = document.createElement("h3");
      h3.setAttribute("id", "Document" + i);
      const h3FDecoy = document.createElement("span");
      h3FDecoy.innerText = fileNames[i];
      h3.appendChild(h3FDecoy);
      const h3SDecoy = document.createElement("span");

      const h3SSDecoy = document.createElement("span");
      h3SDecoy.appendChild(h3SSDecoy);
      h3.appendChild(h3SDecoy);
      newDoc.appendChild(h3);
      annotationList.append(newDoc);
    }
  }

  allPassages.forEach((element) => {
    document
      .getElementById("docFolder" + element.getAttribute("data-fileid"))
      .append(element);
  });
}

//display only passages with 'color' tag
function ShowNotesWithSameTag(color) {
  displayIsAll = false;
  // get all the notes with the given tag

  let notesWithSameTag = [];

  allPassages.forEach((el) => {
    if (el.getAttribute(color) == color) {
      notesWithSameTag.push(el);
    }
  });
  console.log(notesWithSameTag);

  // display notes
  const annotationList = document.getElementById("sidebar");
  annotationList.innerHTML = "";

  for (i in list) {
    if (list[i] != null) {
      const newDoc = document.createElement("div");
      newDoc.setAttribute("id", "docFolder" + i);
      const h3 = document.createElement("h3");
      h3.setAttribute("id", "Document" + i);
      const h3FDecoy = document.createElement("span");
      h3FDecoy.innerText = fileNames[i];
      h3.appendChild(h3FDecoy);
      const h3SDecoy = document.createElement("span");

      const h3SSDecoy = document.createElement("span");
      h3SDecoy.appendChild(h3SSDecoy);
      h3.appendChild(h3SDecoy);
      newDoc.appendChild(h3);
      annotationList.append(newDoc);
    }
  }
  notesWithSameTag.forEach((element) => {
    annotationList.appendChild(element);
    document
      .getElementById("docFolder" + element.getAttribute("data-fileid"))
      .append(element);
  });
}

class HighlightBlot extends Inline {
  static create(id) {
    let node = super.create();
    //node.setAttribute('id', "on");
    //highlight thingy=
    node.setAttribute("id", "elementId" + iter);
    //handful for reader
    node.setAttribute(
      "data-fileId",
      document.getElementById(id).attributes[6].value
    );
    node.setAttribute(
      "data-startOffset",
      document.getElementById(id).attributes[7].value
    );
    node.setAttribute(
      "data-endOffset",
      document.getElementById(id).attributes[8].value
    );
    node.setAttribute(
      "data-startIndex",
      document.getElementById(id).attributes[9].value
    );
    node.setAttribute(
      "data-endIndex",
      document.getElementById(id).attributes[10].value
    );

    node.setAttribute("onmouseenter", "highlight(" + id + ")");

    node.setAttribute("onmouseout", "unhighlight(" + id + ")");

    // node.addEventListener("mouseenter", function (event) {
    //   highlight(id);
    // });

    // node.addEventListener("mouseleave", function (event) {
    //   unhighlight(id);
    // });

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

quill.on('text-change', function(delta, oldDelta, source) {
  saveQuill()
})



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


$("#refresh-button").click(function() {
  console.log("hello")
  refresh();
})


setTimeout(() => {
  $(".navigationBar a").hover(
    function () {
      saveQuill();
    },
    function () {
      console.log("saved");
    }
  );
}, 600);

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

    const element = toDOM(datahtml[id].file);

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
          // Note: this will thnth if setting the value of an input[type=file]
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

//when hovering over the note in editor, sidebar is scrolled and the right passage is shown
function highlight(id) {
  console.log("highlighting");
  if (displayIsAll) {
    scrollPositions.forEach((sp) => {
      console.log("sp", sp);
      if (sp.passageId == id) {
        document.getElementById("sidebar").scrollTo(0, sp.scrollPos);
        $("#" + id).css({ transform: "scale(1.2)" });
        $("#" + id).css({ transition: "transform .2s" });
      }
    });
  } else {
    el = $("#" + id).clone();
    var x = $("#sidebar").position().left + $("#sidebar").width() / 3.5;
    var y = $("#sidebar").position().top + $("#sidebar").height() / 3.5;

    console.log(x + " " + y);
    el.appendTo("body");
    el.css({
      position: "absolute",
      top: y + "px",
      left: x + "px",
      transform: "scale(0.5)",
    });

    setTimeout(() => {
      el.css({
        transform: "scale(1.3)",
        transition: "transform .2s",
      });
    }, 1);
  }
}

function unhighlight(id) {
  if (displayIsAll) {
    $("#" + id).css({ transform: "scale(1)" });
  } else {
    setTimeout(() => {
      el.css({
        transform: "scale(0.5)",
        transition: "transform .2s",
      });
    }, 1);
    el.remove();
  }
}

//sets the right id of notes for exporting in reader
function iterId() {
  var el;
  var prefix = "elementId";
  var i = 0;
  for (i; (el = document.getElementById(prefix + i)); i++) {
    console.log("hey");
  }

  // console.log("iteration");
  // console.log(iter);
  // console.log("i = " + i);
  iter = i;
}

async function getData() {
  const rf = await fetch("/files");
  const filesData = await rf.json();
  console.log(filesData);
  filesData.sort((a, b) => parseFloat(a.index) - parseFloat(b.index));
  console.log(filesData);
  for (let index = 0; index < filesData.length; index++) {
    console.log(index + " " + filesData[index].fileName);
    console.log(filesData[index]);
    var element = toDOM(filesData[index].file);
    element.setAttribute("id", "document");
    files[index] = element;
    fileNames[index] = filesData[index].fileName;
  }

  const res = await fetch("/notes");
  const data = await res.json();

  for (i in data) {
    const id = data[i].fileId;
    if (list[id] == null) {
      list[id] = [];
    }
    list[id].push(data[i]);
  }

  //add div per document
  for (i in list) {
    if (list[i] != null) {
      const newDoc = document.createElement("div");
      newDoc.setAttribute("id", "docFolder" + i);
      const h3 = document.createElement("h3");
      h3.setAttribute("id", "Document" + i);
      const h3FDecoy = document.createElement("span");
      h3FDecoy.innerText = fileNames[i];
      h3.appendChild(h3FDecoy);
      const h3SDecoy = document.createElement("span");

      const h3SSDecoy = document.createElement("span");
      h3SDecoy.appendChild(h3SSDecoy);
      h3.appendChild(h3SDecoy);
      newDoc.appendChild(h3);
      document.getElementById("sidebar").append(newDoc);
    }
  }
  for (item of data) {
    document
      .getElementById("docFolder" + `${item.fileId}`)
      .append(createPassage(item));
    i += 10;
  }
}

//open window when double click
function openWindow(id, startOffset, endOffset, startIndex, endIndex) {
  var myWindow = window.open("", "", "");
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

  //scroll to the position
  //window.getElementById("content").scrollTo(0, selectionObject.yPosition);

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
      //console.log("User cursor is at index", range.index);
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

// Return the HTML content of a note
function getNoteContent(note) {
  return note.lastElementChild.innerHTML;
}

// Return the HTML content of a note
function getPassageContent(note) {
  return note.firstElementChild.nextElementSibling.innerHTML;
}

function moveNoteToEditor(note, sidebar, ev, dnd) {
  iterId();
  const cursor = getCursorPosition();
  // quill.format('highlight', note);
  var highlength = 0;
  scrollPositions.push({
    passageId: note.id,
    id: iter,
    scrollPos: document.getElementById("sidebar").scrollTop,
  });
  if (note.lastElementChild.innerText.length != 0) {
    quill.insertText(getCursorPosition(), " [");
    quill.insertText(
      getCursorPosition(),
      note.lastElementChild.lastElementChild.lastElementChild.innerText,
      true
    );
    quill.insertText(getCursorPosition(), "] ");
    highlength = 4;
  }
  quill.insertText(
    getCursorPosition(),
    note.firstElementChild.nextElementSibling.firstElementChild.innerText,
    true
  );
  quill.insertText(getCursorPosition(), " ");

  quill.formatText(
    cursor +
      note.lastElementChild.lastElementChild.lastElementChild.innerText.length +
      highlength,
    note.firstElementChild.nextElementSibling.firstElementChild.innerText
      .length,
    "highlight",
    note.id
  );
}

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
    let xferData = {
      windowId: windowId,
      cursorOffset: this.cursorOffset,
      id: this.draggedElem.getAttribute("id"),
      fileId: this.draggedElem.getAttribute("data-fileid"),
      startOffset: this.draggedElem.getAttribute("data-startoffset"),
      endOffset: this.draggedElem.getAttribute("data-endoffset"),
      startIndex: this.draggedElem.getAttribute("data-startindex"),
      endIndex: this.draggedElem.getAttribute("data-endoffset"),
      passage:
        this.draggedElem.firstElementChild.nextSibling.firstElementChild
          .innerText,
      annotation: this.draggedElem.lastElementChild.lastElementChild.innerText,
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
    saveQuill();
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
