app.component('annotation-list', {
    /*html*/
    emits: ["update","del"],
    props: ['note','current'],
    
    // template of the html code for the display of the passage object
    template: `
        <template v-if="note.fileId === current">
            <div class="passage">
                <a :href=" '#' + note.id" title="retrace quote" class="notes" @click="selectText(note.id)" style="text-decoration: none"> {{ note.passage }} </a>
                <button class="delete" @click="del(note.id)"> DELETE </button>
                <button class="collapsible"> Note </button>
                <div class="content">
                    <textarea :id= "note.id" class="edit" placeholder="Type here" @input="change($event.target.value,note.id)"> {{ note.annotation }} </textarea>
                </div>
            </div>

            <script>
                var coll = document.getElementsByClassName("collapsible");
                var i;

                for (i = 0; i < coll.length; i++) {
                    coll[i].addEventListener("click", function() {
                        this.classList.toggle("active");
                        var content = this.nextElementSibling;
                        if (content.style.display === "block") {
                        content.style.display = "none";
                        } else {
                        content.style.display = "block";
                        }
                    });
                }
            </script>
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
        },
        del(index) {
            this.$emit('del', index);
        }
    }

})