const app = Vue.createApp({
    data() {
        return {
            // this is an array of all note js objects 
            notes: [],
            index: 0,
            isDisabled: true,
            currentFile: 0,
            savedProperty : ""
        }
    },
    methods: {
        // add a passage object
        addAnnotation() {
            const selection = window.getSelection();
            const string = selection.toString();
            const range = selection.getRangeAt(0);
            const frag = range.extractContents();
            const newnode = document.createElement("span");
            newnode.setAttribute("id", this.index);
            newnode.appendChild(frag);
            range.insertNode(newnode);

            // create a new js object with current selection 
            const note = {
                id: this.index,
                passage: string,
                annotation: "",
                fileId : this.currentFile,
                file: undefined
            };

            console.log(note);

            this.notes.push(note);
            this.index++;
        },

        // send the entire passage object to the server
        async sendToServer() {
            var file = document.getElementById("content").innerHTML;
            this.notes.forEach(element => {
                element.file = file;
            });
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
        
        computed: {
            inPageAnchor() {
                return '#' + this.index;
            },
        }

    }
})