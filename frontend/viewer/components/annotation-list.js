app.component('annotation-list', {
    /*html*/
<<<<<<< HEAD
    emits: ["update", "del"],
=======
    emits: ["update","del"],
>>>>>>> 351ab66fcbe6cf17a0b259130b4fd644857f4a0f
    props: ['note', 'current'],

    data() {
        return {
<<<<<<< HEAD
            toggled: true
        }
    },

=======
            toggled: true,
            display : "HIDE ANNOTATION"
        }
    },
    
>>>>>>> 351ab66fcbe6cf17a0b259130b4fd644857f4a0f
    // template of the html code for the display of the passage object
    template: `
        <template v-if="note.fileId === current">
            <div class="passage">
<<<<<<< HEAD
                <a :href=" '#' + note.id" title="retrace quote" class="notes" @click="selectText(note)" style="text-decoration: none"> {{ note.passage }} </a>
                <button class="delete" @click="del(note.locId)"> DELETE </button>
                <button class="collapsible" @click="toggle"> Note </button>
                <template v-if="toggled">
                    <div class="content">
                        <textarea :id= "note.id" class="edit" placeholder="Type here" @input="change($event.target.value,note.id)"> {{ note.annotation }} </textarea>
                    </div>
=======
                <a :href=" '#' + note.id" title="retrace quote" class="notes" @click="selectText(note.id)" style="text-decoration: none"> {{ note.passage }} </a>
                <button class="delete" @click="del(note.locId)"> DELETE </button>
                <button class="delete" @click="toggle"> {{display}} </button>
                <template v-if="toggled">
                    <textarea :id= "note.id" class="edit" placeholder="Type here" @input="change($event.target.value,note.locId)"> {{ note.annotation }} </textarea>
>>>>>>> 351ab66fcbe6cf17a0b259130b4fd644857f4a0f
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



        selectText(note) {
            console.log("note");
            console.log(note);
            document.getElementById("content").scrollTo(0, note.yPosition);

            const range = new Range();
            console.log("note.parentnode");
            console.log(note.parentNode);

            console.log("selectRange");
            console.log(note.selectRange);

            range.setStart(note.startNode.firstChild, note.startOffset);
            range.setEnd(note.endNode.firstChild, note.endOffset);

            console.log("range");
            console.log(range);

            let select = window.getSelection();
            select.removeAllRanges();
            select.addRange(range);
            console.log("select");
            console.log(select);
        },

        // selectText(note) {
        //     document.getElementById("document").scrollTo(0, note.yPosition);

        //     const newRange = new Range();
        //     newRange.setStart(note.startNode.firstChild, note.startOffset);
        //     newRange.setEnd(note.endNode.firstChild, note.endOffset);
        //     let selection = window.getSelection();
        //     selection.removeAllRanges();
        //     selection.addRange(newRange);
        // },


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
<<<<<<< HEAD
            console.log(this.toggled);
=======
            if (this.toggled) this.display = "HIDE ANNOTATION";
            if (!this.toggled) this.display = "DISPLAY ANNOTATION";
>>>>>>> 351ab66fcbe6cf17a0b259130b4fd644857f4a0f
        }
    }

})