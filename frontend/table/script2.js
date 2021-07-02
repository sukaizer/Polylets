var data = [];
var files = [];
var row = 2;
var col = 3;



//drop single element
function moveNote(dragElem, dropZone, dropevent, tis) {
  // const note = document.getElementById(dropevent.dataTransfer.getData("text"));
  console.log("note");
  console.log(dragElem);
  if (dragElem.className == "element draggable") {
    dropZone.appendChild(dragElem);
  } else if (dropZone.tagName == "TD") {
    console.log("title")
    const targetAttr = dropZone.attributes
    autofill(dragElem, targetAttr[1].value, targetAttr[2].value)
  }
  $(document).trigger("changetext");
}

//avoiding default dnd behavior
function p(dropevent) {
  dropevent.preventDefault();
}


//autofill
function autofill(note, trow, tcol) {
  elem = note.parentNode.childNodes
  trow = parseInt(trow, 10);
  while (elem.length > 1) {
    if (trow > row) {
      addRow();
    }
    cell = getCell(tcol, trow);
    cell.append(elem[1])
    trow += 1;
      
  }
  elem[0].remove();
}




function iterId() {
    iter += 1;
}

getData();
async function getData() {

  //html files
  const rf = await fetch('/files');
	const filesData = await rf.json();

	for (let index = 0; index < 4; index++) {
		var element = document.createElement("div");
		element.setAttribute("id", "document");
		this.buildDOM(element, filesData[index]);
		files[index] = element;
	}

  //passages
  const res = await fetch('/notes');
  const data = await res.json();

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
			const newDoc = document.createElement('div');
			newDoc.setAttribute("id", "docFolder" + i)
			const h3 = document.createElement('h3');
			h3.setAttribute("id", "Document"+i)
			h3.setAttribute("draggable", "true");
      const h3FDecoy = document.createElement('span');
      h3FDecoy.innerText = "Document " + i;
      h3.appendChild(h3FDecoy);
      const h3SDecoy = document.createElement('span');
      
      const h3SSDecoy = document.createElement('span');
      h3SDecoy.appendChild(h3SSDecoy);
      h3.appendChild(h3SDecoy);
			// h3.setAttribute("ondragstart", "dragDoc(event)");
			newDoc.appendChild(h3);
			document.getElementById("annotations").append(newDoc);
		}
	}

	//adding each element in the annotation tab
    for (item of data) {
        const newAnnot = document.createElement('div');
        const divPassage = document.createElement('div');
        const passage = document.createElement('a');
        const note = document.createElement('p');
        const strPassage = document.createTextNode(`${item.passage}`);
        const strNote = document.createTextNode(`${item.annotation}`);

        newAnnot.setAttribute("id", `${item.id}`);
        newAnnot.setAttribute("draggable", "true");
        // newAnnot.setAttribute("ondragstart", "drag(event)");
        const fileId = `${item.fileId}`;
        newAnnot.setAttribute("data-fileid", fileId);
        newAnnot.setAttribute("data-startOffset", `${item.startOffset}`)
        newAnnot.setAttribute("data-endOffset", `${item.endOffset}`)
        newAnnot.setAttribute("data-startIndex", `${item.startIndex}`)
        newAnnot.setAttribute("data-endIndex", `${item.endIndex}`)

		newAnnot.ondblclick = () => {
            openWindow(newAnnot.getAttribute("data-fileid"),
						newAnnot.getAttribute("data-startOffset"),
						newAnnot.getAttribute("data-endOffset"),
						newAnnot.getAttribute("data-startIndex"),
						newAnnot.getAttribute("data-endIndex"),);
        }


        const draghandle = document.createElement("div");
        draghandle.setAttribute("class", "draghandle");

        const draghandlebutton = document.createElement("button");
        draghandlebutton.setAttribute("class", "draghandle-button");
        draghandlebutton.appendChild(
          document.createTextNode(String.fromCharCode(10005))
        );

        draghandlebutton.onclick = () => {
          newAnnot.remove();
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

        newAnnot.appendChild(draghandle)
        newAnnot.appendChild(divPassage);
        newAnnot.appendChild(annotationArea);

        document.getElementById("docFolder" + fileId).append(newAnnot);
    }

    //initialize table
    $(document).trigger("changetext");
};


