app.component('annotation-list', {
    /*html*/
    emits: ["update","del"],
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
                <a :href=" '#' + note.id" title="retrace quote" class="notes" @click="selectText(note)" style="text-decoration: none"> {{ note.passage }} </a>
                <button class="delete" @click="del(note.locId)"> DELETE </button>
                <button class="delete" @click="toggle"> {{display}} </button>
                <template v-if="toggled">
                    <div class="content">
                        <textarea :id= "note.id" class="edit" placeholder="Type here" @input="change($event.target.value,note.locId)"> {{ note.annotation }} </textarea>
                    </div>
                </template>
            </div>
        </template>

    `,
    // methods related to the passage object
    methods: {

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