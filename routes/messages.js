const express = require("express");
const Messages = require("../model/messages");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { room_id, receiver_id, content, type } = req.body;
    const io = req.app.get("io");

    const messageData = {
      room_id,
      content,
      type,
      sender_id: req.user?.id,
      create_at: new Date(),
    };

    const message = await Messages.create(messageData);
    const roomName = `${receiver_id}`;
    if (message) {
      if (roomName) {
        io.to(roomName).emit("receiveMessage", {
          room_id: room_id,
          message: message,
        });
      }
    }

    res.status(200).json({
      status: true,
      data: { ...message.dataValues, is_sender: true },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      data: "failed to send message!",
    });
  }
});

module.exports = router;
