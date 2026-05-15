const express = require("express");
const { userAuth } = require("../middlewares/auth");
const chatModel = require("../models/chat");

const router = express.Router();

router.get("/chatHistory/:senderId", userAuth, async (req, res) => {
  try {
    const { senderId } = req.params;
    let chat = await chatModel
      .findOne({
        participants: { $all: [req.user._id, senderId] },
      })
      .populate({ path: "messages.senderId", select: "firstName lastName" });
    if (!chat) {
      chat = new chatModel({
        participants: [req.user._id, senderId],
        messages: [],
      });
      await chat.save();
    }
    res.json(chat);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
