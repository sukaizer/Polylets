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
        
        selectText() {
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