app.component('annotation-list', {
    /*html*/
    emits: ["update", "del","selection"],
    props: ['note', 'current'],

    data() {
        return {
            toggled: true,
            display : "HIDE ANNOTATION"
        }
    },

    // template of the html code for the display of the passage object
    template: `
        <template v-if="note.fileId === current">
            <div class="passage">
                <a title="retrace quote" class="notes" @click="selectText" style="text-decoration: none"> {{ note.passage }} </a>
                <button class="delete" @click="del(note.locId)"> DELETE </button>
                <button class="delete" @click="toggle"> {{display}} </button>
                <template v-if="toggled">
                    <div class="annotationArea">
                        <textarea :id="note.id" class="edit" placeholder="Type here" @input="change($event.target.value,note.locId)"> {{ note.annotation }} </textarea>
                    </div>
                </template>
            </div>
        </template>
    `,
    // methods related to the passage object
    methods: {
        // selects the text from the document when the user clicked on the related passage object
        // selectText(node) {
        //     node = document.getElementById(node);
        //     if (document.body.createTextRange) {
        //         const range = document.body.createTextRange();
        //         range.moveToElementText(node);
        //         range.select();
        //     } else if (window.getSelection) {
        //         const selection = window.getSelection();
        //         const range = document.createRange();
        //         range.selectNodeContents(node);
        //         selection.removeAllRanges();
        //         selection.addRange(range);
        //     } else {
        //         console.warn("Could not select text in node: Unsupported browser.");
        //     }
        // },



        

        // selectText(note) {
        //     document.getElementById("document").scrollTo(0, note.yPosition);

        //     const newRange = new Range();
        //     newRange.setStart(note.startNode.firstChild, note.startOffset);
        //     newRange.setEnd(note.endNode.firstChild, note.endOffset);
        //     let selection = window.getSelection();
        //     selection.removeAllRanges();
        //     selection.addRange(newRange);
        // },

        selectText() {
            console.log("thisnute")
            console.log(this.note);
            this.$emit('selection', this.note);
            
        },

        getNode() {
            console.log("this is the node");
            console.log(this.note)
        },

        change(value, index) {
            noteObject = {
                note: value,
                i: index
            }
            this.$emit('update', noteObject);
        },
        del(index) {
            this.$emit('del', index);
        },
        toggle() {
            this.toggled = !this.toggled;
            if (this.toggled) this.display = "HIDE ANNOTATION";
            if (!this.toggled) this.display = "DISPLAY ANNOTATION";
        }
    }

})