const express = require("express");
const router = express.Router();

const companyController = require("../controllers/companies");

router.get("/", (req, res) => {
  companyController.getAllCompanies((err, companies) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(companies);
  });
});

// Route to get user by id
router.get("/:id", (req, res) => {
  const companyId = parseInt(req.params.id, 10);
  companyController.getCompanyById(companyId, (err, company) => {
    if (err) return res.status(500).json({ error: err.message });
    if (company.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json(company);
  });
});

router.post("/", (req, res) => {
  const { name, abn, address } = req.body;
  companyController.createCompany(name, abn, address, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json(result);
  });
});

module.exports = router;
