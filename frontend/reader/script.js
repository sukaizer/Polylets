var clicked = [];
var unpinned = [];
var firstEnter = [];
var idList = [];
var referenceObjects = [];
var passages = [];
var files = [];

getData();

function save(i) {
    var div = referenceObjects[i];
    if (!clicked[i]) {
        var element = document.getElementById("snaptarget");
        var rect = element.getBoundingClientRect();
        div.style.top = rect.top +'px';
        div.style.left = rect.left + 'px';
        div.hidden = false;
        $('#'+i).draggable({
            disable: true,
            containment: "#snaptarget",
            snap: ".annotationBar",
            snapmode:"inner"
        });
        drag(i);
    } else {
        var myWindow = window.open("", "", "");
        var element = document.createElement("div");
        element.setAttribute("id", "document");
        element.appendChild(files[passages[i].fileId - 1]);
        myWindow.document.write(element.innerHTML);
        console.log(passages[i]);
        var selectionObject = {
            startNode: passages[i].startNode, 
            endNode: passages[i].endNode, 
            startOffset: passages[i].startOffset, 
            endOffset: passages[i].endOffset, 
            yPosition: passages[i].yPosition, 
        }
        reselect(myWindow, selectionObject);
    }
}

function drag(i) {
    $(function () {
        var div = referenceObjects[i];
        if (unpinned[i]) {
            unpinned[i] = false;
            $('#'+i).draggable("option", "disabled", true);
            div.style.cursor = 'default';
            div.style.borderWidth = 0 + 'px';
        } else {
            clicked[i] = true;
            $('#'+i).draggable("option", "disabled", false);
            div.style.cursor = 'move';
            div.style.borderWidth = 5 +'px';
        }
    })
}

function unpin(i) {
    $(function () {
        clicked[i] = false;
        unpinned[i] = true;
    })
}

function createJSObject(item) {
    var obj = {
        rangeStart : `${item.rangeStart}`,
        rangeLength : `${item.rangeLength}`,
        startParentNode : `${item.startParentNode}`,
        parentNode : `${item.parentNode}`,
        yPosition : `${item.yPosition}`,
        passage : `${item.passage}`,
        annotation : `${item.annotation}`,
        fileId : `${item.fileId}`,
        startOffset : `${item.startOffset}`,
        endOffset : `${item.endOffset}`,
        startNode : `${item.startNode}`,
        endNode : `${item.endNode}`
    }
    return obj;
}

async function getData() {
    const rs = await fetch('/files');
    const filesData = await rs.json();
    
    for (let index = 0; index < 4; index++) {
        var element = document.createElement("div");
        element.setAttribute("id", "document");
        this.buildDOM(element, filesData[index]);
        files[index] = element;
    }

    const res = await fetch('/notes');
    const data = await res.json();

    var i = 0;
    for (item of data) {
        passages[i] = createJSObject(item);
        const newAnnot = document.createElement('div');
        const passage = document.createElement('span');
        const note = document.createElement('span');
        const strPassage = document.createTextNode(`${item.passage}`);
        const strNote = document.createTextNode(`${item.annotation}`);
        
        idList[i] = `${item._id}`;
        note.setAttribute("class", "annot-note")
        passage.setAttribute("class", "annot-pass")
        passage.setAttribute("id", `${item._id}`);
        newAnnot.setAttribute("class", "element");

        passage.appendChild(strPassage);
        note.appendChild(strNote);
        newAnnot.appendChild(passage);
        newAnnot.appendChild(note);

        document.getElementById("document").append(newAnnot);
        document.getElementById("document").append(document.createElement('p'));


        const newRef = document.createElement('div');
        newRef.setAttribute("id", i);
        newRef.setAttribute("class", "draggable");
        newRef.style.borderColor = "#"+Math.floor(Math.random()*16777215).toString(16);
        newRef.onclick = () => {
            save(newRef.getAttribute("id"));
        }
        newRef.style.position = "absolute";
        newRef.hidden = true;
        const refBut = document.createElement('a');
        refBut.setAttribute("class", "unpin");
        refBut.appendChild(document.createTextNode("UNPIN"));
        refBut.onclick = () => {
            unpin(newRef.getAttribute("id"));
        }
        newRef.appendChild(refBut);
        document.getElementById("referenceObjects").append(newRef);
        referenceObjects[i] = newRef;

        passage.addEventListener("mouseenter", function (event) {
            if (!clicked[newRef.getAttribute("id")]) {
                newRef.style.top = event.clientY - 10 + 'px'; //or whatever 
                newRef.style.left = event.clientX - 10   + 'px'; // or whatever
            }
            newRef.hidden = false;
            event.target.style.color = "orange";
        }, false);
        
        passage.addEventListener("mouseleave", function (event) {
            event.target.style.color = "";
        }, false);


        newRef.addEventListener("mouseleave", function (event) {
            if (clicked[newRef.getAttribute("id")]) {
                newRef.hidden = false;
            } else {
                newRef.hidden = true;
            }
        }, false);

        clicked[i] = false;
        unpinned[i] = false;
        i++;
    }
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

//re-select text 
//the selectionObject is similar to note in your code
function reselect(myWindow, selectionObject) {
    console.log(selectionObject.startNode);
    //scroll to the position 
    myWindow.document.getElementById("document").scrollTo(0, selectionObject.yPosition);
    //reselect the selection 
    const newRange = new Range(); 
    console.log(selectionObject.startNode.firstChild);
    console.log(selectionObject.startOffset);
    newRange.setStart(selectionObject.startNode.firstChild, selectionObject.startOffset); 
    console.log(newRange);
    newRange.setEnd(selectionObject.endNode.firstChild, selectionObject.endOffset); 
    console.log(newRange.toString());

    
    console.log(newRange); 
    let selection = myWindow.getSelection();
    selection.removeAllRanges(); 
    selection.addRange(newRange);            
}