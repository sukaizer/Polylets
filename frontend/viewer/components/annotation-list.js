app.component("annotation-list", {
  /*html*/
  emits: ["update", "del", "selection", "drag"],
  props: ["note", "current"],

  data() {
    return {
      toggled: true,
      display: "Hide note",
    };
  },

  // template of the html code for the display of the passage object
  template: `
        <template v-if="note.fileId === current">
            <div :id="'pass'+note.id"class="passage draggable note" draggable="true">
                <div class="draghandle" @click="dragObject(note.locId)"></div>
                <button class="delete" @click="del(note.locId)"> x </button>
                <a title="retrace quote" class="notes" @click="selectText" style="text-decoration: none"> {{ note.passage }} </a>
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
      this.$emit("selection", this.note);
    },

    getNode() {
      console.log("this is the node");
      console.log(this.note);
    },

    change(value, index) {
      noteObject = {
        note: value,
        i: index,
      };
      this.$emit("update", noteObject);
    },
    del(index) {
      this.$emit("del", index);
    },
    toggle() {
      this.toggled = !this.toggled;
      if (this.toggled) this.display = "Hide note";
      if (!this.toggled) this.display = "Show note";
    },
    dragObject(index) {
      this.$emit("drag", index);
    },
  },
});
