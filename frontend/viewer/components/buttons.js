app.component('files-switcher', {

    emits : ["current-file"],


    /*html*/
    template: `        
        <button class="button-bar" id="b1" @click="onAction(1)" @click="emitter(1)"> file1 </button>
        <button class="button-bar" id="b2" @click="onAction(2)" @click="emitter(2)"> file2 </button>
        <button class="button-bar" id="b3" @click="onAction(3)" @click="emitter(3)"> file3 </button>
        <button class="button-bar" id="b4" @click="onAction(4)" @click="emitter(4)"> file4 </button>
    `,
    methods: {
        onAction(index) {
            switch (index) {
                case 1: $("#content").load("files/test.html");
                    break;
                case 2: $("#content").load("files/test2.html");
                    break;
                case 3: $("#content").load("files/test3.html");
                    break;
                case 4: $("#content").load("files/test4.html");
                    break;
            }
        },

        emitter(index) {
            this.$emit('current-file', index);
        }
    }

})