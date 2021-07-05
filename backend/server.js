// opens the libraries tied to the server side
const express = require("express");
const open = require("open");
const Datastore = require("nedb");

const app = express();

const pool = require("./queries");
const fs = require("fs");

// setup of different routes
app.use("/viewer", express.static("../frontend/viewer"));
app.use("/editor", express.static("../frontend/editor"));
app.use("/reader", express.static("../frontend/reader"));
app.use("/table", express.static("../frontend/table"));
app.use("/canvas", express.static("../frontend/canvas"));
app.use("/canvas", express.static("../frontend/searcher"));
app.use("/", express.static("../frontend/"));

app.use(express.json());

app.get("/text", (request, response) => {
  pool.query("SELECT * FROM files ORDER BY id", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
});

// automatically opens the link
open("http://localhost:3000/");

// listening
app.listen(3000, () => console.log("listening at 3000"));

// creation of database
const databasePassages = new Datastore("databasePassages.db");
databasePassages.loadDatabase();

const databaseHtmlFiles = new Datastore("databaseHtmlFiles.db");
databaseHtmlFiles.loadDatabase();

const databaseTable = new Datastore("databaseTable.db");
databaseTable.loadDatabase();

// get the data
app.get("/files", (rq, rs) => {
  databaseHtmlFiles.find({}, (err, data) => {
    if (err) {
      rs.end();
      return;
    }
    rs.json(data);
  });
});

app.get("/notes", (rq, rs) => {
  databasePassages.find({}, (err, data) => {
    if (err) {
      rs.end();
      return;
    }
    rs.json(data);
  });
});

app.get("/tbl", (rq, rs) => {
  databaseTable.find({}, (err, data) => {
    if (err) {
      rs.end();
      return;
    }
    rs.json(data);
  });
});

// listening and insertion of the data in the previously created database
app.post("/api", (rq, rs) => {
  databasePassages.remove({}, { multi: true }, function (err, numRemoved) {
    databasePassages.loadDatabase(function (err) {});
  });
  const data = rq.body;
  databasePassages.insert(data);
  rs.json(data);
});

app.post("/files", (rq, rs) => {
  const data = rq.body;
  databaseHtmlFiles.insert(data);
  rs.json(data);
});

app.post("/tbl", (rq, rs) => {
  databaseTable.remove({}, { multi: true }, function (err, numRemoved) {
    console.log("1");
    databaseTable.loadDatabase(function (err) {});
  });
  const data = rq.body;
  console.log(data);
  databaseTable.insert(data);
  rs.json(data);
});

app.delete("/api", (rq, rs) => {});

pool.query("DELETE FROM files *");

for (let i = 0; i < 10; i++) {
  try {
    var data = fs.readFileSync("../files/file" + i + ".html", "utf8");
    data = data.replace(/ *\<[^)]*\> */g, "");
    console.log(data);
    pool.query("INSERT INTO files (text) VALUES ($1)", [data]);
  } catch (err) {
    console.error(err);
  }
}

app.post("/search", (rq, rs) => {
  pool.query("SELECT * FROM files ORDER BY id", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
});
