const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://root:root@namastenodecluster.ppmy3cn.mongodb.net/devTinder",
  );
};

module.exports = connectDB;