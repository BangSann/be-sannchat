var express = require("express");
const Rooms = require("../model/room");
const Participants = require("../model/participants");
const Messages = require("../model/messages");
const Users = require("../model/users");
const authMiddleware = require("../middleware/auth");
const { Op, Sequelize } = require("sequelize");
var router = express.Router();

async function formatRoomData({ room_datas, user_id }) {
  if (!room_datas || !Array.isArray(room_datas)) return [];

  const formattedData = await Promise.all(
    room_datas.map(async (room) => {
      const messages = room.messages || [];
      const lastMessage = messages[messages.length - 1];

      const formattedMessages = messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        create_at: msg.create_at,
        sender: msg.sender,
        is_sender: msg.sender_id == user_id,
      }));

      // ambil participant lain di room
      const otherParticipant = await Participants.findOne({
        where: { room_id: room.id },
        include: [
          {
            model: Users,
            as: "user",
            attributes: ["id", "name", "email", "avatar_url"],
            where: { id: { [Op.ne]: user_id } },
          },
        ],
      });

      // tentukan nama room dinamis
      let dynamicRoomName = room.name;
      if (room.type === "private") {
        if (otherParticipant?.user?.name) {
          dynamicRoomName = otherParticipant.user.name;
        } else if (lastMessage?.sender?.name) {
          dynamicRoomName = lastMessage.sender.name;
        }
      }

      return {
        id: room.id,
        name: dynamicRoomName,
        type: room.type,
        messages: formattedMessages,
        receiver_user: otherParticipant?.user || null,
        last_message: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              create_at: lastMessage.create_at,
              sender: lastMessage.sender,
            }
          : null,
      };
    })
  );

  return formattedData;
}

// get room by user id
router.get("/room-user", authMiddleware, async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const room_datas = await Rooms.findAll({
      attributes: ["id", "name", "type"],
      include: [
        {
          model: Participants,
          where: { user_id },
          attributes: [], // hanya filter
        },
        {
          model: Messages,
          attributes: ["id", "sender_id", "content", "create_at"],
          include: [
            {
              model: Users,
              as: "sender",
              attributes: ["id", "name", "email", "avatar_url"],
            },
          ],
        },
      ],
      distinct: true,
    });

    const formatedData = await formatRoomData({ room_datas, user_id });

    res.status(200).json({
      success: true,
      data: formatedData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch room-user data",
    });
  }
});
// get room by user id

// handle join room
router.post("/join", authMiddleware, async (req, res) => {
  try {
    const { name, type, participants_id } = req.body;

    // 🧩 Validasi awal
    if (!name || !type || !participants_id || participants_id.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields or participants are invalid",
      });
    }

    if (type === "private") {
      // 🧠 Cek apakah room dengan 2 user tersebut sudah ada
      const is_already_created = await Rooms.findAll({
        include: {
          model: Participants,
          attributes: [],
          where: {
            user_id: {
              [Op.in]: [
                participants_id[0]?.user_id,
                participants_id[1]?.user_id,
              ],
            },
          },
        },
        group: ["Rooms.id"],
        having: Sequelize.literal(
          "COUNT(DISTINCT `Participants`.`user_id`) = 2"
        ),
      });

      // 🧱 Jika sudah ada room untuk dua user ini
      if (is_already_created.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Room already exists between these participants.",
        });
      }

      // 🏗️ Buat room baru
      const roomData = await Rooms.create({
        name,
        type,
        created_at: new Date(),
      });

      // 👥 Tambahkan participants ke room tersebut
      await Promise.all(
        participants_id.map(async (item) => {
          await Participants.create({
            room_id: roomData.id,
            user_id: item.user_id,
            role: "admin",
            joined_at: new Date(),
          });
        })
      );

      const formatedRoom = await formatRoomData({
        room_datas: [roomData],
        user_id: req.user.id,
      });

      return res.status(201).json({
        success: true,
        message: "Room created successfully.",
        data: formatedRoom,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Only private room creation is supported.",
      });
    }
  } catch (error) {
    console.error("Error creating room:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});
// handle join room

module.exports = router;
