// opens the libraries tied to the server side
const express = require('express');
const open = require('open');
const Datastore = require('nedb');

const app = express();

// get the static content of public folder
app.use(express.static('../frontend/viewer'));
app.use(express.json());

// sends a message to the client
app.get('/', (req, res) => {
    res.send('Hello World!');
});

open('http://localhost:3000/');

app.listen(3000, () => console.log('listening at 3000'));

// creation of database
const database = new Datastore('database.db');
database.loadDatabase();

// listening and insertion of the data in the previously created database
app.post('/api', (rq, rs) => {
    console.log('I got a request');
    const data = rq.body;
    database.insert(data);
    rs.json(data);
});