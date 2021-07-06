var files = [];
//getData();
var i = 0;

var createButton = $("#create");

createButton.on("click", () => {
  const selection = window.getSelection();
  const string = selection.toString();

  const keyObject = document.createElement("div");
  const handle = document.createElement("div");
  const name = document.createElement("input");
  const button = document.createElement("button");

  button.append(document.createTextNode("✕"));
  handle.appendChild(name);
  handle.appendChild(button);
  const textArea = document.createElement("textarea");
  const separator = document.createElement("hr");
  const passageContainer = document.createElement("div");

  keyObject.ondragover = (ev) => {
    ev.preventDefault();
  };

  keyObject.ondrop = (ev) => {
    const note = document.getElementById(ev.dataTransfer.getData("text"));
    //const note = ev.dataTransfer.getData("note");

    passageContainer.appendChild(note);
  };

  textArea.placeholder = "enter search terms";
  keyObject.setAttribute("class", "key-object");
  handle.setAttribute("class", "handle");
  name.setAttribute("class", "input");
  name.placeholder = "type name";
  button.setAttribute("class", "closebutton");
  separator.setAttribute("class", "rounded");
  keyObject.appendChild(handle);
  keyObject.appendChild(textArea);
  keyObject.appendChild(separator);
  keyObject.appendChild(passageContainer);
  if (string != "") textArea.value = string;
  button.onclick = () => {
    keyObject.remove();
  };
  $(".searchBar").append(keyObject);
});

var positionButton = $("#createPassage");
positionButton.on("click", () => {
  $(".passagesBar").append(createPassage());
});

// create a passage object which will be added to the sidebar and sets the listeners
function createPassage() {
  const selection = window.getSelection();
  const string = selection.toString();
  const passage = document.createElement("div");
  passage.setAttribute("id", i);
  passage.setAttribute("green", "none");
  passage.setAttribute("blue", "none");
  passage.setAttribute("red", "none");
  passage.setAttribute("class", "passage");
  passage.setAttribute("draggable", "true");
  passage.ondragstart = (ev) => {
    var text = ev.target.id;
    const dt = ev.dataTransfer;
    dt.setData("text", text);

    dt.setDragImage(document.getElementById(text), 0, 0);
  };

  const draghandle = document.createElement("div");
  draghandle.setAttribute("class", "draghandle");

  const draghandlebutton = document.createElement("button");
  draghandlebutton.setAttribute("class", "draghandle-button");
  draghandlebutton.appendChild(
    document.createTextNode(String.fromCharCode(10005))
  );

  draghandlebutton.onmouseover = () => {
    draghandlebutton.style.color = "red";
  };

  draghandlebutton.onmouseleave = () => {
    draghandlebutton.style.color = "black";
  };

  draghandlebutton.onclick = () => {
    passage.remove();
  };

  draghandle.appendChild(draghandlebutton);

  const quote = document.createElement("div");
  quote.setAttribute("class", "quote");
  const quoteA = document.createElement("a");
  quoteA.setAttribute("class", "notes");
  quoteA.appendChild(document.createTextNode(string));
  quote.appendChild(quoteA);
$(".execSearch").on("click", () => {
    var search = $("input")[0].value;
    findAllMatches(search);
	// var search2 = $("input")[1].value;
    // findAllMatches(search2)
	const keyword = {
		sQuery : search
	}
    sendToServer(keyword);
	setTimeout(function() {
		searchResponse()
	}, 100);
	setTimeout(function() {
		findAllMatches(search);
	}, 200);
})

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
  const edit = document.createElement("textarea");
  edit.setAttribute("class", "edit-area");
  annotationArea.appendChild(title);
  annotationArea.appendChild(hide);
  annotationArea.appendChild(edit);

  passage.appendChild(draghandle);
  passage.appendChild(quote);
  passage.appendChild(annotationArea);
  i++;
  return passage;
}

$(".execSearch").on("click", () => {
  const search = $("input")[0].value;
  findAllMatches(search);
  //sendToServer(search);
});



//send data to server
async function sendToServer(data) {
	const delay = ms => new Promise(res => setTimeout(res, ms));

	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	};
	console.log(options)
	fetch('/srch', options);
	await delay(1000);
}

async function searchResponse() {
	const rs = await fetch('/srch');
	const sData = await rs.json();
	console.log("before", sData)
	for (let index = 0; index < sData.length; index++) {
		var element = document.createElement("div");
		element.setAttribute("id", "file" + index);
		element.setAttribute("class", "file");
		const file = sData[index].nfile;
		element.innerHTML = file;
		files[index] = element;
	}
	

	for (let i = 0; i < files.length ; i++) {
		var docu = document.createElement("div");
		docu.setAttribute("id", "document" + i);
		docu.setAttribute("class", "doc");
		var scroll = document.createElement("div");
		scroll.setAttribute("id", "scroll" + i);
		scroll.setAttribute("class", "scroll-bar");
		
		docu.appendChild(files[i]);
		docu.appendChild(scroll);
		document.getElementById("docBar").appendChild(docu);
		//files[i].setAttribute("data-height", files[i].lastElementChild.lastElementChild.offsetHeight);
	}
}


