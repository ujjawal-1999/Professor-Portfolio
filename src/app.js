const express = require("express");
const path = require("path");

const mongoose = require("mongoose");
const connect_flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const keys = require("./config/key");

//Configuring App
const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

//Configuring Port
const PORT = process.env.PORT || 3000;

//Mongoose connection
mongoose
  .connect(keys.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log("Connected to mongo server"))
  .catch((err) => console.error(err));

//Setting EJS view engine
app.set("view engine", "ejs");

//body parser
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "JWT_SECRET",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(connect_flash());

// global var
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");

  next();
});

//Setup for rendering static pages
const publicDirectory = path.join(__dirname, "../public");
// console.log(publicDirectory);
app.use(express.static(publicDirectory));

//Routes
const indexRoutes = require("./routes/index");
const adminRoutes = require("./routes/admin");

app.use("/", indexRoutes);
app.use("/admin", adminRoutes);

//Start the server
app.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
