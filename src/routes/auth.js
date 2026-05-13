const express = require("express");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const { validateSignupData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) throw new Error("Invalid credentials");
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();
      res.cookie("access_token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.json({ message: "User logged in", data: user });
    } else throw new Error("Invalid credentials");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

router.post("/signup", async (req, res) => {
  try {
    validateSignupData(req);
    const encryptedPassword = await bcrypt.hash(req.body.password, 10);
    let user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: encryptedPassword,
    });
    await user.save();
    res.send("User create successfully");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

router.post("/logout", async (req, res) => {
  try {
    res.cookie("access_token", null, {
      expires: new Date(Date.now()),
    });
    res.send("User logged out");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = router;
