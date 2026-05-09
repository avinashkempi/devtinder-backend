const express = require("express");
const { userAuth } = require("./middlewares/auth");
const connectDB = require("./config/database");
const User = require("./models/user");
const validateSignupData = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookieParser());
const port = 3000;

app.post("/login", async (req, res) => {
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
      res.send("User logged in");
    } else throw new Error("Invalid credentials");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

app.post("/signup", async (req, res) => {
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

app.get("/profile", userAuth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

connectDB()
  .then(() => {
    console.log("DB connected");
    app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
  })
  .catch((err) => console.log("DB connection failed :", err));
