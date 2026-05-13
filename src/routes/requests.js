const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const router = express.Router();

router.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const { toUserId, status } = req.params;

    // check if status matches
    const allowedStatus = ["ignore", "interested"];
    if (!allowedStatus.includes(status)) throw new Error("Invalid status type");

    // check if to user is present in DB
    const toUser = await User.findById(toUserId);
    if (!toUser) throw new Error("User doesn't exist");

    // check if the request exists
    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });
    if (existingConnectionRequest)
      throw new Error("Connection request already exists");

    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    const data = await connectionRequest.save();
    res.send("Request saved successfully");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

router.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { status, requestId } = req.params;
      const loggedInUser = req.user;

      const allowedStatus = ["accepted", "rejected"];

      if (!allowedStatus.includes(status)) {
        throw new Error("Status not allowed");
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) throw new Error("User not found");

      connectionRequest.status = status;
      await connectionRequest.save();
      res.send("Status Updated");
    } catch (err) {
      console.error("/request/review error:", err);
      res.status(400).send(err?.message || "Invalid data");
    }
  },
);

module.exports = router;
