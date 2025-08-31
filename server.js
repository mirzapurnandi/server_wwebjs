const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 6000;
const corsOptions = { credentials: true, origin: process.env.URL || "*" };

const indexRouter = require("./routes");

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(indexRouter);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is listening on port:${PORT}`);
});
