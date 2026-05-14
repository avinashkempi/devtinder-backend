const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { access_token } = req.cookies;
    if (!access_token) {
      res.status(401).send("Please Login");
      return;
    }
    const decoded = await jwt.verify(access_token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) throw new Error("User Not Found");
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
};

module.exports = { userAuth };