async function getData() {
	//html files
	const rf = await fetch('/files');
	const filesData = await rf.json();

	for (let index = 0; index < 4; index++) {
		var element = document.createElement("div");
		element.setAttribute("id", "file" + index);
		element.setAttribute("class", "file");
		console.log(filesData[index])
		this.buildDOM(element, filesData[index]);
		files[index] = element;
	}
	console.log(files)

	for (let i = 0; i < files.length ; i++) {
		var docu = document.createElement("div");
		docu.setAttribute("id", "document" + i);
		docu.setAttribute("class", "doc");
		var scroll = document.createElement("div");
		scroll.setAttribute("id", "scroll" + i);
		scroll.setAttribute("class", "scroll-bar");
		
		docu.appendChild(files[i]);
		docu.appendChild(scroll);
		document.getElementById("docBar").appendChild(docu);
		files[i].setAttribute("data-height", files[i].lastElementChild.lastElementChild.offsetHeight);
	}
}

  for (let index = 0; index < 4; index++) {
    var element = document.createElement("div");
    element.setAttribute("id", "file" + index);
    element.setAttribute("class", "file");
    this.buildDOM(element, filesData[index]);
    files[index] = element;
  }

  for (let i = 0; i < files.length; i++) {
    var docu = document.createElement("div");
    docu.setAttribute("id", "document" + i);
    docu.setAttribute("class", "doc");
    var scroll = document.createElement("div");
    scroll.setAttribute("id", "scroll" + i);
    scroll.setAttribute("class", "scroll-bar");
    docu.appendChild(files[i]);
    docu.appendChild(scroll);
    document.getElementById("docBar").appendChild(docu);
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

/////////////

//enhanced scrollbar

function getYcoords(elem) {
  let box = elem.getBoundingClientRect();
  return box.top;
}
  
  
//function: find all the matches of a given search term in the document and display them in the scrollzone
//input: a search term 
//output: all the matches of the seach term displayed in the scroll zone 
//you might need to think about if we have multiple search terms, how we display the matches 
function findAllMatches(searchTerm){
	console.log(searchTerm)
	//use the searchTerm to create a regular expression object: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
	if (searchTerm != " ") {
		const reg = new RegExp(searchTerm, "ig");
		console.log(reg)
		var rgb = "("+ getRandomInt(255) + ", " + getRandomInt(255) + ", " + getRandomInt(255) + ")";
		let scrollbarYCoord; 
		var scrollbarZone;
		//loop over every node in the DOM tree 
		for (i = 0 ; i < files.length ; i++) {
			scrollbarZone = document.getElementById("scroll" + i); 
			const file = document.getElementById("file" + i);
			file.querySelectorAll('*').forEach(function(node) {
				if (reg.test(node.innerText)){
					console.log("there is a match", i)
					//var search = new RegExp("(\\b" + text + "\\b)", "gim");
					
					//get the y coordinate of the node relative to the scrollzone 
					//I have a third function to covert coordinate even though I dont really use it...
					//according to stack overflow and documentations, the coordiante is quite tricky 
					
					// const fileHeight = file.attributes[2].value;
					// scrollbarYCoord = getYcoords(node)*260/fileHeight;
					// //once get the y coordinate, we create a div called mark with the corresponding y position 
					// let mark = document.createElement("div"); 
					// mark.className = "mark"; 
					// mark.style.position = "absolute"; 
					// mark.style.top = (scrollbarZone.offsetTop-10*(i+1)) + scrollbarYCoord + "px"; 
					// scrollbarZone.appendChild(mark);

					//highlight
					const repl = "<span style='background-color:rgb"+ rgb +";'>" + searchTerm + "</span>";

					var newe = node.innerHTML.replace(reg, repl);
					node.innerHTML = newe;
				}
			})

			


			// var content = $(file).text();
			// var matches = content.match(reg);       

			// if(matches) {
			// $(file).html(content.replace(reg, function(match){
			// 	return "<span class='highlight'>"+match+"</span>";
			// }));
			// }else {
			// 	$('.highlight').removeClass('highlight');
			// }
		
		}

		// document.body.querySelectorAll('*').forEach(function(node) {
		// 	//for each node when there is a match, 
		// 	if (reg.test(node.innerHTML)){
		// 		console.log("there is a match")
		// 		//get the y coordinate of the node relative to the scrollzone 
		// 		//I have a third function to covert coordinate even though I dont really use it...
		// 		//according to stack overflow and documentations, the coordiante is quite tricky 
		// 		scrollbarYCoord = Math.round(getYcoords(node) * 0.14); 
		// 		console.log(scrollbarYCoord);

		// 		//once get the y coordinate, we create a div called mark with the corresponding y position 
		// 		let mark = document.createElement("div"); 
		// 		mark.className = "mark"; 
		// 		mark.style.position = "absolute"; 
		// 		mark.style.top = scrollbarYCoord; 
		// 		scrollbarZone.appendChild(mark);
		// 		console.log(mark);
		// 	}
		// });
	}
}
  
function getRandomInt(max) {
	var r = Math.floor(Math.random() * max);
	if (r <150) r= 150;
	return r;
  }
  
