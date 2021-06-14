function drag(dragevent) {
    var text = dragevent.target.id;
    dragevent.dataTransfer.setData("text", text);
    console.log(dragevent.target.id);
}

function drop(dropevent) {
    dropevent.preventDefault();
    var note = dropevent.dataTransfer.getData("text");
    console.log(document.getElementById(note));
    const cursor = getCursorPosition();
    // quill.format('highlight', note);
    var highlength = 0;
    if (document.getElementById(note).lastElementChild.innerText.length != 0) {
        quill.insertText(getCursorPosition(), " [");
        quill.insertText(getCursorPosition(), document.getElementById(note).lastElementChild.innerText, true);
        quill.insertText(getCursorPosition(), "] ");
        highlength = 4;
    }
    quill.insertText(getCursorPosition(), document.getElementById(note).firstElementChild.innerText, true);
    quill.insertText(getCursorPosition(), " "); 
    quill.formatText(cursor + document.getElementById(note).lastElementChild.innerText.length + highlength , document.getElementById(note).firstElementChild.innerText.length ,'highlight', note);
    iterId();
}

function highlight(id) {
    document.getElementById(id).className = "hightlighted-element";
}

function unhighlight(id) {
    document.getElementById(id).className = "element";
}

function iterId() {
    console.log("iteration");
    console.log(iter);
    iter += 1;
}

getData();
async function getData() {
    console.log('da');
    const res = await fetch('/notes');
    const data = await res.json();

    for (item of data) {
        const newAnnot = document.createElement('div');
        const passage = document.createElement('a');
        const note = document.createElement('p');
        const strPassage = document.createTextNode(`${item.passage}`);
        const strNote = document.createTextNode(`${item.annotation}`);

        newAnnot.setAttribute("id", `${item._id}`);
        newAnnot.setAttribute("draggable", "true");
        newAnnot.setAttribute("ondragstart", `drag(event)`);

        newAnnot.setAttribute("data-fileid", `${item.fileId}`);
        newAnnot.setAttribute("data-startOffset", `${item.startOffset}`)
        newAnnot.setAttribute("data-endOffset", `${item.endOffset}`)
        newAnnot.setAttribute("data-startIndex", `${item.startIndex}`)
        newAnnot.setAttribute("data-endIndex", `${item.endIndex}`)

        note.setAttribute("class", "annot-note");
        passage.setAttribute("class", "annot-pass");
        newAnnot.setAttribute("class", "element");

        passage.appendChild(strPassage);
        note.appendChild(strNote);
        newAnnot.appendChild(passage);
        newAnnot.appendChild(note);

        document.getElementById("annotations").append(newAnnot);
    }
}

const grid = document.querySelector('revo-grid');
const columns = [
  { prop: 'name', name: 'First column' },
  {
    prop: 'details',
    name: 'Second column',
    cellTemplate: (createElement, props) => {
      return createElement('div',
        {
          style: { backgroundColor: 'red' },
          class: { 'inner-cell': true },
        },
        props.model[props.prop] || '',
      );
    },
  },
];
const items = [{ name: 'New item', details: 'Item description' }];
grid.columns = columns;
grid.source = items;