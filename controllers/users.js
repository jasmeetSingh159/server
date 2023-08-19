const pool = require("../utils/db");

const getAllUsers = (callback) => {
  pool.query("SELECT * FROM users ORDER BY id ASC", (err, results) => {
    if (err) return callback(err);
    callback(null, results.rows);
  });
};

const getUserByCompany = (company, callback) => {
  pool.query(
    "SELECT u.* FROM users u JOIN user_companies uc ON u.id = uc.user_id JOIN companies c ON uc.company_id = c.id WHERE c.name = $1",
    [company],
    (err, results) => {
      if (err) return callback(err);
      callback(null, results.rows);
    }
  );
};

const getUserById = (id, callback) => {
  pool.query("SELECT * FROM users WHERE id = $1", [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results.rows);
  });
};

const createUser = (
  name,
  email,
  dob,
  active,
  license_expiry,
  license_number,
  license_state,
  license_type,
  callback
) => {
  const insertUserQuery = `
        INSERT INTO users(name, email, dob, active, license_expiry, license_number, license_state, license_type)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id;
    `;

  pool.query(
    insertUserQuery,
    [
      name,
      email,
      dob,
      active,
      license_expiry,
      license_number,
      license_state,
      license_type,
    ],
    (err, res) => {
      if (err) {
        callback(err, null);
        return;
      }
      const userId = res.rows[0].id;
      callback(null, userId);
    }
  );
};

const joinUserToCompany = async (userId, companyName, roles, callback) => {
  try {
    const selectCompanyQuery = `
        SELECT id FROM companies WHERE name = $1;
    `;

    const res = await pool.query(selectCompanyQuery, [companyName]);
    const companyId = res.rows[0]?.id;

    if (!companyId) {
      callback(new Error(`Company with name ${companyName} not found.`), null);
      return;
    }

    if (
      !roles.includes("admin") &&
      !roles.includes("scheduler") &&
      !roles.includes("driver")
    ) {
      callback(new Error(`Invalid roles`), null);
      return;
    }

    const insertUserCompanyQuery = `
            INSERT INTO user_companies(user_id, company_id)
            VALUES($1, $2);
        `;

    await pool.query(insertUserCompanyQuery, [userId, companyId]);

    for (let role of roles) {
      const insertUserRoleQuery = `
            INSERT INTO company_${role}s(company_id, ${role}_id)
            VALUES($1, $2);
        `;
      await pool.query(insertUserRoleQuery, [companyId, userId]);
    }

    callback(null, "Successfully inserted user into company roles.");
  } catch (error) {
    callback(error, null);
  }
};

const deleteUser = (userId, callback) => {
  const tablesToDeleteFrom = [
    { table: "user_companies", column: "user_id" },
    { table: "company_schedulers", column: "scheduler_id" },
    { table: "company_admins", column: "admin_id" },
    { table: "company_drivers", column: "driver_id" },
  ];

  let completedQueries = 0;

  tablesToDeleteFrom.forEach((entry) => {
    const deleteQuery = `
            DELETE FROM ${entry.table} WHERE ${entry.column} = $1;
        `;

    pool.query(deleteQuery, [userId], (deleteErr) => {
      if (deleteErr) {
        callback(deleteErr, null);
        return;
      }

      completedQueries += 1;

      if (completedQueries === tablesToDeleteFrom.length) {
        const deleteUserQuery = `
                    DELETE FROM users WHERE id = $1;
                `;

        pool.query(deleteUserQuery, [userId], (userDeleteErr) => {
          if (userDeleteErr) {
            callback(userDeleteErr, null);
            return;
          }

          callback(null, { success: true });
        });
      }
    });
  });
};

const removeUserFromCompany = (userId, companyName, callback) => {
  const selectCompanyQuery = `
        SELECT id FROM companies WHERE name = $1;
    `;

  pool.query(selectCompanyQuery, [companyName], (err, res) => {
    if (err) {
      callback(err, null);
      return;
    }

    const companyId = res.rows[0]?.id;

    if (!companyId) {
      callback(new Error(`Company with name ${companyName} not found.`), null);
      return;
    }

    const deleteUserFromTables = [
      { table: "user_companies", column: "user_id" },
      { table: "company_schedulers", column: "scheduler_id" },
      { table: "company_admins", column: "admin_id" },
      { table: "company_drivers", column: "driver_id" },
    ];

    let completedQueries = 0;

    deleteUserFromTables.forEach((entry) => {
      const deleteQuery = `
                DELETE FROM ${entry.table} WHERE ${entry.column} = $1 AND company_id = $2;
            `;

      pool.query(deleteQuery, [userId, companyId], (deleteErr) => {
        if (deleteErr) {
          callback(deleteErr, null);
          return;
        }

        completedQueries += 1;

        if (completedQueries === deleteUserFromTables.length) {
          callback(null, { success: true });
        }
      });
    });
  });
};

module.exports = {
  getAllUsers,
  getUserByCompany,
  getUserById,
  createUser,
  deleteUser,
  joinUserToCompany,
  removeUserFromCompany,
};
