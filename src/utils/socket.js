const socket = require("socket.io");
const chatModel = require("../models/chat");

const initiazeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = [userId, targetUserId].sort().join("_");
      socket.join(roomId);
    });
    socket.on("sendMessage", async ({ userId, targetUserId, newMessage }) => {
      const roomId = [userId, targetUserId].sort().join("_");
      try {
        let chat = await chatModel.findOne({
          participants: { $all: [userId, targetUserId] },
        });
        if (!chat) {
          chat = new chatModel({
            participants: [userId, targetUserId],
            messages: [],
          });
        }
        chat.messages.push({
          senderId: userId,
          text: newMessage,
        });
        await chat.save();
        const lastMessage = chat.messages[chat.messages.length - 1];

        // Broadcast the newly created message to everyone in the room
        io.to(roomId).emit("messageReceived", lastMessage);
      } catch (error) {
        console.log(error.message);
      }
    });
    socket.on("disconnect", () => {});
  });
};

module.exports = initiazeSocket;
