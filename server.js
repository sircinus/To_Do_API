const express = require("express");
const cors = require("cors");
const port = 3000;

const sequelize = require("./db.config");
sequelize.sync().then(() => console.log("Database Ready!"));

const userEndpoint = require("./routes/users");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/users", userEndpoint);

app.listen(port, () => console.log(`listening on port ${port}`));
