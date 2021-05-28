const app = Vue.createApp({
    data() {
        return {
            database : [],
            zero : 0
        }
    },

    methods: {
        async getData() {
            console.log("do");
            const res = await fetch('/api');
            this.database = await res.json();
        },
        get0() {
            return this.zero;
        }
    }
})