//open window when double click
function openWindow(id, startOffset, endOffset, startIndex, endIndex) {
    var myWindow = window.open("", "", "");
    var element = document.createElement("div");
    element.setAttribute("id", "document");
    element.appendChild(files[id - 1]);
    myWindow.document.write(element.innerHTML);
    
    reselect(myWindow, startOffset, endOffset, startIndex, endIndex);
}


//select passage in new window
function reselect(myWindow, startOffset, endOffset, startIndex, endIndex)  {
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
        } if (i == endIndex) {
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
    }
    else {
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




//send data to server
async function sendToServer() {
	const delay = ms => new Promise(res => setTimeout(res, ms));

	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	};
	fetch('/tbl', options);
	await delay(1000);
}




function buildDOM(element, jsonObject) { // element is the parent element to add the children to
    if (typeof jsonObject == "string") {
        jsonObject = JSON.parse(jsonObject);
    }
    if (Array.isArray(jsonObject)) {
        for (var i = 0; i < jsonObject.length; i++) {
            this.buildDOM(element, jsonObject[i]);
        }
    }
    else {
        var e = document.createElement(jsonObject.tag);
        for (var prop in jsonObject) {
            if (prop != "tag") {
                if (prop == "children" && Array.isArray(jsonObject[prop])) {
                    this.buildDOM(e, jsonObject[prop]);
                }
                else if (prop == "html") {
                    e.innerHTML = jsonObject[prop];
                }
                else {
                    e.setAttribute(prop, jsonObject[prop]);
                }
            }
        }
        element.appendChild(e);
    }
}


function tableCoordinate() {
	for (i = 1 ; i <= row ; i++) {
		for (j = 1 ; j <= col ; j++) {
			$('.tbl tr:nth-child('+i+') td:nth-child('+j+')').each(function() {
        $(this).attr("class", "dropzone")
				$(this).attr('data-row', i);
        $(this).attr('data-col', j);
        //add mousedown and up event  
        // $(this).attr("onmousedown", "dragAutoF("+j+","+i+")");
        // $(this).attr("onmouseup", "dropAutoF("+j+","+i+")");
			})
			$('.tbl tr:nth-child('+i+') td:nth-child('+j+') div').each(function() {
				$(this).attr('data-row', i);
        $(this).attr('data-col', j);
			})
		}
	}
}

//add a new row
function addRow() {
  $("tbody").append(document.createElement("tr"));
  for (i = 0 ; i < col ; i++) {
    $("tr:last-child").append(document.createElement("td"));
  }
  const butt = document.createElement("button");
  butt.innerHTML = "X"
  butt.setAttribute("class", "del-row")
  butt.setAttribute("onclick", "deleteRow("+row+")");
  row += 1;
  $(".document").append(butt);
  $(document).trigger("changetext");
}


//add a new column
function addCol() {
  $("tr").each(function() {
    $(this).append(document.createElement("td"));
  })
  const butt = document.createElement("button")
  butt.innerHTML = "X"
  butt.setAttribute("class", "del-col")
  butt.setAttribute("onclick", "deleteCol("+col+")");
  $(".document").prepend(butt);
  col += 1;
  $(".tbl colgroup").append(document.createElement("col"))
  $(document).trigger("changetext");
}


//export into editor
async function exportToEditor() {
	//create data
  var inc = 1
	for (i = 1 ; i <= col ; i++) {
		$('.tbl tr td:nth-child('+i+') .element').each(function(index) {  
      const tis = $(this).get(0);
      const note = {
        id : "tableId" + inc,
        docId : tis.id,
        fileId : tis.attributes[3].value,
        startOffset : tis.attributes[4].value,
        endOffset : tis.attributes[5].value,
        startIndex : tis.attributes[6].value,
        endIndex : tis.attributes[7].value,
        row: tis.attributes[8].value,
        col: tis.attributes[9].value, 
      }
      data.push(note);
      inc += 1
		})
	}
  sendToServer();
  data = [];
}


//getting a cell of the table with its coordinates
function getCell(x, y) {
  tr = document.getElementsByTagName("tr");
  yaxis = tr[y-1]
  first = yaxis.firstElementChild;
  for (i = 1 ; i < x ; i++) {
    first = first.nextElementSibling;
  }
  return first;
}


