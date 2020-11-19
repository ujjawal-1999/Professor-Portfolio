const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const adminAuth = function (req, res, next) {
  try {
    const token = req.cookies.authorization;
    if (!token) {
      throw new Error("User is not logged in");
    }
    jwt.verify(token, "JWT-SECRET", async (err, decodedToken) => {
      if (err) {
        res.redirect("/admin/login");
        next();
      } else {
        let user = await Admin.findById(decodedToken._id);
        req.user = user;
        next();
      }
    });
  } catch (error) {
    res.status(401).send({
      error: "Please Login to access the admin routes ",
    });
  }
};

module.exports = adminAuth;
