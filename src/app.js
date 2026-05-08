const express = require("express");
const { userAuth, adminAuth } = require("./middlewares/auth");
const connectDB = require("./config/database");
const User = require("./models/user");
const validateSignupData = require("./utils/validation");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
const port = 3000;

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

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) throw new Error("Invalid credentials");
    const isPasswordValid = await bcrypt.compare(password, user?.password);

    if (isPasswordValid) res.send("User logged in");
    else throw new Error("Invalid credentials");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

app.get("/user", async (req, res) => {
  const email = req.body.email;
  try {
    const user = await User.findOne({ email: email });
    res.send(user);
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
});

app.get("/feed", async (req, res) => {
  try {
    const user = await User.find({});
    res.send(user);
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
});

app.delete("/user", async (req, res) => {
  try {
    const userId = req.body.userId;
    const deletedUser = await User.findByIdAndDelete(userId);
    res.send("User Deleted:" + deletedUser);
  } catch (err) {
    res.status(404).send("Something went wrong");
  }
});

app.patch("/user/:userId", async (req, res) => {
  const id = req.params?.userId;
  const data = req.body;
  const allowed_updates = ["userId", "photoUrl", "gender", "age", "skills"];

  const isAllowed = Object.keys(data).every((k) => allowed_updates.includes(k));
  try {
    if (!isAllowed) throw new Error("Update not allowed");
    await User.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    res.send("User updated successfully");
  } catch (err) {
    res.status(400).send(err.message);
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
