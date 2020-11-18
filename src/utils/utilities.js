const path = require("path");
const fs = require("fs");

const deleteBook = async (findBook) => {
  try {
    if (!findBook) {
      req.flash("error_msg", "Book not found");
      return res.send("Error");
    }
    let coverDir = path.join(
      __dirname,
      `../../public/upload/Cover/${findBook.name}`
    );
    let bookDir = path.join(
      __dirname,
      `../../public/upload/Book/${findBook.name}`
    );
    fs.rmdir(coverDir, { recursive: true }, (err) => {
      if (err) {
        console.log(err);
        return false;
      }
    });
    fs.rmdir(bookDir, { recursive: true }, (err) => {
      if (err) {
        console.log(err);
        return false;
      }
    });
  } catch (error) {
    console.log(error);
    return false;
  }
  return true;
};

module.exports = deleteBook;
