const router = require("express").Router();
const keys = require("../config/key");
const jwt = require("jsonwebtoken");
const adminAuth = require("../middleware/auth");
const Book = require("../models/Book");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const async = require("async");
const deleteBook = require("../utils/utilities");

router.get("/login", async (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (email !== keys.ADMIN_EMAIL || password !== keys.ADMIN_PASSWORD) {
      // console.log('Invalid Credentials')
      return res.status(401).send("Invalid Credentials");
    }

    const token = jwt.sign({ admin: `${email}${password}` }, "JWT-SECRET");
    res.cookie("authorization", token, {
      httpOnly: false,
    });
    res.send("Logged in");
  } catch (error) {
    // console.log(error)
    res.status(500).send(error);
  }
});

router.get("/logout", async (req, res) => {
  res.clearCookie("authorization");
  req.flash("success_msg", "Successfully Logged Out");
  res.redirect("/admin/login");
});

router.get("/test", adminAuth, async (req, res) => {
  res.render("test");
});

//Establish Storage for file upload
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    let newDestination;
    if (file.fieldname == "cover")
      newDestination =
        __dirname + `/../../public/upload/Cover/${req.body.name}`;
    else if (file.fieldname == "book")
      newDestination = __dirname + `/../../public/upload/Book/${req.body.name}`;
    var stat = null;
    try {
      stat = fs.statSync(newDestination);
    } catch (err) {
      fs.mkdir(
        newDestination,
        {
          recursive: true,
        },
        (err) => {
          if (err) console.error("New Directory Error: ", err.message);
          else console.log("New Directory Success");
        }
      );
    }
    if (stat && !stat.isDirectory())
      throw new Error("Directory Couldn't be created");
    await cb(null, newDestination);
  },
  filename: async function (req, file, cb) {
    const imageFileTypes = /jpeg|jpg|png|gif/;
    let fileName =
      file.fieldname + "-" + Date.now() + path.extname(file.originalname);
    await cb(null, fileName);
  },
});

var upload = multer({
  storage: storage,
  limits: {
    fileSize: 80000000,
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "book") {
      // if uploading resume
      if (
        file.mimetype === "application/pdf" ||
        file.mimetype === "application/msword" ||
        file.mimetype ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // check file type to be pdf, doc, or docx
        cb(null, true);
      } else {
        cb(null, false); // else fails
      }
    } else {
      // else uploading image
      if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
      ) {
        // check file type to be png, jpeg, or jpg
        cb(null, true);
      } else {
        cb(null, false); // else fails
      }
    }
  },
});
var cpUpload = upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "book", maxCount: 1 },
]);
// Route to upload a Book
router.post("/upload/book", adminAuth, cpUpload, async (req, res, error) => {
  try {
    const { name, description } = req.body;
    let cover, book;
    const files = req.files;
    if (files.cover) cover = `/upload/Cover/${name}/${files.cover[0].filename}`;
    if (files.book) book = `/upload/Book/${name}/${files.book[0].filename}`;
    const savedBook = await new Book({
      name,
      description,
      cover,
      book,
    }).save();
    if (!savedBook) {
      req.flash("error_msg", "Error uploading new book. Try again");
      res.send("Error");
    }
    console.log(savedBook);
    req.flash("success_msg", "Book successfully uploaded");
    res.send("Success");
  } catch (err) {
    console.error(err);
  }
});

//Delete a book
router.get("/book/delete/:id", adminAuth, async (req, res) => {
  try {
    const findBook = await Book.findById(req.params.id);
    const deletedBook = await deleteBook(findBook);
    if (deletedBook) {
      await findBook.remove();
      req.flash("success_msg", "Book Deleted Successfully");
      res.send("Deleted");
    } else {
      req.flash("error_msg", "Unable to delete book");
      res.send("Not Deleted");
    }
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Unable to delete the book");
    // res.redirect('/admin');
    res.send("Error", err);
  }
});

// Route to upload a Book
router.post("/book/edit/:id", adminAuth, cpUpload, async (req, res, error) => {
  try {
    const findBook = await Book.findById(req.params.id);
    const deletedBook = await deleteBook(findBook);
    if (deletedBook) {
      await findBook.remove();
    } else {
      req.flash("error_msg", "Unable to update book");
      res.send("Deleted");
    }
    const { name, description } = req.body;
    let cover, book;
    const files = req.files;
    if (files.cover) cover = `/upload/Cover/${name}/${files.cover[0].filename}`;
    if (files.book) book = `/upload/Book/${name}/${files.book[0].filename}`;
    const savedBook = await new Book({
      name,
      description,
      cover,
      book,
    }).save();
    if (!savedBook) {
      req.flash("error_msg", "Error uploading new book. Try again");
      res.send("Error");
    }
    console.log(savedBook);
    req.flash("success_msg", "Book successfully uploaded");
    res.send("Success");
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
