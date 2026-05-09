const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { access_token } = req.cookies;
    if (!access_token) throw new Error("Please Login");
    const decoded = await jwt.verify(access_token, "DevTinder@$123");
    user = await User.findById(decoded._id);
    if (!user) throw new Error("User Not Found");
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
};

module.exports = { userAuth };
