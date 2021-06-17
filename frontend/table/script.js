var data = [];

function drag(dragevent) {
    var text = dragevent.target.id;
    dragevent.dataTransfer.setData("text", text);
    console.log("dragit")
    console.log(text);
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
  console.log("dropit");  
  console.log(dropevent);
  var note = dropevent.dataTransfer.getData("text");
  console.log(note);
  dropevent.target.appendChild(document.getElementById(note));
}

function p(dropevent) {
  dropevent.preventDefault();
  console.log("over");
}




function iterId() {
    console.log("iteration");
    console.log(iter);
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
  console.log('there!')
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
console.log("td")
console.log(td);
for (cell of td ) {
  console.log("cell")
  console.log(cell)
  cell.setAttribute('ondrop', `drop(event)`);
}

var row = 2;
var col = 3;

//export into editor
async function exportToEditor() {
	console.log("export");
	//create data
	var tmp = [];
	for (i = 1 ; i <= col ; i++) {
		$('.tbl tr td:nth-child('+i+') div').each(function(index) {
			tmp.push($(this));
		})
    if (tmp.length != 0) {
      data.push(tmp);  
    }
		tmp = [];
	}

	//push to the database
	console.log(data);
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


// function addt() {
//   const d = document.getElementById("ok5FF49DL5HMqkvP");
//   console.log(d)
//   const i = { name: 'New item', details: "unu" }
//   grid.source.push(i);
//   console.log("second");
//   console.log(grid.source);
// }


// //grid
// var grid = document.querySelector('revo-grid');
// var columns = [
//   { prop: 'name', name: 'First column' },
//   {
//     prop: 'details',
//     name: 'Second column',
//     cellTemplate: (createElement, props) => {
//       return createElement('div',
//         {
//           style: { backgroundColor: 'red' },
//           class: { 'inner-cell': true }
//         },
//         props.model[props.prop] || '',
//       );
//     },
//   },
// ];
// var items = [{ name: 'New item', details: 'Item description' }, {name: "jij", details: 'second item'}];
// grid.columns = columns;
// grid.source = items;
// console.log("first");
// console.log(grid.source);

// console.log("grid");
// console.log(grid);


// var cell = document.getElementsByClassName('inner-cell');
// console.log("cell");
// console.log(cell);
