let test = document.getElementById("test");
let div = document.getElementById("console");
div.style.position = "absolute";
div.hidden = true;
var clicked = false;
var unpinned = false;

$("#console").draggable({
    disable: true,
    snap: ".ui-widget-header",
    snapmode:"inner"
});

function drag() {
    $(function () {
        if (unpinned) {
            unpinned = false;
            $("#console").draggable("option", "disabled", true);
            div.style.cursor = 'default';
            div.style.borderWidth = 0 + 'px';
        } else {
            clicked = true;
            $("#console").draggable("option", "disabled", false);
            div.style.cursor = 'move';
            div.style.borderWidth = 5 +'px';
        }
    })
}

function unpin() {
    $(function () {
        clicked = false;
        unpinned = true;
    })
}

test.addEventListener("mouseenter", function (event) {
    if (!clicked) {
        div.style.top = event.clientY + 25 + 'px'; //or whatever 
        div.style.left = event.clientX -50 + 'px'; // or whatever
    }
    div.hidden = false;
    event.target.style.color = "orange";
}, false);

test.addEventListener("mouseleave", function (event) {
    event.target.style.color = "";
}, false);

div.addEventListener("mouseleave", function (event) {
    if (clicked) {
        div.hidden = false;
    } else {
        div.hidden = true;
    }
}, false);