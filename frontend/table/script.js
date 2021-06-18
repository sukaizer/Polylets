var data = [];

function drag(dragevent) {
    var text = dragevent.target.id;
    dragevent.dataTransfer.setData("text", text);

}

// function drop(dropevent) {
//   dropevent.preventDefault();

//   console.log("dropit");
//   var note = dropevent.dataTransfer.getData("text");
//   console.log(note);
//   const doc = document.createElement('div');
//   doc.appendChild(document.createTextNode(document.getElementById(note).firstElementChild.innerText));
//   dropevent.target.appendChild(doc);
// }

function drop(dropevent) {
  var note = dropevent.dataTransfer.getData("text");
  dropevent.target.appendChild(document.getElementById(note));
  tableCoordinate();
}

function p(dropevent) {
  dropevent.preventDefault();
}




function iterId() {
    iter += 1;
}

getData();
async function getData() {
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
        newAnnot.setAttribute("ondragstart", "drag(event)");

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
};



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





const td = document.getElementsByTagName("td");
for (cell of td ) {
  cell.setAttribute('ondrop', `drop(event)`);
}

var row = 2;
var col = 3;

function tableCoordinate() {
	for (i = 1 ; i <= row ; i++) {
		for (j = 1 ; j <= col ; j++) {
			$('.tbl tr:nth-child('+i+') td:nth-child('+j+') div').each(function() {
				$(this).attr('data-row', i);
        $(this).attr('data-col', j);
			})
		}
	}
}


//export into editor
async function exportToEditor() {
	//create data
	for (i = 1 ; i <= col ; i++) {
		$('.tbl tr td:nth-child('+i+') div').each(function(index) {  
      const tis = $(this)[0];
      const note = {
        id : tis.id,
        fileId : tis.attributes[3].value,
        startOffset : tis.attributes[4].value,
        endOffset : tis.attributes[5].value,
        startIndex : tis.attributes[6].value,
        endIndex : tis.attributes[7].value,
        row: tis.attributes[9].value,
        col: tis.attributes[10].value, 
      }
      data.push(note);
		})
	}
  sendToServer();
  data = [];
}


//add column
$(".tbl tr:nth-child(1) td").each(function(index) {
	$(".tbl colgroup").append(document.createElement("col"))
})



//drag to add row
$(".new-row").on("dragenter", function(event) {
  $("tbody").append(document.createElement("tr"));
  for (i = 0 ; i < col ; i++) {
    $("tr:last-child").append(document.createElement("td"));
  }
  row += 1;
  $(this).trigger("changetext");
});

//drag to add column
$(".new-column").on("dragenter", function(event) {
  $("tr").each(function() {
    $(this).append(document.createElement("td"));
  })
  col += 1;
  $(".tbl colgroup").append(document.createElement("col"))
  $(this).trigger("changetext");
});


//add dnd attribute to table
$(document).on("changetext", function() {
  $("td").attr("ondrop", "drop(event)");
})




//export button
$(".exporter").on("click", function(event) {
	exportToEditor();
})

