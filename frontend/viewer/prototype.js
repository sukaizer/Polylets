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
                parentNode: selectionNode,
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
        },

        reselect(note) {
            console.log("note");
            console.log(note);
            document.getElementById("content").scrollTo(0, note.yPosition);

            const range = new Range();

            range.setStart(note.startNode.firstChild, note.startOffset);
            range.setEnd(note.endNode.firstChild, note.endOffset);


            console.log("new range");
            console.log(range);
            const select = window.getSelection();
            console.log("first select");
            console.log(select);
            select.removeAllRanges();
            select.addRange(range);
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