//delete a column a the table
function deleteCol(c) {
  // Getting the table
  var tbl = document.getElementById('tbl'); 
  
  // Getting the rows in table.
  var row = tbl.rows;  

  // Removing the column at index(col).  
  for (var j = 0; j < row.length; j++) {
      // Deleting the ith cell of each row.
      row[j].deleteCell(c);
  }

  //delete button
  const butt = document.getElementsByClassName("del-col");
  butt[c].remove();

  $(document).trigger("changetext");
  col -= 1;
}


function deleteRow(r) {
	//delete row
	var tr = document.getElementsByTagName("tr");
	tr[r].remove();
	//delete button
	const butt = document.getElementsByClassName("del-row");
	butt[r].remove();
	$(document).trigger("changetext");
	row -= 1;
}


var isMouseDown = false;


//begin autofill
function dragAutoF(x, y) {
  var tis = getCell(x, y);
  if (tis.childNodes.length > 0) {
    isMouseDown = true;
    console.log("autoFstart");
    startCell = [parseInt(tis.getAttribute("data-col")), parseInt(tis.getAttribute("data-row"))]; //get the startCell 
    doc = document.getElementById("docFolder" + tis.firstElementChild.getAttribute("data-fileid"));
  }
  tis.style.backgroundColor= "#E8E8E8";
}


//end autofill
function dropAutoF(x, y) {
  var tos = getCell(x,y);
  if (isMouseDown == true) {
    isMouseDown = false;
    console.log("autoFend");
    console.log(tos);
    endCell = parseInt(tos.getAttribute("data-row")); //get the end cell 
    //call the auto-fill function 
    offset = endCell - startCell[1];
    console.log(offset)
    autoFill(doc, startCell, offset);   
  }
}



