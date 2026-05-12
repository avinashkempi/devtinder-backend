const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateUserData } = require("../utils/validation");
const bcrypt = require("bcrypt");

const router = express.Router();

router.get("/profile/view", userAuth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

router.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateUserData(req)) throw new Error("Not allowed to edit");
    const loggedInUser = req.user;
    Object.keys(req.body).forEach(
      (item) => (loggedInUser[item] = req.body[item]),
    );
    await loggedInUser.save();
    res.json({
      message: loggedInUser.firstName + ", your data is updated",
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

router.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const isPasswordValid = await loggedInUser.validatePassword(
      req.body.passwordOld,
    );
    if (isPasswordValid) {
      loggedInUser.password = await bcrypt.hash(req.body.passwordNew, 10);
      await loggedInUser.save();
      res.send("Password changed successfully");
    } else throw new Error("Unable to save");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = router;
