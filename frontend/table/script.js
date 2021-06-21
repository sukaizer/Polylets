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
  $(document).trigger("changetext")
  
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


//add column
$(".tbl tr:nth-child(1) td").each(function(index) {
  //columns
  const buttCol = document.createElement("button")
  buttCol.innerHTML = "X"
  buttCol.setAttribute("class", "del-col")
  buttCol.setAttribute("onclick", "deleteCol("+index+")");
  $(".document").prepend(buttCol);
  $(".tbl colgroup").append(document.createElement("col"))
})


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
  $(this).trigger("changetext");
});

//drag to add column
$(".new-column").on("dragenter", function(event) {
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
  $(this).trigger("changetext");
});


//add dnd attribute and updates things
$(document).on("changetext", function() {
  tableCoordinate();
  $("td").attr("ondrop", "drop(event)");
  //update col
  $(".del-col").each(function(id) {
    $(this).attr("onclick", "deleteCol("+id+")");
	const i = id+1;
	const pos = $(".tbl tr:nth-child(1) td:nth-child("+i+")").position().left;
	console.log(pos);
	$(this).css({top: 5 +'px', left: pos + 45 + 'px', position:'absolute'});
  })
  //update rows
  $(".del-row").each(function(id) {
	const tds = document.getElementsByTagName("tr");
	const h = tds[id].getBoundingClientRect().top;
    $(this).attr("onclick", "deleteRow("+id+")");
	$(this).css({top: h -140 +'px', left: '5px', position:'absolute'});
  })
})




//export button
$(".exporter").on("click", function(event) {
	exportToEditor();
})

