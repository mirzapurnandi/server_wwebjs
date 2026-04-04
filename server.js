const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 6000;
const corsOptions = { credentials: true, origin: process.env.URL_FE || "*" };
app.use(cors(corsOptions));

const indexRouter = require("./routes");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.use(indexRouter);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is listening on port:${PORT}`);
});
