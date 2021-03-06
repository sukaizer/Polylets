var data = [];
var files = [];
var fileNames = [];
var row = 3;
var col = 4;

function refresh() {
  document.location.reload();
}

$("#refresh-button").click(function () {
  console.log("hello");
  getNewData();
});

$(document).on("input", function () {
  saveTable();
});

//drop single element
function moveNote(dragElem, dropZone, dropevent, tis) {
  // const note = document.getElementById(dropevent.dataTransfer.getData("text"));
  if (dragElem.className == "element draggable") {
    dropZone.appendChild(dragElem);
  } else if (dropZone.tagName == "TD") {
    const targetAttr = dropZone.attributes;
    autofill(dragElem, targetAttr[1].value, targetAttr[2].value);
  }
  $(document).trigger("changetext");
}

//avoiding default dnd behavior
function p(dropevent) {
  dropevent.preventDefault();
}

//autofill
function autofill(note, trow, tcol) {
  elem = note.parentNode.childNodes;
  trow = parseInt(trow, 10);
  tcol = parseInt(tcol, 10);
  while (elem.length > 1) {
    if (trow >= row) {
      addRow();
    }
    cell = getCell(tcol, trow);
    cell.append(elem[1]);
    trow += 1;
  }
}

function iterId() {
  iter += 1;
}

getData();
async function getData() {
  //html files
  const rf = await fetch("/files");
  const filesData = await rf.json();

  filesData.sort((a, b) => parseFloat(a.index) - parseFloat(b.index));

  for (let index = 0; index < filesData.length; index++) {
    var element = toDOM(filesData[index].file);
    element.setAttribute("id", "document");
    files[index] = element;
    fileNames[index] = filesData[index].fileName;
  }

  //passages
  const res = await fetch("/notes");
  const data = await res.json();

  //the passages in the saved table we mustn't display in the left bar
  const rs = await fetch("/save-tbl");
  const tbl = await rs.json();

  var list = [];

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
      h3.setAttribute("draggable", "true");
      const h3FDecoy = document.createElement("span");
      h3FDecoy.innerText = fileNames[i];
      h3.appendChild(h3FDecoy);
      const h3SDecoy = document.createElement("span");

      const h3SSDecoy = document.createElement("span");
      h3SDecoy.appendChild(h3SSDecoy);
      h3.appendChild(h3SDecoy);
      // h3.setAttribute("ondragstart", "dragDoc(event)");
      newDoc.appendChild(h3);
      document.getElementById("annotations").append(newDoc);
    }
  }

  //adding each element in the annotation tab
  for (item of data) {
    const newAnnot = document.createElement("div");
    const divPassage = document.createElement("div");
    const passage = document.createElement("a");
    const note = document.createElement("p");
    const strPassage = document.createTextNode(`${item.passage}`);
    const strNote = document.createTextNode(`${item.annotation}`);

    newAnnot.setAttribute("id", `${item.id}`);
    newAnnot.setAttribute("draggable", "true");
    // newAnnot.setAttribute("ondragstart", "drag(event)");
    const fileId = `${item.fileId}`;
    newAnnot.setAttribute("data-fileid", fileId);
    newAnnot.setAttribute("data-startOffset", `${item.startOffset}`);
    newAnnot.setAttribute("data-endOffset", `${item.endOffset}`);
    newAnnot.setAttribute("data-startIndex", `${item.startIndex}`);
    newAnnot.setAttribute("data-endIndex", `${item.endIndex}`);
    newAnnot.setAttribute("data-yPosition", `${item.yPosition}`);

    const draghandle = document.createElement("div");
    draghandle.setAttribute("class", "draghandle");

    const draghandlebutton = document.createElement("button");
    draghandlebutton.setAttribute("class", "draghandle-button");
    draghandlebutton.appendChild(
      document.createTextNode(String.fromCharCode(10005))
    );

    draghandlebutton.setAttribute("onclick", "remove(" + `${item.id}` + ")");

    draghandlebutton.onmouseover = () => {
      draghandlebutton.style.color = "red";
    };

    draghandlebutton.onmouseleave = () => {
      draghandlebutton.style.color = "black";
    };

    draghandle.appendChild(draghandlebutton);

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
        newAnnot.lastElementChild.lastElementChild.style.visibility != "hidden"
      ) {
        newAnnot.lastElementChild.lastElementChild.style.visibility = "hidden";
        hide.innerText = String.fromCharCode(9658);
      } else {
        newAnnot.lastElementChild.lastElementChild.style.visibility = "visible";
        hide.innerText = String.fromCharCode(9660);
      }
    };
    const edit = document.createElement("div");
    edit.setAttribute("class", "edit-area");
    //edit.setAttribute("contenteditable","true");        if you want to make notes editables, need little fixes with dnd and css
    const textarea = document.createElement("span");
    textarea.appendChild(note);
    edit.appendChild(textarea);
    annotationArea.appendChild(title);
    annotationArea.appendChild(hide);
    annotationArea.appendChild(edit);

    note.setAttribute("class", "annot-note");
    passage.setAttribute("class", "annot-pass");
    newAnnot.setAttribute("class", "element draggable");
    divPassage.setAttribute("class", "quote");

    passage.appendChild(strPassage);
    divPassage.appendChild(passage);
    note.appendChild(strNote);

    newAnnot.appendChild(draghandle);
    newAnnot.appendChild(divPassage);
    newAnnot.appendChild(annotationArea);

    passage.ondblclick = () => {
      openWindow(
        newAnnot.getAttribute("data-fileid"),
        newAnnot.getAttribute("data-startOffset"),
        newAnnot.getAttribute("data-endOffset"),
        newAnnot.getAttribute("data-startIndex"),
        newAnnot.getAttribute("data-endIndex"),
        newAnnot.getAttribute("data-yPosition")
      );
    };

    document.getElementById("docFolder" + fileId).append(newAnnot);
  }

  //initialize table
  $(document).trigger("changetext");
}

