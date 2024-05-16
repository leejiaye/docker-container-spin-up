const express = require("express");
const bodyParser = require("body-parser");
const registerRouter = require("./routes/registerRouter");

const app = express();

app.use(bodyParser.json());

// Routes
app.use("/register", registerRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
