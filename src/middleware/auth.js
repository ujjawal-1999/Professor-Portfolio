const jwt = require("jsonwebtoken");
const keys = require("../config/key");

const adminAuth = function (req, res, next) {
  try {
    const token = req.cookies.authorization;
    const decoded = jwt.verify(token, "JWT-SECRET");
    const admin = decoded.admin;
    if (admin !== `${keys.ADMIN_EMAIL}${keys.ADMIN_PASSWORD}`) {
      throw new Error("Invalid Credentials");
    }
    req.token = token;

    next();
  } catch (error) {
    res.status(401).send({
      error: "Please Login to access the admin routes ",
    });
  }
};

module.exports = adminAuth;
