var files = []
getData();

$(".execSearch").on("click", () => {
    var search = $("input")[0].value;
    findAllMatches(search);
	var search2 = $("input")[1].value;
    findAllMatches(search2)
    //sendToServer(search);
})

$("input").on('change', () => {
	

})


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
	fetch('', options);
	await delay(1000);
}


async function getData() {
	//html files
	const rf = await fetch('/files');
	const filesData = await rf.json();

	for (let index = 0; index < 4; index++) {
		var element = document.createElement("div");
		element.setAttribute("id", "file" + index);
		element.setAttribute("class", "file");
		this.buildDOM(element, filesData[index]);
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
		files[i].setAttribute("data-height", files[i].lastElementChild.lastElementChild.offsetHeight);
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
    } else {
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
		var reg = new RegExp(searchTerm, "ig"); 
		var rgb = "("+ getRandomInt(255) + ", " + getRandomInt(255) + ", " + getRandomInt(255) + ")";
		let scrollbarYCoord; 
		var scrollbarZone;
		//loop over every node in the DOM tree 
		for (i = 0 ; i < files.length ; i++) {
			scrollbarZone = document.getElementById("scroll" + i); 
			const file = document.getElementById("file" + i);
			file.lastElementChild.lastElementChild.querySelectorAll('*').forEach(function(node) {
				if (reg.test(node.innerText) && (node.tagName == "P")){
					console.log("there is a match", i)
					//var search = new RegExp("(\\b" + text + "\\b)", "gim");
					
					//get the y coordinate of the node relative to the scrollzone 
					//I have a third function to covert coordinate even though I dont really use it...
					//according to stack overflow and documentations, the coordiante is quite tricky 
					
					const fileHeight = file.attributes[2].value;
					scrollbarYCoord = getYcoords(node)*260/fileHeight;
					//once get the y coordinate, we create a div called mark with the corresponding y position 
					let mark = document.createElement("div"); 
					mark.className = "mark"; 
					mark.style.position = "absolute"; 
					mark.style.top = (scrollbarZone.offsetTop-10*(i+1)) + scrollbarYCoord + "px"; 
					scrollbarZone.appendChild(mark);

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
  