const express = require("express");
const router = express.Router();

const userController = require("../controllers/users");

router.get("/", (req, res) => {
  userController.getAllUsers((err, users) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(users);
  });
});

// Route to get user by id
router.get("/:id", (req, res) => {
  const userId = parseInt(req.params.id, 10);
  userController.getUserById(userId, (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (user.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json(user);
  });
});

// Route to get users by company name
router.get("/company/:companyName", (req, res) => {
  const companyName = req.params.companyName;
  userController.getUserByCompany(companyName, (err, users) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(users);
  });
});

router.post("/", (req, res) => {
  const {
    name,
    email,
    dob,
    active,
    license_expiry,
    license_number,
    license_state,
    license_type,
  } = req.body;
  console.log(req.body);
  userController.createUser(
    name,
    email,
    dob,
    active,
    license_expiry,
    license_number,
    license_state,
    license_type,
    (error, result) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(201).json(result); // 201 indicates resource creation
    }
  );
});

router.post("/company", (req, res) => {
  const { id, companyName, roles } = req.body;
  console.log(req.body);
  userController.joinUserToCompany(id, companyName, roles, (error, result) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(result); // 201 indicates resource creation
  });
});

router.delete("/company", (req, res) => {
  const { id, companyName } = req.body;
  console.log(req.body);
  userController.removeUserFromCompany(id, companyName, (error, result) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(result); // 201 indicates resource creation
  });
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);
  userController.deleteUser(id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

module.exports = router;
