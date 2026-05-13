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
    const {
      firstName,
      lastName,
      email,
      password,
      age,
      gender,
      about,
      photoUrl,
      skills,
    } = req.body;

    const encryptedPassword = await bcrypt.hash(password, 10);
    const normalizedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
        ? skills
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

    const user = new User({
      firstName,
      lastName,
      email,
      password: encryptedPassword,
      age,
      gender,
      about,
      photoUrl,
      skills: normalizedSkills,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();
    res.cookie("access_token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });
    res.json({ message: "User created successfully", data: savedUser });
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