//refresh only for the new data
async function getNewData() {
  const res = await fetch("/notes");
  const data = await res.json();

  //getAllIds
  const newIds = [];
  for (item of data) {
    const id = parseInt(`${item.id}`, 10);
    newIds.push(id);
  }

  const existingIds = [];
  //delete unwanted passages
  for (item of document.getElementsByClassName("element draggable")) {
    const id2 = parseInt(item.id, 10);
    if (!newIds.includes(id2)) {
      item.remove();
    }
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));
    await delay(50);
    existingIds.push(id2);
  }

  //adding new passages
  for (item of data) {
    console.log("newIds", item);
    console.log("existingIds", existingIds);
    console.log("exist", existingIds.includes(parseInt(`${item.id}`, 10)));
    if (!existingIds.includes(parseInt(`${item.id}`, 10))) {
      if (document.getElementById("docFolder" + `${item.fileId}`) == null) {
        const newDoc = document.createElement("div");
        newDoc.setAttribute("id", "docFolder" + `${item.fileId}`);
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
        document.getElementById("annotations").append(newDoc);
      }
      document
        .getElementById("docFolder" + `${item.fileId}`)
        .append(createPassage(item));
      i += 10;
    }
  }
}

function remove(annot) {
  document.getElementById(annot).remove();
}

getSavedTable();
async function getSavedTable() {
  const rs = await fetch("/save-tbl");
  const tbl = await rs.json();

  if (tbl.length != 0) {
    document.getElementById("tbl").remove();
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));
    for (item of tbl) {
      const doc = document.createElement("div");
      doc.innerHTML = `${item.table}`;
      document.getElementById("table-line").append(doc);
    }
    await delay(100);
    $("table .draghandle-button").trigger("click");
  }
}

