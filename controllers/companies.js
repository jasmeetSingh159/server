const pool = require("../utils/db");

const getAllCompanies = (callback) => {
  pool.query("SELECT * FROM companies ORDER BY id ASC", (err, results) => {
    if (err) return callback(err, null);
    callback(null, results.rows);
  });
};

const getCompanyById = (id, callback) => {
  pool.query("SELECT * FROM companies WHERE id = $1", [id], (err, results) => {
    if (err) return callback(err, null);
    callback(null, results.rows);
  });
};

const createCompany = (name, abn, address) => {
  pool.query(
    "INSERT INTO companies (name, abn, address) VALUES ($1, $2, $3) RETURNING id",
    [name, abn, address],
    (err, results) => {
      if (err) callback(err, null);
      const id = results.rows[0].id;
      callback(null, id);
    }
  );
};

module.exports = { getAllCompanies, createCompany, getCompanyById };
