const Pool = require('pg').Pool
const pool = new Pool({
  user: 'raphael',
  host: 'localhost',
  database: 'api',
  password: 'raphael',
  port: 5432,
})

const getTextName = (rq, rs) => {
  pool.query('SELECT name FROM docs', (error, results) => {
    if (error) {
      throw error
    }
    console.log("there")
    response.status(200).json(results.rows)
  })
}


module.exports = {
  getTextName,
}