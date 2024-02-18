const dotenv = require("dotenv").config();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { userModel } = require("../db");
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    const decoded = jwt.verify(token, process.env.loginSecret);
    if (decoded) {
      const user = await userModel.findOne({ _id: decoded.id });
      req.body.userId = decoded.id;
      req.body.userRole = user.role;
      next();
    } else {
      res.send({ msg: "Not Authorized" });
    }
  } else {
    res.send({ msg: "Not Authorized" });
  }
};
module.exports = { auth };
