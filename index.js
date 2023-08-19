const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

const users = require("./routes/users");
const companies = require("./routes/companies");

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

app.use("/users", users);
app.use("/companies", companies);

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
