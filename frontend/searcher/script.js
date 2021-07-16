var files = [];
const colours = [
  "lightblue",
  "thistle",
  "lightyellow",
  "magenta",
  "salmon",
  "cyan",
  "orange",
  "violet",
];
var c = 0;
//getData();
var i = 0;

var isOverPasButt = false;

var pageX;
var pageY;

var upX;
var upY;

var selection = "";
$("#createPassage").fadeOut(0);
$(".indicationMark").fadeOut(0);

$(document).ready(function () {
  $(document).trigger("click");
  $(document).on("mousemove", function (e) {
    pageX = e.pageX;
    pageY = e.pageY;
  });
  $(document).bind("selectionchange", function () {
    selection = window.getSelection().toString();
    console.log("selection", selection);
  });
  $(document).on("mouseup", function (e) {
    if (isOverPasButt == false) {
      upX = e.pageX;
      upY = e.pageY;
    }
    if (selection != "") {
      console.log(upX, upY);
      $("#createPassage")
        .css({
          left: upX + 5,
          top: upY + 10,
        })
        .fadeIn(200);
    } else {
      $("#createPassage").fadeOut(200);
    }
  });
});

//new research
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
  passageContainer.setAttribute("class", "passage-container");

  keyObject.ondragover = (ev) => {
    ev.preventDefault();
  };

  keyObject.ondrop = (ev) => {
    const note = document.getElementById(ev.dataTransfer.getData("text"));
    passageContainer.appendChild(note);
  };

  textArea.placeholder = "enter search terms";
  textArea.setAttribute("class", "search-area");

  keyObject.setAttribute("class", "key-object");
  keyObject.setAttribute("data-color", c);

  handle.setAttribute("class", "handle");
  handle.style.backgroundColor = colours[c];

  name.setAttribute("class", "input");
  name.placeholder = "type name";
  button.setAttribute("class", "closebutton");
  button.style.backgroundColor = colours[c];
  separator.setAttribute("class", "rounded");
  keyObject.appendChild(handle);
  keyObject.appendChild(textArea);
  keyObject.appendChild(separator);
  keyObject.appendChild(passageContainer);
  if (string != "") textArea.value = string;
  button.onclick = () => {
    keyObject.remove();
    colours.splice(keyObject.attributes[1], 1);
  };
  $(".searchBar").append(keyObject);
  c += 1;
});

//passage
var positionButton = $("#createPassage");
positionButton.on("click", () => {
  $(".passagesBar").append(createPassage());
});
positionButton.hover(
  function () {
    isOverPasButt = true;
  },
  function () {
    isOverPasButt = false;
  }
);

// create a passage object which will be added to the sidebar and sets the listeners
function createPassage() {
  const selection = window.getSelection();
  const string = selection.toString();
  const passage = document.createElement("div");
  passage.setAttribute("id", i);
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
  $(".doc").remove();
  var matches = [];
  var submatches = [];

  const tArea = document.getElementsByClassName("search-area");
  var i = 0;
  for (text of tArea) {
    submatches = [];
    var search = text.value;
    search = search.split(/[\s,]+/);
    console.log("search", search);
    // var search2 = $("input")[1].value;
    // findAllMatches(search2)
    for (item of search) {
      if (item != "") {
        const keyword = {
          sQuery: item,
        };
        console.log(item);
        submatches.push(item);
        sendToServer(keyword);
      }
    }
    if (submatches.length != 0) {
      matches.push(submatches);
    }
  }

  if (matches.length != 0) {
    setTimeout(function () {
      searchResponse();
    }, 200);
  }

  setTimeout(function () {
    for (i = 0; i < matches.length; i++) {
      for (j = 0; j < matches[i].length; j++) {
        findAllMatches(matches[i][j], i);
      }
    }
  }, 400);

  setTimeout(function () {
    $(".mark").hover(
      function () {
        $(".indicationMark")
          .css({
            left: pageX + 5,
            top: pageY - 20,
            "background-color": colours[$(this).data("color")],
          })
          .fadeIn(150);
        $(".indicationMark").text(tArea[$(this).data("color")].value);
      },
      function () {
        $(".indicationMark").fadeOut(150);
      }
    );
  }, 600);
});

//send data to server
async function sendToServer(data) {
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  fetch("/srch", options);
}

//getting responses from database
async function searchResponse() {
  const rs = await fetch("/srch");
  const sData = await rs.json();
  for (let index = 0; index < sData.length; index++) {
    var element = document.createElement("div");
    element.setAttribute("id", "file" + index);
    element.setAttribute("class", "file");
    const file = sData[index].nfile;
    element.innerHTML = file;
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
    const height = docu.firstElementChild.scrollHeight;
    console.log("h", height);
    files[i].setAttribute("data-height", height);
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
function findAllMatches(searchTerm, left) {
  //use the searchTerm to create a regular expression object: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
  if (searchTerm != " ") {
    const reg = new RegExp(searchTerm, "ig");
    console.log(reg);

    let scrollbarYCoord;
    var scrollbarZone;
    //loop over every node in the DOM tree
    for (i = 0; i < files.length; i++) {
      scrollbarZone = document.getElementById("scroll" + i);

      scrollbarZone.style.width = 15 * (left + 1) + "px";
      const file = document.getElementById("file" + i);
      file.querySelectorAll("*").forEach(function (node) {
        if (reg.test(node.innerText) && node.name != "strong") {
          console.log("there is a match", i);
          //var search = new RegExp("(\\b" + text + "\\b)", "gim");

          //get the y coordinate of the node relative to the scrollzone
          //I have a third function to covert coordinate even though I dont really use it...
          //according to stack overflow and documentations, the coordiante is quite tricky

          const fileHeight = file.attributes[2].value;
          scrollbarYCoord = (getYcoords(node) * 262) / fileHeight;
          //once get the y coordinate, we create a div called mark with the corresponding y position
          let mark = document.createElement("div");
          mark.className = "mark";
          mark.setAttribute("data-color", left);
          mark.style.position = "absolute";
          mark.style.top =
            scrollbarZone.offsetTop - 10 * (i + 1) + scrollbarYCoord + "px";
          mark.style.left = scrollbarZone.offsetLeft + 12 * left + "px";
          mark.style.backgroundColor = colours[left];
          scrollbarZone.appendChild(mark);

          //highlight
          const repl =
            "<span style='background-color:" +
            colours[left] +
            ";'>" +
            searchTerm +
            "</span>";

          var newe = node.innerHTML.replace(reg, repl);
          node.innerHTML = newe;
        }
      });
    }
  }
}

function getRandomInt(max) {
  var r = Math.floor(Math.random() * max);
  if (r < 150) {
    r = 150;
  }
  return r;
}
