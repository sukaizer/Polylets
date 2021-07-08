var clicked = [];
var firstEnter = [];

var referenceObjects = [];
var passages = [];
var files = [];

var file;
var NOTEWIDTH;

$(function () {
  $("#snaptarget").sortable();
  $("#snaptarget").disableSelection();
});

//loads html file into page div
var recupererFichiers = function () {
  file = document.getElementById("myfiles").files[0];
  if (file) {
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = function (evt) {
      document.getElementById("document").innerHTML = evt.target.result;
      getData();
    };
    reader.onerror = function (evt) {
      document.getElementById("document").innerHTML = "error reading file";
    };
  }
};

document.querySelector("#myfiles").onchange = recupererFichiers;

//adds note to side pannel
function save(i) {
  var div = referenceObjects[i];
  if (!clicked[i]) {
    document.getElementById(i).remove();
    document.getElementById("snaptarget").append(div);
    clicked[i] = true;
    div.style.position = "static";
    div.style.cursor = "move";
    div.style.borderWidth = 5 + "px";
    div.style.width = 85 + "%";
    div.style.height = 210 + "px";
    document.getElementById("button" + i).hidden = true;
    document.getElementById("button" + i).disabled = true;
    document.getElementById("buttonUnpin" + i).style.visibility = "visible";
  }
}

function openWindow(i) {
  var myWindow = window.open("", "", "");
  var element = document.createElement("div");
  element.setAttribute("id", "document");
  element.appendChild(files[passages[i].fileId]);
  myWindow.document.write(element.innerHTML);
  console.log(passages[i]);
  reselect(myWindow, passages[i]);
}

//function to unpin and resets note position
function unpin(i) {
  $(function () {
    clicked[i] = false;
    var div = referenceObjects[i];
    div.remove();
    document.getElementById("referenceObjects").append(div);
    clicked[i] = false;
    div.style.position = "absolute";
    div.style.cursor = "default";
    div.style.borderWidth = 0 + "px";
    document.getElementById("button" + i).hidden = false;
    document.getElementById("button" + i).disabled = false;
    document.getElementById("buttonUnpin" + i).style.visibility = "hidden";
    div.style.height = 210 + "px";
    div.style.width = 300 + "px";
  });
}

//get the data from db and creating the notes, setting all data
async function getData() {
  const rs = await fetch("/files");
  const filesData = await rs.json();

  for (let index = 0; index < filesData.length; index++) {
    var element = toDOM(filesData[index].file);
    element.setAttribute("id", "document");
    files[index] = element;
  }

  var el;
  var prefix = "elementId";
  for (var i = 0; (el = document.getElementById(prefix + i)); i++) {
    //sets data for each note in the file
    passages[i] = {
      fileId: el.getAttribute("data-fileid"),
      startOffset: el.getAttribute("data-startoffset"),
      endOffset: el.getAttribute("data-endoffset"),
      startIndex: el.getAttribute("data-startindex"),
      endIndex: el.getAttribute("data-endindex"),
    };

    const newRef = document.createElement("li");
    newRef.setAttribute("id", i);
    newRef.setAttribute("class", "draggable");
    newRef.style.borderColor =
      "#" + Math.floor(Math.random() * 16777215).toString(16);

    newRef.style.position = "absolute";
    newRef.hidden = true;

    newRef.style.width = 300 + "px";
    newRef.style.height = 210 + "px";

    const refBut1 = document.createElement("button");
    refBut1.setAttribute("id", "button" + i);
    refBut1.setAttribute("class", "unpin");
    refBut1.appendChild(document.createTextNode("SAVE"));
    refBut1.onclick = () => {
      save(newRef.getAttribute("id"));
    };
    newRef.appendChild(refBut1);

    const refBut = document.createElement("button");
    refBut.setAttribute("class", "unpin");
    refBut.setAttribute("id", "buttonUnpin" + i);
    refBut.appendChild(document.createTextNode("UNPIN"));
    refBut.onclick = () => {
      unpin(newRef.getAttribute("id"));
    };
    refBut.style.visibility = "hidden";
    newRef.appendChild(refBut);

    const passageContent = document.createElement("div");
    passageContent.setAttribute("class", "passage-content");
    passageContent.innerHTML = el.textContent;
    passageContent.ondblclick = () => {
      openWindow(newRef.getAttribute("id"));
    };
    newRef.style.overflow = scroll;
    newRef.appendChild(passageContent);

    document.getElementById("referenceObjects").append(newRef);
    referenceObjects[i] = newRef;

    //event listener => display note to save it
    el.addEventListener(
      "mouseenter",
      function (event) {
        if (!clicked[newRef.getAttribute("id")]) {
          newRef.style.top = event.pageY - 10 + "px"; //or whatever
          newRef.style.left = event.pageX - 10 + "px"; // or whatever
          console.log(event.clientX + "px" + " " + event.clientY + "px");
        } else {
          $("#" + newRef.getAttribute("id")).css({
            transform: "rotate(30deg)",
          });
          $("#" + newRef.getAttribute("id")).css({
            transition: "transform .2s",
          });
        }
        newRef.hidden = false;
        event.target.style.color = "orange";
      },
      false
    );

    el.addEventListener(
      "mouseleave",
      function (event) {
        event.target.style.color = "";
        if (clicked[newRef.getAttribute("id")]) {
          $("#" + newRef.getAttribute("id")).css({ transform: "rotate(0)" });
        }
      },
      false
    );

    newRef.addEventListener(
      "mouseleave",
      function (event) {
        if (clicked[newRef.getAttribute("id")]) {
          newRef.hidden = false;
        } else {
          newRef.hidden = true;
        }
      },
      false
    );
    clicked[i] = false;
  }
  NOTEWIDTH = $(".draggable").width();
  console.log(NOTEWIDTH);
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

//reselects passage in second window where original file is opened
function reselect(myWindow, selectionObject) {
  //scroll to the position
  //myWindow.document.getElementById("document").scrollTo(0, selectionObject.yPosition);

  //reselect the selection using startIndex and endIndex
  let documentNode = myWindow.document.getElementById("document");
  let node = documentNode.firstElementChild;
  let i = 0;
  let startNode;
  let endNode;

  while (node) {
    if (i == selectionObject.startIndex) {
      startNode = node;
    }
    if (i == selectionObject.endIndex) {
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
    newRange.setStart(
      startNode.firstChild.firstChild,
      selectionObject.startOffset
    );
  } else {
    newRange.setStart(startNode.firstChild, selectionObject.startOffset);
  }

  if (endNode.firstChild.nodeName == "STRONG") {
    console.log("end strong");
    newRange.setEnd(endNode.firstChild.firstChild, selectionObject.endOffset);
  } else {
    console.log(endNode.firstChild);
    newRange.setEnd(endNode.firstChild, selectionObject.endOffset);
  }

  let selection = myWindow.window.getSelection();
  selection.removeAllRanges();
  selection.addRange(newRange);
}
