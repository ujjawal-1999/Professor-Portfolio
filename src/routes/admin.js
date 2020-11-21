const router = require("express").Router();
const jwt = require("jsonwebtoken");
const adminAuth = require("../middleware/auth");
const Book = require("../models/Book");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const deleteBook = require("../utils/utilities");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

router.get("/login", async (req, res) => {
  res.render("admin-login");
});

router.post("/login", async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const foundAdmin = await Admin.findOne({ username });
    if (!foundAdmin) {
      req.flash("error_msg", "Invalid Credentials");
      res.redirect('/admin/login');
    }
    const checkPassword = await bcrypt.compare(password, foundAdmin.password);
    if (!checkPassword) {
      req.flash("error_msg", "Invalid Login Credentials");
      res.redirect('/admin/login');
    }
    const token = jwt.sign(
      {
        username: foundAdmin.username,
        adminId: foundAdmin._id,
      },
      "JWT-SECRET"
    );
    res.cookie("authorization", token, {
      httpOnly: false,
    });
    res.redirect('/admin/profile/books');
  } catch (error) {
    console.log(error)
    res.redirect('/admin/login');
    // res.status(500).send(error);
  }
});

router.get("/logout", async (req, res) => {
  res.clearCookie("authorization");
  req.flash("success_msg", "Successfully Logged Out");
  res.redirect("/admin/login");
});

router.get("/profile/books", adminAuth, async (req, res) => {
  const books = await Book.find().sort([['updatedAt', -1]]);
  // console.log(books);
  res.render("books-admin",{
    books
  });
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
      res.redirect('/admin/profile/books')
    }
    console.log(savedBook);
    req.flash("success_msg", "Book successfully uploaded");
    res.redirect('/admin/profile/books')
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
      res.redirect('/admin/profile/books')
    } else {
      req.flash("error_msg", "Unable to delete book");
      res.redirect('/admin/profile/books')
    }
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Unable to delete the book");
    // res.redirect('/admin');
    res.redirect('/admin/profile/books')
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
      res.redirect('/admin/profile/books')
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
      res.redirect('/admin/profile/books')
    }
    console.log(savedBook);
    req.flash("success_msg", "Book successfully uploaded");
    res.redirect('/admin/profile/books')
  } catch (err) {
    console.error(err);
    res.redirect('/admin/profile/books')
  }
});

// // Profile Picture Update Option
// const storageProfile = multer.diskStorage({
//   destination: async function (req, file, cb) {
//     let newDestination;
//     newDestination = __dirname + `/../../public/upload/Profile`;
//     var stat = null;
//     try {
//       stat = fs.statSync(newDestination);
//     } catch (err) {
//       fs.mkdir(
//         newDestination,
//         {
//           recursive: true,
//         },
//         (err) => {
//           if (err) console.error("New Directory Error: ", err.message);
//           else console.log("New Directory Success");
//         }
//       );
//     }
//     if (stat && !stat.isDirectory())
//       throw new Error("Directory Couldn't be created");
//     await cb(null, newDestination);
//   },
//   filename: async function (req, file, cb) {
//     const imageFileTypes = /jpeg|jpg|png|gif/;
//     let fileName =
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname);
//     await cb(null, fileName);
//   },
// });

// var uploadProfile = multer({
//   storage: storageProfile,
//   limits: {
//     fileSize: 20000000,
//   },
//   fileFilter: (req, file, cb) => {
//     if (
//       file.mimetype === "image/png" ||
//       file.mimetype === "image/jpg" ||
//       file.mimetype === "image/jpeg"
//     ) {
//       cb(null, true);
//     } else {
//       cb(null, false);
//     }
//   },
// });

// // Route to upload a image
// router.post(
//   "/upload/profile-image",
//   adminAuth,
//   uploadProfile.single("image"),
//   async (req, res, error) => {
//     try {
//       const file = req.file;
//       let image = `/upload/Profile/${file.filename}`;
//       const user = req.user;
//       user.image = image;
//       await user.save();
//       if (!user) {
//         req.flash("error_msg", "Error uploading new image. Try again");
//         res.send("Error");
//       }
//       console.log(user);
//       req.flash("success_msg", "Image successfully uploaded");
//       res.send("Success");
//     } catch (err) {
//       console.error(err);
//     }
//   }
// );

// // Route to edit Login Credentials
// router.post("/edit/credentials", adminAuth, async (req, res, error) => {
//   try {
//     const { username, password } = req.body;
//     const user = req.user;
//     if (username) user.username = username;
//     const salt = await bcrypt.genSalt();
//     if (password) user.password = await bcrypt.hash(password, salt);
//     await user.save();
//     if (!user) {
//       req.flash("error_msg", "Error editing credentials. Try again");
//       res.send("Error");
//     }
//     console.log(user);
//     req.flash("success_msg", "Credentials edited successfully");
//     res.send("Success");
//   } catch (err) {
//     console.error(err);
//   }
// });

// // Edit Personal Details
// router.post("/edit/details", adminAuth, async (req, res, error) => {
//   try {
//     const { name, description } = req.body;
//     const user = req.user;
//     if (name) user.name = name;
//     if (description) user.description = description;
//     await user.save();
//     if (!user) {
//       req.flash("error_msg", "Error editing details. Try again");
//       res.send("Error");
//     }
//     console.log(user);
//     req.flash("success_msg", "Details edited successfully");
//     res.send("Success");
//   } catch (err) {
//     console.error(err);
//   }
// });

// // Add new Experience Details
// router.post("/add/experience/", adminAuth, async (req, res, error) => {
//   try {
//     const user = req.user;
//     const { title, description } = req.body;
//     const newDetails = { title, description };
//     user.details.push(newDetails);
//     await user.save();
//     req.flash("success", "A section has been removed");
//     res.redirect(req.get("referer"));
//   } catch (err) {
//     console.error(err);
//   }
// });

// // Delete Experience Details
// router.get("/delete/experience/:id", adminAuth, async (req, res, error) => {
//   try {
//     const user = req.user;
//     user.details = user.details.filter(
//       (detail) => !detail._id.equals(req.params.id)
//     );
//     await user.save();
//     req.flash("success", "A section has been removed");
//     res.redirect(req.get("referer"));
//   } catch (err) {
//     console.error(err);
//   }
// });

// // Edit Contact Details
// router.post("/edit/contact", adminAuth, async (req, res, error) => {
//   try {
//     const { email, phone, facebook, linkedin } = req.body;
//     const user = req.user;
//     if (email) user.contact.email = email;
//     if (phone) user.contact.phone = phone;
//     if (facebook) user.contact.facebook = facebook;
//     if (linkedin) user.contact.linkedin = linkedin;
//     await user.save();
//     if (!user) {
//       req.flash("error_msg", "Error editing details. Try again");
//       res.send("Error");
//     }
//     console.log(user);
//     req.flash("success_msg", "Details edited successfully");
//     res.send("Success");
//   } catch (err) {
//     console.error(err);
//   }
// });

module.exports = router;