//it should also have a fillDirection parameter (up, down, left, right)
function autoFill(doc, startPosition, offset){

  if (doc.childNodes.length > 1) {
    //get the rest of the passages, starting from the start passage 
    let restOfPassages = []; 
    for (let i = 1; i<= doc.childNodes.length; i++){
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
    if (offset > restOfPassages.length-1) {
      offset = restOfPassages.length-1;
    }


    for (j = 0; j < offset; j++){
      //get the current cell 
      yPosition++; 
      currentCell = getCell(xPosition,yPosition);
      console.log("curr")
      console.log(currentCell);
      //replace the text 
      currentCell.innerHTML = ''; 
      currentCell.append(restOfPassages[j]);
      console.log(restOfPassages[j]);
      
    }
  }
}


//add delete column
$(".tbl tr:nth-child(1) td").each(function(index) {
  //columns
  const buttCol = document.createElement("button")
  buttCol.innerHTML = "X"
  buttCol.setAttribute("class", "del-col")
  buttCol.setAttribute("onclick", "deleteCol("+index+")");
  $(".document").prepend(buttCol);
  $(".tbl colgroup").append(document.createElement("col"))
})


//add delete rows
$("tr").each(function(id) {
  //rows
  const buttRow =document.createElement("button");
  buttRow.innerHTML = "X"
  buttRow.setAttribute("class", "del-row")
  buttRow.setAttribute("onclick", "deleteRow("+id+")");
  $(".document").append(buttRow)
})



//drag to add row
$(".new-row").on("dragenter", function(event) {
  addRow();
});

//drag to add row
$(".new-row").mousedown(function(event) {
  addRow();
});

//drag to add column
$(".new-column").on("dragenter", function(event) {
  addCol();
});

$(".new-column").mousedown(function(event) {
  addCol();
});



//add dnd attribute and updates things
$(document).on("changetext", function() {
  // $("td").attr("ondrop", "drop(event)");
  tableCoordinate();
  
  $(".dropzone").mousedown(function() {
    const i = $(this).attr("data-col");
    const j = $(this).attr("data-row");
    dragAutoF(i, j);
  })

  $(".dropzone").mouseup(function() {
    const i = $(this).attr("data-col");
    const j = $(this).attr("data-row");
    dropAutoF(i, j);
  })


  //prevent autofill when dragging
  $(".dropzone div").on("dragstart", function() {
    const i = $(this).attr("data-col");
    const j = $(this).attr("data-row");
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
  $(".del-col").each(function(id) {
    $(this).attr("onclick", "deleteCol("+id+")");
	const i = id+1;
	const pos = $(".tbl tr:nth-child(1) td:nth-child("+i+")").position().left;
	$(this).css({top: 5 +'px', left: pos + 100 + 'px', position:'absolute'});
  })
  //update rows
  $(".del-row").each(function(id) {
	const tds = document.getElementsByTagName("tr");
	const h = tds[id].getBoundingClientRect().top;
    $(this).attr("onclick", "deleteRow("+id+")");
	$(this).css({top: h -140 +'px', left: '5px', position:'absolute'});
  })

  //highlight on autofill
  $("td").mouseover(function () { 
    if (isMouseDown) {
      $(this).css("background-color", "#E8E8E8")
    }
  });

  //highlight in drag
  $("td").on("dragenter", function(event) {
    $(this).css({backgroundColor: "#ADD8E6"})
  })
  
  //highlight when undrag
  $("td").on("dragend dragleave", function(event) {
    $(this).css({backgroundColor: "white"})
  })


})




//disable highlight
$(document).mouseup(function() {
  $("td").css("background-color", "white");
})


//export button
$(".exporter").on("click", function(event) {
	exportToEditor();
	var href = $("a[href='../editor']").attr('href');
	window.location.href = href;
})




// This name will be passed to the destination window during drag-and-drop
// and can be used to distinguish among several source windows
let windowId = "demo";


// Return the id of the closest enclosing dropzone, if any
function getDropZoneId(elem) {
  const res = elem.parentNode.parentNode.parentNode.className ||  elem.parentNode.parentNode.parentNode.parentNode.className 
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
  const divPassage = document.createElement('div');
  const passage = document.createElement('a');
  const note = document.createElement('p');
  const strPassage = document.createTextNode(data.passage);
  const strNote = document.createTextNode(data.annotation);

  newAnnot.setAttribute("id", data.id);
  newAnnot.setAttribute("draggable", "true");
  newAnnot.setAttribute("fileId", data.fileId);
  newAnnot.setAttribute("id", data.id);
  newAnnot.setAttribute("data-startoffset", data.startOffset);
  newAnnot.setAttribute("data-endoffset", data.endOffset);
  newAnnot.setAttribute("data-startindex", data.startIndex);
  newAnnot.setAttribute("data-endindex", data.endIndex);
  newAnnot.setAttribute("class", "element draggable");


  newAnnot.ondblclick = () => {
    openWindow(newAnnot.getAttribute("data-fileid"),
    newAnnot.getAttribute("data-startOffset"),
    newAnnot.getAttribute("data-endOffset"),
    newAnnot.getAttribute("data-startIndex"),
    newAnnot.getAttribute("data-endIndex"),);
}



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

        newAnnot.appendChild(draghandle)
        newAnnot.appendChild(divPassage);
        newAnnot.appendChild(annotationArea);




 

  return newAnnot;
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
      passage: this.draggedElem.firstElementChild.nextElementSibling.firstElementChild.innerText,
      annotation: this.draggedElem.lastElementChild.lastElementChild.innerText
    };

    this.crt = null;
    this.crt = this.draggedElem.firstElementChild.nextElementSibling.cloneNode(true);
    this.crt.style.height = "80px";
    this.crt.style.width = "80px";
    document.body.appendChild(this.crt);
    this.crt.style.position = "absolute"; 
    this.crt.style.top = "-1000px"; this.crt.style.left = "-1000px";

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
    this.dropZone = null
    ev.preventDefault()
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

      // case "content->container": // move note from content pane to sidebar
      //   // remove note from content and append it to sidebar
      //   moveNoteToSidebar(this.draggedElem, this.dropZone, ev, this);
      //   break;

      // case "container->content": // move note from sidebar to content pane
      //   // remove note from sidebar and append it to panel
      //   moveNoteToContent(this.draggedElem, this.dropZone, ev, this);
      //   break;

      case "container->tbl": // move note from sidebar to content pane
        // remove note from sidebar and append it to panel
        //moveNoteToContent(this.draggedElem, this.dropZone, ev, this)
        moveNote(this.draggedElem, this.dropZone, ev, this);
        break;

      case "tbl->tbl":
        moveNote(this.draggedElem, this.dropZone, ev, this);
        break;
      
      case "tbl->hydrated":
        const drop = document.getElementById("docFolder" + this.draggedElem.attributes[2].value);
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
    console.log(xferData);
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
        console.log("hey");
        copyNoteToElement(data, document.getElementById("docFolder" + data.fileId), ev, this);
        break;

      case "->tbl":
        
        copyNoteToElement(data, this.dropZone, ev, this);
        break;

      default:
        console.log("unknown/unsupported movement ");
    }
    dnd = null;
  }
}


$(function() {
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