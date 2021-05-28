app.component('ed-annotation-display', {
    props: ['item', 'passage'],
    template: 
    `
    <div class="notes>{{passage}}</div>
    <button>insert</button>
    `,
})