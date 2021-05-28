app.component('annotation-display', {
    /*html*/
    emits: ["update"],
    props: ['note','current'],
    
    // template of the html code for the display of the passage object
    template: `
        <template v-if="note.fileId === current">
            <a :href=" '#' + note.id" title="retrace quote" class="notes" @click="selectText(note.id)" style="text-decoration: none"> {{ note.passage }} </a>
            <textarea :id= "note.id" class="edit" placeholder="Type here" @input="change($event.target.value,note.id)"> {{ note.annotation }} </textarea>
        </template>

    `,
    // methods related to the passage object
    methods: {
        // selects the text from the document when the user clicked on the related passage object
        selectText(node) {
            node = document.getElementById(node);
            if (document.body.createTextRange) {
                const range = document.body.createTextRange();
                range.moveToElementText(node);
                range.select();
            } else if (window.getSelection) {
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(node);
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                console.warn("Could not select text in node: Unsupported browser.");
            }
        },
        change(value,index) {
            noteObject = {
                note: value,
                i : index
            }
            this.$emit('update', noteObject);
        }
    }

})