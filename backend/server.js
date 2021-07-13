// opens the libraries tied to the server side
const express = require("express");
const open = require("open");
const Datastore = require("nedb");

const app = express();

const pool = require("./queries");
const fs = require("fs");
const { log } = require("util");

//send back research results
var searches = [];

// setup of different routes
app.use("/viewer", express.static("../frontend/viewer"));
app.use("/editor", express.static("../frontend/editor"));
app.use("/reader", express.static("../frontend/reader"));
app.use("/table", express.static("../frontend/table"));
app.use("/canvas", express.static("../frontend/canvas"));
app.use("/searcher", express.static("../frontend/searcher"));
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
app.listen(3000, () => {
  console.log("listening at 3000");
  pool.query("DELETE FROM files *");

  for (let i = 0; i < 10; i++) {
    try {
      var data = fs.readFileSync("../files/file" + i + ".html", "utf8");
      var file = "file" + i + ".html";
      data = data.replace(/ *\<[^)]*\> */g, "");
      pool.query("INSERT INTO files (text, nfile) VALUES ($1, $2)", [
        data,
        file,
      ]);
      //pool.query("ALTER TABLE files ADD FULLTEXT (id, text);");
    } catch (err) {
      console.error(err);
    }
  }
});

// creation of database
const databasePassages = new Datastore("databasePassages.db");
databasePassages.loadDatabase();

// const databaseHtmlFiles = new Datastore("databaseHtmlFiles.db");
// databaseHtmlFiles.loadDatabase();

// const databaseHtmlFiles = new Datastore("dbFilesPointing1.db");
// databaseHtmlFiles.loadDatabase();

const databaseHtmlFiles = new Datastore("dbFilesPointing2.db");
databaseHtmlFiles.loadDatabase();

databaseHtmlFiles.remove({}, { multi: true }, function (err, numRemoved) {
  databaseHtmlFiles.loadDatabase(function (err) {});
});

databasePassages.remove({}, { multi: true }, function (err, numRemoved) {
  databasePassages.loadDatabase(function (err) {});
});

const databaseTable = new Datastore("databaseTable.db");
databaseTable.loadDatabase();

const databaseSearches = new Datastore("databaseSearches.db");
databaseSearches.loadDatabase();

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

app.get("/srch", (rq, rs) => {
  databaseSearches.find({}, (err, data) => {
    if (err) {
      rs.end();
      return;
    }
    for (i = 0; i < data.length; i++) {
      const file = fs.readFileSync("../files/" + data[i].nfile, "utf8");
      const ret = {
        nfile: file,
      };
      searches.push(ret);
    }
    rs.json(searches);
    searches = [];
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
    databaseTable.loadDatabase(function (err) {});
  });
  const data = rq.body;
  databaseTable.insert(data);
  rs.json(data);
});

app.post("/srch", (rq, rs) => {
  databaseSearches.remove({}, { multi: true }, function (err, numRemoved) {
    databaseSearches.loadDatabase(function (err) {});
  });
  const s = rq.body.sQuery;
  var data = "";
  console.log(s);
  try {
    pool
      .query(
        "SELECT id, nfile, ts_rank(to_tsvector(text), to_tsquery($1)) AS rank FROM files WHERE to_tsvector('english', text) @@ to_tsquery('english', $1) ORDER BY rank DESC",
        [s]
      )

      .then((res) => databaseSearches.insert(res.rows))
      .then((res) => rs.json(data));
  } catch (error) {
    console.log(error);
  }
});

// app.post("/search", (rq, rs) => {
//   pool.query("SELECT * FROM files ORDER BY id", (error, results) => {
//     if (error) {
//       throw error;
//     }
//     response.status(200).json(results.rows);
//   });
// });

function toJSON(node) {
  let propFix = { for: "htmlFor", class: "className" };
  let specialGetters = {
    style: (node) => node.style.cssText,
  };
  let attrDefaultValues = { style: "" };
  let obj = {
    nodeType: node.nodeType,
  };
  if (node.tagName) {
    obj.tagName = node.tagName.toLowerCase();
  } else if (node.nodeName) {
    obj.nodeName = node.nodeName;
  }
  if (node.nodeValue) {
    obj.nodeValue = node.nodeValue;
  }
  let attrs = node.attributes;
  if (attrs) {
    let defaultValues = new Map();
    for (let i = 0; i < attrs.length; i++) {
      let name = attrs[i].nodeName;
      defaultValues.set(name, attrDefaultValues[name]);
    }
    // Add some special cases that might not be included by enumerating
    // attributes above. Note: this list is probably not exhaustive.
    switch (obj.tagName) {
      case "input": {
        if (node.type === "checkbox" || node.type === "radio") {
          defaultValues.set("checked", false);
        } else if (node.type !== "file") {
          // Don't store the value for a file input.
          defaultValues.set("value", "");
        }
        break;
      }
      case "option": {
        defaultValues.set("selected", false);
        break;
      }
      case "textarea": {
        defaultValues.set("value", "");
        break;
      }
    }
    let arr = [];
    for (let [name, defaultValue] of defaultValues) {
      let propName = propFix[name] || name;
      let specialGetter = specialGetters[propName];
      let value = specialGetter ? specialGetter(node) : node[propName];
      if (value !== defaultValue) {
        arr.push([name, value]);
      }
    }
    if (arr.length) {
      obj.attributes = arr;
    }
  }
  let childNodes = node.childNodes;
  // Don't process children for a textarea since we used `value` above.
  if (obj.tagName !== "textarea" && childNodes && childNodes.length) {
    let arr = (obj.childNodes = []);
    for (let i = 0; i < childNodes.length; i++) {
      arr[i] = this.toJSON(childNodes[i]);
    }
  }
  return obj;
}
