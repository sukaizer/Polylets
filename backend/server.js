// opens the libraries tied to the server side
const express = require('express');
const open = require('open');
const Datastore = require('nedb');

const app = express();

// setup of different routes
app.use('/viewer', express.static('../frontend/viewer'));
app.use('/editor',express.static('../frontend/editor'));

app.use(express.json());

// sends a message to the client
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// automatically opens the link
open('http://localhost:3000/viewer');

// listening
app.listen(3000, () => console.log('listening at 3000'));

// creation of database
const databasePassages = new Datastore('databasePassages.db');
databasePassages.loadDatabase();

const databaseHtmlFiles = new Datastore('databaseHtmlFiles.db');
databaseHtmlFiles.loadDatabase();

// get the data
app.get('/files', (rq, rs) => {
    databaseHtmlFiles.find({}, (err, data) => {
        if (err) {
            rs.end();
            return;
        }
        rs.json(data);
    });
});

app.get('/notes', (rq, rs) => {
        databasePassages.find({}, (err, data) => {
        if (err) {
            rs.end();
            return;
        }
        rs.json(data);
    });
});

// listening and insertion of the data in the previously created database
app.post('/api', (rq, rs) => {
    databasePassages.remove({}, { multi: true }, function (err, numRemoved) {
        databasePassages.loadDatabase(function (err) {
        });
    });
    const data = rq.body;
    databasePassages.insert(data);
    rs.json(data);
});

app.post('/files', (rq, rs) => {
    const data = rq.body;
    databaseHtmlFiles.insert(data);
    rs.json(data);
});

app.delete('/api', (rq, rs) => {

})

