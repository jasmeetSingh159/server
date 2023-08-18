const Pool = require("pg").Pool;

require("dotenv").config();

const pool = new Pool({
  user: process.env.PSQL_USER,
  host: "localhost",
  database: process.env.PSQL_DB,
  password: process.env.PSQL_PASS,
  port: process.env.PSQL_PORT,
});

module.exports = pool;
