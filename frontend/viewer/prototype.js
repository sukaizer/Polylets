const app = Vue.createApp({
    data() {
        return {
            // this is an array of all note js objects 
            notes: [],
            index: 0,
            isDisabled: true,
            currentFile: 0,
            savedProperty: ""
        }
    },
    methods: {
        // add a passage object
        // addAnnotation() {
        //     const selection = window.getSelection();
        //     const string = selection.toString();
        //     const range = selection.getRangeAt(0);
        //     const frag = range.extractContents();
        //     // const newnode = document.createElement("span");
        //     // newnode.setAttribute("id", this.index);
        //     // newnode.appendChild(frag);
        //     range.insertNode(newnode);

        //     // create a new js object with current selection 
        //     const note = {
        //         id: this.index,
        //         locId: this.index,
        //         selectRange: range,
        //         rangeLength: range.length,
        //         passage: string,
        //         annotation: "",
        //         fileId: this.currentFile,
        //         file: undefined
        //     };

        //     if (string != "") {
        //         this.notes.push(note);
        //         this.index++;
        //     }
        // },

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
<<<<<<< HEAD
                locId: this.index,
                rangeStart: selection.anchorOffset,
                rangeLength: string.length,
                startParentNode: selectionNode.childNodes[0],
                parentNode: selectionNode,
                yPosition: selectionPosition,
=======
                locId: 0,
>>>>>>> 351ab66fcbe6cf17a0b259130b4fd644857f4a0f
                passage: string,
                annotation: "",
                fileId: this.currentFile,
                file: undefined,

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
        },

        // addAnnotation() {
        //     const selection = window.getSelection();
        //     const string = selection.toString();
        //     const selectionNode = window.getSelection().getRangeAt(0).startContainer.parentNode;
        //     const doc = document.getElementById("content");
        //     const selectionPosition = doc.scrollTop;
        //     const range = window.getSelection().getRangeAt(0);
        //     const startNode = window.getSelection().getRangeAt(0).startContainer.parentNode;
        //     const endNode = window.getSelection().getRangeAt(0).endContainer.parentNode;


        //     const note = {
        //         id: this.index,
        //         locId: this.index,
        //         startNode: startNode,
        //         endNode: endNode,
        //         startOffset: range.startOffset,
        //         endOffset: range.endOffset,
        //         passage: string,
        //         annotation: "",
        //         fileId: this.currentFile,
        //         file: undefined
        //     }
        // },

        // send the entire passage object to the server
        async sendToServer() {
            /*var file = document.getElementById("content").innerHTML;
            this.notes.forEach(element => {
                element.file = file;
            });*/
            const delay = ms => new Promise(res => setTimeout(res, ms));

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.notes)
            };

            const o = {
                method: 'DELETE'
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
<<<<<<< HEAD
                this.notes[i].locId = i;
=======
                this.notes[i].locId = i;   
>>>>>>> 351ab66fcbe6cf17a0b259130b4fd644857f4a0f
            }
        },

        computed: {
            inPageAnchor() {
                return '#' + this.index;
            },
        }

    }
})