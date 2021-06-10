const app = Vue.createApp({
    data() {
        return {
            // this is an array of all note js objects 
            notes: [],
            index: 0,
            isDisabled: true,
            currentFile: 0,
            savedProperty: "",
        }
    },
    methods: {

        toJSON(node) {
        let propFix = { for: 'htmlFor', class: 'className' };
        let specialGetters = {
            style: (node) => node.style.cssText,
        };
        let attrDefaultValues = { style: '' };
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
            case 'input': {
                if (node.type === 'checkbox' || node.type === 'radio') {
                defaultValues.set('checked', false);
                } else if (node.type !== 'file') {
                // Don't store the value for a file input.
                defaultValues.set('value', '');
                }
                break;
            }
            case 'option': {
                defaultValues.set('selected', false);
                break;
            }
            case 'textarea': {
                defaultValues.set('value', '');
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
        if (obj.tagName !== 'textarea' && childNodes && childNodes.length) {
            let arr = (obj.childNodes = []);
            for (let i = 0; i < childNodes.length; i++) {
            arr[i] = this.toJSON(childNodes[i]);
            }
        }
        return obj;
        },

        toDOM(input) {
            let obj = typeof input === 'string' ? JSON.parse(input) : input;
            let propFix = { for: 'htmlFor', class: 'className' };
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

        addAnnotation() {

            const selection = window.getSelection();
            const string = selection.toString();            
            const range = window.getSelection().getRangeAt(0);
            const startNode = window.getSelection().getRangeAt(0).startContainer.parentNode; 
            const endNode = window.getSelection().getRangeAt(0).endContainer.parentNode; 

            //find the startIndex and endIndex
            const parentNode = startNode.parentNode; 
            let node = parentNode.firstElementChild; 
            let startIndex = 0; 
            let endIndex = 0; 

            let i = 0; 
            while ( node !== endNode && node.nodeType === Node.ELEMENT_NODE ){
                if (node == startNode){
                    startIndex = i; 
                    }
                    i++; 
                    node = node.nextElementSibling || node.nextSibling;
                    }
                endIndex = i; 
                console.log(startIndex); 
                console.log(endIndex);


            let doc = document.getElementById("content"); 
            let selectionPosition = doc.scrollTop; 

            const note = {
                id: this.index,
                locId: this.index,
                passage: string,
                annotation: "",
                fileId: this.currentFile,
                startIndex: startIndex, 
                endIndex: endIndex, 
                startOffset: range.startOffset, 
                endOffset: range.endOffset, 
                yPosition: selectionPosition,

            };

            if (string != "") {
                this.notes.push(note);
                this.index++;
            }

            for (let i = 0; i < this.notes.length; i++) {
                this.notes[i].locId = i;   
            }
        },


        reselect(note) {
                document.getElementById("content").scrollTo(0, note.yPosition); 

                //reselect the selection using startIndex and endIndex 
                let documentNode = document.getElementById("content"); 
                //console.log(documentNode);
                let node = documentNode.firstElementChild; 
                let i = 0; 
                let startNode;
                let endNode; 

                while (node) {
                  console.log(node);
                  if (i == note.startIndex){
                     startNode = node; 
                  }if(i == note.endIndex){
                     endNode = node; 
                  }
                  i ++; 
                  node = node.nextElementSibling || node.nextSibling;
                }
                console.log(startNode); 
                console.log(endNode); 

                //re-create the selection using starting index and end index 
                const newRange = new Range(); 
                newRange.setStart(startNode.firstChild, note.startOffset); 
                newRange.setEnd(endNode.firstChild, note.endOffset); 

                
                console.log(newRange); 
                let selection = window.getSelection();
                selection.removeAllRanges(); 
                selection.addRange(newRange);          
        },

        // send the entire passage object to the server
        async sendToServer() {
            const delay = ms => new Promise(res => setTimeout(res, ms));

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.notes)
            };

            fetch('/api', options);
            this.savedProperty = "Saved !";
            await delay(1000);
            this.savedProperty = "";
        },

        // disable or activate the save button 
        setDisable() {
            const selection = window.getSelection();
            const string = selection.toString();
            this.isDisabled = string == "";
        },

        editNote(noteObject) {
            const annotation = noteObject.note;
            const index = noteObject.i;
            this.notes[index].annotation = annotation;
        },

        setFile(id) {
            this.currentFile = id;
        },

        deletePassage(index) {
            console.log(index);
            this.notes.splice(index, 1);
            for (let i = 0; i < this.notes.length; i++) {
                this.notes[i].locId = i;
            }
        },

        computed: {
            inPageAnchor() {
                return '#' + this.index;
            },
        }

    }
})