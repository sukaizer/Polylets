const app = Vue.createApp({
  data() {
    return {
      // this is an array of all note js objects
      notes: [],
      index: 0,
      currentFile: 0,
      savedProperty: "",
      lastDragged: 0,
    };
  },
  methods: {
    toJSON(node) {
      let propFix = { for: "htmlFor", class: "className" };
      let specialGetters = {
        style: (node) => node.style.cssText,
      };
      let attrDefaultValues = { style: "" };
      let obj = {
        nodeType: node.nodeType,
      };
      if (node.tagName) {
        obj.tagName = node.tagName.toLowerCase();
      } else if (node.nodeName) {
        obj.nodeName = node.nodeName;
      }
      if (node.nodeValue) {
        obj.nodeValue = node.nodeValue;
      }
      let attrs = node.attributes;
      if (attrs) {
        let defaultValues = new Map();
        for (let i = 0; i < attrs.length; i++) {
          let name = attrs[i].nodeName;
          defaultValues.set(name, attrDefaultValues[name]);
        }
        // Add some special cases that might not be included by enumerating
        // attributes above. Note: this list is probably not exhaustive.
        switch (obj.tagName) {
          case "input": {
            if (node.type === "checkbox" || node.type === "radio") {
              defaultValues.set("checked", false);
            } else if (node.type !== "file") {
              // Don't store the value for a file input.
              defaultValues.set("value", "");
            }
            break;
          }
          case "option": {
            defaultValues.set("selected", false);
            break;
          }
          case "textarea": {
            defaultValues.set("value", "");
            break;
          }
        }
        let arr = [];
        for (let [name, defaultValue] of defaultValues) {
          let propName = propFix[name] || name;
          let specialGetter = specialGetters[propName];
          let value = specialGetter ? specialGetter(node) : node[propName];
          if (value !== defaultValue) {
            arr.push([name, value]);
          }
        }
        if (arr.length) {
          obj.attributes = arr;
        }
      }
      let childNodes = node.childNodes;
      // Don't process children for a textarea since we used `value` above.
      if (obj.tagName !== "textarea" && childNodes && childNodes.length) {
        let arr = (obj.childNodes = []);
        for (let i = 0; i < childNodes.length; i++) {
          arr[i] = this.toJSON(childNodes[i]);
        }
      }
      return obj;
    },

    toDOM(input) {
      let obj = typeof input === "string" ? JSON.parse(input) : input;
      let propFix = { for: "htmlFor", class: "className" };
      let node;
      let nodeType = obj.nodeType;
      switch (nodeType) {
        // ELEMENT_NODE
        case 1: {
          node = document.createElement(obj.tagName);
          if (obj.attributes) {
            for (let [attrName, value] of obj.attributes) {
              let propName = propFix[attrName] || attrName;
              // Note: this will throw if setting the value of an input[type=file]
              node[propName] = value;
            }
          }
          break;
        }
        // TEXT_NODE
        case 3: {
          return document.createTextNode(obj.nodeValue);
        }
        // COMMENT_NODE
        case 8: {
          return document.createComment(obj.nodeValue);
        }
        // DOCUMENT_FRAGMENT_NODE
        case 11: {
          node = document.createDocumentFragment();
          break;
        }
        default: {
          // Default to an empty fragment node.
          return document.createDocumentFragment();
        }
      }
      if (obj.childNodes && obj.childNodes.length) {
        for (let childNode of obj.childNodes) {
          node.appendChild(this.toDOM(childNode));
        }
      }
      return node;
    },

    async addAnnotation() {
      const delay = (ms) => new Promise((res) => setTimeout(res, ms));
      const scroll = async () => {
        await delay(20);
        $("#container").scrollTop($("#container")[0].scrollHeight);
        $("#pass" + this.index).css({ transform: "scale(1.5)" });
        $("#pass" + this.index).css({ transition: "transform .8s" });
        await delay(200);
        $("#pass" + this.index).css({ transform: "scale(1)" });
        $("#pass" + this.index).css({ transition: "transform .8s" });
        this.index++;
      };
      const selection = window.getSelection();
      const string = selection.toString();

      var selecObj = this.getSelectionInfo();

      const note = {
        id: this.index,
        locId: this.index,
        passage: string,
        annotation: "",
        fileId: this.currentFile,
        startIndex: selecObj.startIndex,
        endIndex: selecObj.endIndex,
        startOffset: selecObj.startOffset,
        endOffset: selecObj.endOffset,
        yPosition: selecObj.yPosition,
      };

      console.log(note);

      if (string != "") {
        this.notes.push(note);
        scroll();
      }

      for (let i = 0; i < this.notes.length; i++) {
        this.notes[i].locId = i;
      }
    },

    refElement(elem) {
      let positions = [],
        position;
      let first = true;
      while (elem) {
        position = 0;
        if(first) {
          while (elem.previousSibling) {
            position++;
            elem = elem.previousSibling;
          }
          first = false;
        } else {
          while (elem.previousElementSibling) {
            position++;
            elem = elem.previousElementSibling;
          }
        }
        positions.unshift(position);
        elem = elem.parentElement;
      }

      console.log("reference:");
      console.log(positions);

      return positions.join();
    },

    //input a reference
    //ouput the node using that reference in the dom tree
    getElement(ref) {
      var positions = ref.split(/,/),
        elem = document;

      while (elem && positions.length) {
        if(positions.length == 1) {
          elem = elem.childNodes[positions.shift()];
        } else {
          elem = elem.children[positions.shift()];
        }
        console.log(positions[0]);
        console.log(elem);
      }
      console.log(positions);
      return elem;
    },

    getSelectionInfo() {
      const range = window.getSelection().getRangeAt(0);
      let startNode = range.startContainer;
      let endNode = range.endContainer;
      console.log("before func");
      console.log(endNode);

      console.log("start index: ");
      let startIndex = this.refElement(startNode);
      console.log("end index: ");
      let endIndex = this.refElement(endNode);

      let doc = document.getElementById("content");
      let selectionPosition = doc.scrollTop;

      console.log(range);
      return {
        startIndex: startIndex,
        endIndex: endIndex,
        startOffset: range.startOffset,
        endOffset: range.endOffset,
        yPosition: selectionPosition,
      };
    },

    reselect(selectionObject) {
      console.log(selectionObject.startOffset);
      console.log(selectionObject.endOffset);

      //scroll to the position
      // document.getElementById("content").scrollTo(0, selectionObject.yPosition);

      console.log(selectionObject);

      let startNode = this.getElement(selectionObject.startIndex);
      let endNode = this.getElement(selectionObject.endIndex);

      console.log("start");
      console.log(startNode);
      console.log("end");
      console.log(endNode);

      // startNode = startNode.previousSibling;
      // endNode = endNode.previousSibling;



      let start = true;
      let end = true;
      var reg = /\w/g;
      //const reg = new RegExp("(\s*\n{1}\s*)+", "ig");

      //startNode = startNode.firstChild;
      // console.log("startNode");
      // while (start) {
      //   console.log("looping");
      //   console.log(startNode);
      //   if (startNode.nodeType == Node.TEXT_NODE) {
      //     if (
      //       startNode.textContent.match(reg) == null
      //       // startNode.textContent == " " ||
      //       // startNode.textContent == " \n    "
      //     ) {
      //       console.log("data is empty");
      //       console.log(startNode.textContent);
      //       startNode = startNode.nextSibling;
      //     } else {
      //       start = false;
      //     }
      //   } else {
      //     startNode = startNode.nextSibling;
      //   }
      // }

      //endNode = endNode.firstChild;
      // console.log("endNode");
      // while (end) {
      //   console.log("looping");
      //   console.log(endNode);
      //   if (endNode.nodeType == Node.TEXT_NODE) {
      //     if (
      //       endNode.textContent.match(reg) == null
      //       // startNode.textContent == " " ||
      //       // startNode.textContent == " \n    "
      //     ) {
      //       console.log("data is empty");
      //       endNode = endNode.nextSibling;
      //     } else {
      //       end = false;
      //     }
      //   } else {
      //     endNode = endNode.nextSibling;
      //   }
      // }



      // if (startNode.firstChild.nodeType == Node.TEXT_NODE) {
      //     console.log("firstchild : ");
      //     console.log(startNode.firstChild.data);
      //     console.log("is text");
      // } else if (startNode.firstChild.nodeType == Node.ELEMENT_NODE) {
      //     console.log("firstchild : ");
      //     console.log(startNode.firstChild.data);
      //     console.log("is element");
      // }

      // //reselect the selection using startIndex and endIndex
      // let documentNode = document.getElementById("content");
      // console.log(documentNode);
      // let node = documentNode.firstElementChild;
      // let i = 0;
      // let startNode;
      // let endNode;

      // while (node) {
      //   if (i == selectionObject.startIndex){
      //      startNode = node;
      //   }if(i == selectionObject.endIndex){
      //      endNode = node;
      //   }
      //   i ++;
      //   node = node.nextElementSibling || node.nextSibling;
      // }
      console.log("start node");
      console.log(startNode);
      console.log("end node");
      console.log(endNode);
      console.log("sibling");

      const newRange = new Range();

        console.log(selectionObject.startOffset);
        console.log(selectionObject.endOffset);

        console.log(endNode.length);

      newRange.setStart(startNode, selectionObject.startOffset);
      newRange.setEnd(endNode, selectionObject.endOffset);

      // //re-create the selection using offset
      // const newRange = new Range();
      // console.log(startNode.firstChild.firstChild);

      // if (startNode.firstChild.nodeName == "STRONG"){
      //   console.log("start strong");
      //   newRange.setStart(startNode.firstChild.firstChild, selectionObject.startOffset);
      // }
      // else{
      //   newRange.setStart(startNode.firstChild, selectionObject.startOffset);
      // }

      // if (endNode.firstChild.nodeName == "STRONG"){
      //   console.log("end strong");
      //   newRange.setEnd(endNode.firstChild.firstChild, selectionObject.endOffset);
      // }else{
      //   newRange.setEnd(endNode.firstChild, selectionObject.endOffset);
      // }

      console.log(newRange);
      let selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(newRange);
    },

    // //get all the related information when the user makes the selection
    // getSelectionInfo() {
    //   const range = window.getSelection().getRangeAt(0);
    //   console.log(range);
    //   let startNode;
    //   let endNode;

    //   if (range.startContainer.nodeName == "P") {
    //     startNode = range.startContainer;
    //   } else {
    //     startNode = range.startContainer.parentNode;
    //   }

    //   if (range.endContainer.nodeName == "P") {
    //     endNode = range.endContainer;
    //   } else {
    //     endNode = range.endContainer.parentNode;
    //   }

    //   if (startNode.nodeName == "STRONG") {
    //     console.log("start strong");
    //     startNode = startNode.parentNode;
    //   }
    //   if (endNode.nodeName == "STRONG") {
    //     console.log("end strong");
    //     endNode = endNode.parentNode;
    //   }

    //   //find the startIndex and endIndex
    //   const parentNode = document.getElementById("content");
    //   let startIndex = 0;
    //   let endIndex = 0;
    //   let i = 0;
    //   console.log(startNode);
    //   console.log(endNode);

    //   for (let i = 0; i < parentNode.childElementCount; i++) {
    //     // Do stuff
    //     // console.log(parentNode.children[i]);

    //     if (parentNode.children[i] == startNode) {
    //       startIndex = i;
    //     }
    //     if (parentNode.children[i] == endNode) {
    //       endIndex = i;
    //     }
    //   }

    //   console.log(startIndex);
    //   console.log(endIndex);

    //   let doc = document.getElementById("content");
    //   let selectionPosition = doc.scrollTop;

    //   let selec = {
    //     startIndex: startIndex,
    //     endIndex: endIndex,
    //     startOffset: range.startOffset,
    //     endOffset: range.endOffset,
    //     yPosition: selectionPosition,
    //   };
    //   console.log(" selection : ");
    //   console.log(selec);

    //   return selec;
    // },

    // //reselect the passage
    // reselect(note) {
    //   console.log(note);
    //   //scroll to the position
    //   document.getElementById("content").scrollTo(0, note.yPosition);

    //   //reselect the selection using startIndex and endIndex
    //   let documentNode = document.getElementById("content");
    //   console.log(documentNode);
    //   let node = documentNode.firstElementChild;
    //   let i = 0;
    //   let startNode;
    //   let endNode;

    //   while (node) {
    //     if (i == note.startIndex) {
    //       startNode = node;
    //     }
    //     if (i == note.endIndex) {
    //       endNode = node;
    //     }
    //     i++;
    //     node = node.nextElementSibling || node.nextSibling;
    //   }
    //   console.log(startNode);
    //   console.log(endNode);

    //   //re-create the selection using offset
    //   const newRange = new Range();
    //   console.log(startNode.firstChild.firstChild);

    //   if (startNode.firstChild.nodeName == "STRONG") {
    //     console.log("start strong");
    //     newRange.setStart(startNode.firstChild.firstChild, note.startOffset);
    //   } else {
    //     newRange.setStart(startNode.firstChild, note.startOffset);
    //   }

    //   if (endNode.firstChild.nodeName == "STRONG") {
    //     console.log("end strong");
    //     newRange.setEnd(endNode.firstChild.firstChild, note.endOffset);
    //   } else {
    //     newRange.setEnd(endNode.firstChild, note.endOffset);
    //   }

    //   console.log(newRange);
    //   let selection = window.getSelection();
    //   selection.removeAllRanges();
    //   selection.addRange(newRange);
    // },

    // send the entire passage object to the server
    async sendToServer() {
      const delay = (ms) => new Promise((res) => setTimeout(res, ms));

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.notes),
      };

      fetch("/api", options);
      this.savedProperty = "Saved !";
      await delay(1000);
      this.savedProperty = "";
    },

    //edits the annotation in the array
    editNote(noteObject) {
      const annotation = noteObject.note;
      const index = noteObject.i;
      this.notes[index].annotation = annotation;
    },

    //sets the current file's id
    setFile(id) {
      this.currentFile = id;
    },

    //delete the passage object at index
    deletePassage(index) {
      console.log(index);
      this.notes.splice(index, 1);
      for (let i = 0; i < this.notes.length; i++) {
        this.notes[i].locId = i;
      }
    },

    //sets the dragged passage data
    dragPassage(index) {
      this.lastDragged = index;
      console.log(this.lastDragged);
    },

    //gets the dragged passage data
    getDraggedNote() {
      return this.notes[this.lastDragged];
    },

    computed: {
      inPageAnchor() {
        return "#" + this.index;
      },
    },
  },
});