async function saveTable() {
  const tbl = document.getElementById("tbl").outerHTML;
  const save = {
    table: tbl,
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
  fetch("/save-tbl", options);
  await delay(1000);
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

//send data to server
async function sendToServer() {
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  console.log("data", data);
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  console.log(options);
  fetch("/tbl", options);
  await delay(1000);
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

function tableCoordinate() {
  for (i = 1; i <= row; i++) {
    for (j = 1; j <= col; j++) {
      $(".tbl tr:nth-child(" + i + ") td:nth-child(" + j + ")").each(
        function () {
          $(this).attr("class", "dropzone");
          $(this).attr("data-row", i - 1);
          $(this).attr("data-col", j - 1);
        }
      );
      $(".tbl tr:nth-child(" + i + ") td:nth-child(" + j + ") div").each(
        function () {
          $(this).attr("data-row", i - 1);
          $(this).attr("data-col", j - 1);
        }
      );
    }
  }
}

//add a new row
function addRow() {
  $("tbody").append(document.createElement("tr"));
  for (i = 0; i < col - 1; i++) {
    if (i == 0) {
      const nth = document.createElement("th");
      nth.setAttribute("contenteditable", "true");
      $("tr:last-child").append(nth);
    }
    const ntd = document.createElement("td");
    ntd.append(document.createElement("textarea"));
    $("tr:last-child").append(ntd);
  }
  const butt = document.createElement("button");
  butt.innerHTML = "???";
  butt.setAttribute("class", "del-row");
  butt.setAttribute("onclick", "deleteRow(" + row + ")");
  row += 1;
  $(".document").append(butt);

  var a = document.getElementsByClassName("table-line")[0];
  a.style.height =
    a.offsetHeight + document.getElementsByTagName("td")[0].offsetHeight + "px";
  $(document).trigger("changetext");
}

//add a new column
function addCol() {
  $("tr").each(function (index) {
    if (index == 0) {
      const nth = document.createElement("th");
      nth.setAttribute("contenteditable", "true");
      $(this).append(nth);
    } else {
      const ntd = document.createElement("td");
      ntd.append(document.createElement("textarea"));
      $(this).append(ntd);
    }
  });
  const butt = document.createElement("button");
  butt.innerHTML = "???";
  butt.setAttribute("class", "del-col");
  butt.setAttribute("onclick", "deleteCol(" + col + ")");
  $(".document").append(butt);
  col += 1;
  $(".tbl colgroup").append(document.createElement("col"));
  var a = document.getElementsByClassName("table-line")[0];
  a.style.width =
    a.offsetWidth + document.getElementsByTagName("td")[0].offsetWidth + "px";
  $(document).trigger("changetext");
}

//export into editor
async function exportColumn() {
  //create data
  var inc = 1;
  for (i = 1; i <= col; i++) {
    const htxt = $(".tbl tr:nth-child(1) th:nth-child(" + i + ")").text();
    if (htxt != "") {
      const header = {
        nth: 0,
        group: i - 1,
        txt: htxt,
        // export: "col",
      };
      data.push(header);
    }
    $(".tbl tr td:nth-child(" + i + ") .element").each(function (index) {
      const tis = $(this).get(0);
      console.log("tis", tis);
      const note = {
        id: "tableId" + inc,
        docId: tis.id,
        fileId: tis.attributes[3].value,
        startOffset: tis.attributes[4].value,
        endOffset: tis.attributes[5].value,
        startIndex: tis.attributes[6].value,
        endIndex: tis.attributes[7].value,
        nth: tis.attributes[9].value,
        group: tis.attributes[10].value,
        // export: "col",
      };
      data.push(note);
      inc += 1;
    });
  }
  sendToServer();
  data = [];
}

async function exportRows() {
  var inc = 1;
  for (i = 1; i <= col; i++) {
    const htxt = $(".tbl tr:nth-child(" + i + ") th").text();
    if (htxt != "") {
      const header = {
        nth: 0,
        group: i - 1,
        txt: htxt,
        // export: "row",
      };
      data.push(header);
    }
    $(".tbl tr td:nth-child(" + i + ") .element").each(function (index) {
      const tis = $(this).get(0);
      console.log("tis", tis);
      const note = {
        id: "tableId" + inc,
        docId: tis.id,
        fileId: tis.attributes[3].value,
        startOffset: tis.attributes[4].value,
        endOffset: tis.attributes[5].value,
        startIndex: tis.attributes[6].value,
        endIndex: tis.attributes[7].value,
        nth: tis.attributes[10].value,
        group: tis.attributes[9].value,
        // export: "row",
      };
      data.push(note);
      inc += 1;
    });
  }
  sendToServer();
  data = [];
}

//getting a cell of the table with its coordinates
function getCell(x, y) {
  tr = document.getElementsByTagName("tr");
  yaxis = tr[y];
  first = yaxis.firstElementChild;
  for (i = 1; i <= x; i++) {
    first = first.nextElementSibling;
  }
  return first;
}

//delete a column a the table
function deleteCol(c) {
  // Getting the table
  var tbl = document.getElementById("tbl");

  // Getting the rows in table.
  var row = tbl.rows;

  // Removing the column at index(col).
  for (var j = 0; j < row.length; j++) {
    // Deleting the ith cell of each row.
    row[j].deleteCell(c);
  }

  //delete button
  const butt = document.getElementsByClassName("del-col");
  butt[c - 1].remove();

  $(document).trigger("changetext");
  col -= 1;
}

function deleteRow(r) {
  //delete row
  var tr = document.getElementsByTagName("tr");
  tr[r].remove();
  //delete button
  const butt = document.getElementsByClassName("del-row");
  butt[r - 1].remove();
  $(document).trigger("changetext");
  row -= 1;
}

var isMouseDown = false;

//begin autofill
function dragAutoF(x, y) {
  var tis = getCell(x, y);
  console.log("tis", tis)
  if (tis.childNodes.length > 0) {
    isMouseDown = true;
    console.log("autoFstart");
    startCell = [
      parseInt(tis.getAttribute("data-col")),
      parseInt(tis.getAttribute("data-row")),
    ]; //get the startCell
    console.log("tis.lastElementChild.getAttribute()", tis.lastElementChild.getAttribute("data-fileid"))
    doc = document.getElementById(
      "docFolder" + tis.lastElementChild.getAttribute("data-fileid")
    );
  }
  tis.style.backgroundColor = "#E8E8E8";
}

//end autofill
function dropAutoF(x, y) {
  console.log("cell");
  console.log("x", x);
  console.log("y", y);
  var tos = getCell(x, y);
  console.log("tos", tos);
  if (isMouseDown == true) {
    isMouseDown = false;
    console.log("autoFend");
    console.log(tos);
    endCell = parseInt(tos.getAttribute("data-row")); //get the end cell
    //call the auto-fill function
    offset = endCell - startCell[1];
    console.log("offset", offset);
    autoFill(doc, startCell, offset);
  }
}

//it should also have a fillDirection parameter (up, down, left, right)
function autoFill(doc, startPosition, offset) {
  console.log("doc", doc);
  if (doc.childNodes.length > 1) {
    //get the rest of the passages, starting from the start passage
    let restOfPassages = [];
    for (let i = 1; i <= doc.childNodes.length; i++) {
      restOfPassages.push(doc.childNodes[i]);
    }
    console.log("rest");
    console.log(restOfPassages);

    //loop over the array of restOfPassages and push each one to an array of cells
    console.log(startPosition);
    let xPosition = startPosition[0];
    console.log(xPosition);
    let yPosition = startPosition[1];
    let currentCell;

    console.log(yPosition);
    if (offset > restOfPassages.length - 1) {
      offset = restOfPassages.length - 1;
    }

    for (j = 0; j < offset; j++) {
      //get the current cell
      yPosition++;
      currentCell = getCell(xPosition, yPosition);
      console.log("curr");
      console.log(currentCell);
      //replace the text
      currentCell.append(restOfPassages[j]);
      console.log(restOfPassages[j]);
    }
  }
  $(document).trigger("changetext");
}



$("td").each(function () {
  $(this).append(document.createElement("textarea"));
});

//add delete column
$(".tbl tr:nth-child(2) td").each(function (index) {
  //columns
  const buttCol = document.createElement("button");
  buttCol.innerHTML = "???";
  buttCol.setAttribute("class", "del-col");
  buttCol.setAttribute("onclick", "deleteCol(" + index + ")");
  $(".document").append(buttCol);
  $(".tbl colgroup").append(document.createElement("col"));
});

//add delete rows
$("tr").each(function (id) {
  //rows
  if (id > 0) {
    const buttRow = document.createElement("button");
    buttRow.innerHTML = "???";
    buttRow.setAttribute("class", "del-row");
    buttRow.setAttribute("onclick", "deleteRow(" + id + ")");
    $(".document").append(buttRow);
  }
});

//drag to add row
$(".new-row").on("dragenter", function (event) {
  addRow();
});

//drag to add row
$(".new-row").mousedown(function (event) {
  addRow();
});

//drag to add column
$(".new-column").on("dragenter", function (event) {
  addCol();
});

$(".new-column").mousedown(function (event) {
  addCol();
});

//add dnd attribute and updates things
$(document).on("changetext", function () {
  // $("td").attr("ondrop", "drop(event)");
  tableCoordinate();

  $(".dropzone").mousedown(function () {
    var i = $(this).attr("data-col");
    var j = $(this).attr("data-row");
    dragAutoF(i, j);
  });

  $(".dropzone").mouseup(function () {
    var i = $(this).attr("data-col");
    var j = $(this).attr("data-row");
    dropAutoF(i, j);
  });

  //prevent autofill when dragging
  $(".dropzone div").on("dragstart", function () {
    var i = $(this).attr("data-col");
    var j = $(this).attr("data-row");
    dropAutoF(i, j);
  });

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

  //update col
  $(".del-col").each(function (id) {
    $(this).off();
    $(this).attr("onclick", "deleteCol(" + (id + 1) + ")");
    const i = id + 2;
    const pos = $(".tbl tr:nth-child(2) td:nth-child(" + i + ")").position()
      .left;
    const cstLeft = document.getElementsByTagName("td")[id].offsetWidth * 0.75;
    $(this).css({
      top: 2.5 + "%",
      left: pos + cstLeft + "px",
      position: "absolute",
    });
    //highlight deleted cells on hover
    $(this).hover(
      function () {
        for (j = 1; j < row; j++) {
          var cell = getCell(id + 1, j);
          cell.style.backgroundColor = "lightblue";
          cell.firstElementChild.style.backgroundColor = "lightblue";
        }
      },
      function () {
        for (j = 1; j < row; j++) {
          var cell = getCell(id + 1, j);
          cell.style.backgroundColor = "white";
          cell.firstElementChild.style.backgroundColor = "white";
        }
      }
    );
  });

  //update rows
  $(".del-row").each(function (id) {
    $(this).off();
    const tds = document.getElementsByTagName("tr");
    const h = tds[id + 1].getBoundingClientRect().top;
    const cst = document.getElementsByTagName("tr")[id + 1].offsetHeight;
    $(this).attr("onclick", "deleteRow(" + (id + 1) + ")");
    $(this).css({ top: h - cst / 4 + "px", left: "3%", position: "absolute" });
    //highlight deleted cells on hover
    $(this).hover(
      function () {
        for (j = 1; j < col; j++) {
          var cell = getCell(j, id + 1);
          cell.style.backgroundColor = "lightblue";
          cell.firstElementChild.style.backgroundColor = "lightblue";
        }
      },
      function () {
        for (j = 1; j < col; j++) {
          var cell = getCell(j, id + 1);
          cell.style.backgroundColor = "white";
          cell.firstElementChild.style.backgroundColor = "white";
        }
      }
    );
  });

  //highlight on autofill
  $("td").mouseover(function () {
    if (isMouseDown) {
      $(this).css("background-color", "#E8E8E8");
    }
  });

  //highlight in drag
  $("td").on("dragenter", function (event) {
    $(this).css({ backgroundColor: "#ADD8E6" });
  });

  //highlight when undrag
  $("td").on("dragend dragleave", function (event) {
    $(this).css({ backgroundColor: "white" });
  });

  $("td").on("dragenter", function (event) {
    $(this).css({ backgroundColor: "#ADD8E6" });
  });

  saveTable();
});

//disable highlight
$(document).mouseup(function () {
  $("td").css("background-color", "white");
});

//export button
$(".exportColumn").on("click", function (event) {
  exportColumn();
  // var href = $("a[href='../editor']").attr("href");
  // window.location.href = href;
});

//export button
$(".exportRows").on("click", function (event) {
  exportRows();
  // var href = $("a[href='../editor']").attr("href");
  // window.location.href = href;
});

// This name will be passed to the destination window during drag-and-drop
// and can be used to distinguish among several source windows
let windowId = "demo";

// Return the id of the closest enclosing dropzone, if any
function getDropZoneId(elem) {
  const res =
    elem.parentNode.parentNode.parentNode.className ||
    elem.parentNode.parentNode.parentNode.parentNode.className;
  return res;
}

// Move jQuery `elem` by deltaX, deltaY
function moveElem(elem, deltaX, deltaY) {
  let offset = elem.offset();
  offset.left += deltaX;
  offset.top += deltaY;
  elem.offset(offset);
}

function createPassage(data) {
  const newAnnot = document.createElement("div");
  const divPassage = document.createElement("div");
  const passage = document.createElement("a");
  const note = document.createElement("p");
  const strPassage = document.createTextNode(data.passage);
  const strNote = document.createTextNode(data.annotation);

  newAnnot.setAttribute("id", data.id);
  newAnnot.setAttribute("draggable", "true");
  newAnnot.setAttribute("data-fileId", data.fileId);
  newAnnot.setAttribute("id", data.id);
  newAnnot.setAttribute("data-startoffset", data.startOffset);
  newAnnot.setAttribute("data-endoffset", data.endOffset);
  newAnnot.setAttribute("data-startindex", data.startIndex);
  newAnnot.setAttribute("data-endindex", data.endIndex);
  newAnnot.setAttribute("data-yPosition", data.yPosition);
  newAnnot.setAttribute("class", "element draggable");

  const draghandle = document.createElement("div");
  draghandle.setAttribute("class", "draghandle");

  const draghandlebutton = document.createElement("button");
  draghandlebutton.setAttribute("class", "draghandle-button");
  draghandlebutton.appendChild(
    document.createTextNode(String.fromCharCode(10005))
  );

  draghandlebutton.onclick = () => {
    newAnnot.remove();
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
  const textarea = document.createElement("span");
  textarea.appendChild(note);
  edit.appendChild(textarea);
  annotationArea.appendChild(title);
  annotationArea.appendChild(hide);
  annotationArea.appendChild(edit);

  note.setAttribute("class", "annot-note");
  passage.setAttribute("class", "annot-pass");
  newAnnot.setAttribute("class", "element draggable");
  divPassage.setAttribute("class", "quote");

  passage.appendChild(strPassage);
  divPassage.appendChild(passage);
  note.appendChild(strNote);

  newAnnot.appendChild(draghandle);
  newAnnot.appendChild(divPassage);
  newAnnot.appendChild(annotationArea);

  passage.ondblclick = () => {
    openWindow(
      newAnnot.getAttribute("data-fileid"),
      newAnnot.getAttribute("data-startOffset"),
      newAnnot.getAttribute("data-endOffset"),
      newAnnot.getAttribute("data-startIndex"),
      newAnnot.getAttribute("data-endIndex"),
      newAnnot.getAttribute("data-yPosition")
    );
  };

  return newAnnot;
}


async function createFromDatabase(xferData) {
  console.log("xferData", xferData);
  //passages
  const res = await fetch("/notes");
  const data = await res.json();

  for (item of data) {
    console.log("item", item);
    if (item.id == xferData.id.slice(-1)) {

    }
  }
}


function copyNoteToElement(xferData, dropZone, ev, tis) {
  // Copy note and append it to sidebar
  dropZone.append(createPassage(xferData));
}

// Global holding the current drag-and-drop interaction, if any
let dnd = null;

// Singleton class holding the state for a drag-and-drop interaction
class DragAndDropInteraction {
  draggedElem = null;
  dropZone = null;
  crt = null;

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
    console.log(this.draggedElem);
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
        this.draggedElem.firstElementChild.nextElementSibling.firstElementChild
          .innerText,
      annotation: this.draggedElem.lastElementChild.lastElementChild.innerText,
    };

    this.crt = null;
    this.crt =
      this.draggedElem.firstElementChild.nextElementSibling.cloneNode(true);
    this.crt.style.height = "80px";
    this.crt.style.width = "80px";
    document.body.appendChild(this.crt);
    this.crt.style.position = "absolute";
    this.crt.style.top = "-1000px";
    this.crt.style.left = "-1000px";

    ev.originalEvent.dataTransfer.setDragImage(this.crt, 0, 0);

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
    //console.log('drag')
  }

  dragEnd(ev) {
    //console.log("dragEnd", ev);
    ev.preventDefault();
    dnd = null; // reset interaction
  }

  dragEnter(ev) {
    this.dragOver(ev);
  }

  dragOver(ev) {
    this.dropZone = ev.currentTarget;
    let mvt = this.getMovement();
    //console.log(ev.type, mvt, ev);
    // if (mvt && mvt !== "container->container") {
    // this signals that we are able to handle a drop here
    ev.preventDefault();
    ev.stopPropagation();
    // }
  }

  dragLeave(ev) {
    // console.log('dragLeave', ev)
    this.dropZone = null;
    ev.preventDefault();
  }

  drop(ev) {
    console.log("drop", ev);
    if (!this.dropZone) return;

    // let e = ev.originalEvent
    // console.log(`client ${e.x} ${e.y} - layer ${e.layerX} ${e.layerY} - offset ${e.offsetX} ${e.offsetY} - screen ${e.screenX} ${e.screenY}`)

    let movement = this.getMovement();
    console.log(movement);
    console.log(this.draggedElem);
    switch (movement) {
      case "content->content": // move note withing the content pane
        // simply move the note
        moveElem(
          $(this.draggedElem),
          ev.screenX - this.startPos.x,
          ev.screenY - this.startPos.y
        );
        break;


      case "container->tbl": // move note from sidebar to content pane
        // remove note from sidebar and append it to panel
        //moveNoteToContent(this.draggedElem, this.dropZone, ev, this)
        moveNote(this.draggedElem, this.dropZone, ev, this);
        break;

      case "tbl->tbl":
        moveNote(this.draggedElem, this.dropZone, ev, this);
        break;

      case "tbl->hydrated":
        const drop = document.getElementById(
          "docFolder" + this.draggedElem.attributes[2].value
        );
        moveNote(this.draggedElem, drop, ev, this);
        break;

      case "container->container": // move note within sidebar: do nothing
      //break

      default:
        console.log("unknown/unsupported movement ");
    }
    this.crt.remove();
    this.crt = null;
    ev.preventDefault();
    $(document).trigger("changetext");
    saveTable();
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
      console.log("preventDefault");
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
    console.log("xferData",xferData);
    let data = null;
    data = JSON.parse(xferData);
    if (!data) {
      dnd = null;
      return;
    }

    let movement = this.getMovement();
    console.log(movement);
    switch (movement) {
      case "->hydrated": // copy remote note to sidebar
        // remove note from content and append it to sidebar
        copyNoteToElement(
          data,
          document.getElementById("docFolder" + data.fileId),
          ev,
          this
        );
        break;

      case "->tbl":
        copyNoteToElement(data, this.dropZone, ev, this);
        break;

      default:
        console.log("unknown/unsupported movement ");
    }
    dnd = null;

    $(document).trigger("changetext");
  }
}

$(function () {
  // this disables dragging a note by clicking its content
  $(".annot-pass").on("mousedown", (ev) => {
    console.log("note-content");
    ev.preventDefault();
  });

  $(".annot-note").on("mousedown", (ev) => {
    console.log("note-content");
    ev.preventDefault();
  });

  // we set these handlers on the container so that they are inherited by any new draggable item

  $("div").on("dragstart", (ev) =>
    dnd
      ? console.warn("spurious dragstart event")
      : (dnd = new DragAndDropInteraction(ev))
  );
  $("div").on("drag", (ev) =>
    dnd ? dnd.drag(ev) : console.warn("spurious drag event")
  );
  $("div").on("dragend", (ev) =>
    dnd ? dnd.dragEnd(ev) : console.warn("spurious dragend event")
  );

  //entire document
  $("h3").on("dragstart", ".draggable", (ev) =>
    dnd
      ? console.warn("spurious dragstart event")
      : (dnd = new DragAndDropInteraction(ev))
  );
  $("h3").on("drag", ".draggable", (ev) =>
    dnd ? dnd.drag(ev) : console.warn("spurious drag event")
  );
  $("h3").on("dragend", ".draggable", (ev) =>
    dnd ? dnd.dragEnd(ev) : console.warn("spurious dragend event")
  );

  //drop interaction in sidebar
  $("#annotations").on("dragenter", (ev) =>
    dnd ? dnd.dragEnter(ev) : (dnd = new DropInteraction(ev))
  );
  $("#annotations").on("dragover", (ev) =>
    dnd ? dnd.dragOver(ev) : console.warn("spurious dragover event")
  );
  $("#annotations").on("dragleave", (ev) =>
    dnd ? dnd.dragLeave(ev) : console.warn("spurious dragleave event")
  );

  $("#annotations").on("drop", (ev) =>
    dnd ? dnd.drop(ev) : console.warn("spurious drop event")
  );
});
