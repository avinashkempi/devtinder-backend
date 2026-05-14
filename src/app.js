const express = require("express");
require("dotenv").config();
const { userAuth } = require("./middlewares/auth");
const connectDB = require("./config/database");
const User = require("./models/user");
const validateSignupData = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestsRouter = require("./routes/requests");
const userRouter = require("./routes/user");
const cors = require("cors");
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestsRouter);
app.use("/", userRouter);

connectDB()
  .then(() => {
    console.log("DB connected");
    app.listen(3000, () => {
      console.log(`App listening on port ${3000}`);
    });
  })
  .catch((err) => console.log("DB connection failed :", err));
