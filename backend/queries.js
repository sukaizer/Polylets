const Pool = require('pg').Pool

const pool = new Pool({
  user: "me",
  host: "localhost",
  database: "search",
  password: "password",
  port: 5432,
});

const getTexts = (request, response) => {
  pool.query("SELECT * FROM files ORDER BY id", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

// const getUserById = (request, response) => {
//   const id = parseInt(request.params.id);

//   pool.query("SELECT * FROM users WHERE id = $1", [id], (error, results) => {
//     if (error) {
//       throw error;
//     }
//     response.status(200).json(results.rows);
//   });
// };

const addText = (request, response) => {
  const { text } = request.body;
  pool.query("INSERT INTO files (text) VALUES ($1)"),
    [text],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`file added with ID: ${results.insertId}`);
    };
};


const searchRank = (request, response) => {
  console.log("1");
  const { s } = request.body;
  console.log(s);
  pool.query("SELECT * FROM files WHERE MATCH (text) AGAINST ($1) ORDER BY RANK desc\G"), [s], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  };
};

// const updateUser = (request, response) => {
//   const id = parseInt(request.params.id);
//   const { name, email } = request.body;

//   pool.query(
//     "UPDATE users SET name = $1, email = $2 WHERE id = $3",
//     [name, email, id],
//     (error, results) => {
//       if (error) {
//         throw error;
//       }
//       response.status(200).send(`User modified with ID: ${id}`);
//     }
//   );
// };

// const deleteUser = (request, response) => {
//   const id = parseInt(request.params.id);

//   pool.query("DELETE FROM users WHERE id = $1", [id], (error, results) => {
//     if (error) {
//       throw error;
//     }
//     response.status(200).send(`User deleted with ID: ${id}`);
//   });
// };

module.exports = {
  addText,
  getTexts,
  searchRank,
};

module.exports = pool;
