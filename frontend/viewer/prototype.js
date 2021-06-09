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
            const selectionNode = window.getSelection().getRangeAt(0).startContainer.parentNode;
            const doc = document.getElementById("content");
            const selectionPosition = doc.scrollTop;

            const startNode = window.getSelection().getRangeAt(0).startContainer.parentNode;
            const endNode = window.getSelection().getRangeAt(0).endContainer.parentNode;

            const note = {
                id: this.index,
                locId: this.index,
                rangeStart: selection.anchorOffset,
                rangeLength: string.length,
                startParentNode: selectionNode.childNodes[0],
                parentNode: this.toJSON(selectionNode),
                yPosition: selectionPosition,
                passage: string,
                annotation: "",
                fileId: this.currentFile,
                startOffset: range.startOffset,
                endOffset: range.endOffset,
                startNode: startNode,
                endNode: endNode
            };

            if (string != "") {
                this.notes.push(note);
                this.index++;
            }

            for (let i = 0; i < this.notes.length; i++) {
                this.notes[i].locId = i;   
            }
            console.log(this.toDOM(this.toJSON(note.startNode)));
        },


        reselect(note) {
            console.log("note");
            console.log(note);
            document.getElementById("content").scrollTo(0, note.yPosition);

            const range = new Range();

            range.setStart(this.toDOM(this.toJSON(note.startNode)).firstChild, note.startOffset);
            range.setEnd(this.toDOM(this.toJSON(note.endNode)).firstChild, note.endOffset);

            const range2 = new Range();

            range2.setStart(note.startNode.firstChild, note.startOffset);
            range2.setEnd(note.endNode.firstChild, note.endOffset);

            console.log("new range");
            console.log(range);
            console.log("range 2");
            console.log(range2);

            const select = window.getSelection();
            console.log("first select");
            console.log(select);
            select.removeAllRanges();
            select.addRange(range2);
            console.log("select");
            console.log(select);
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