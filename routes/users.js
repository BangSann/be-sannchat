var express = require("express");
var authMiddleware = require("../middleware/auth");
const Users = require("../model/users");
var router = express.Router();

/* GET users listing. */
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const { email } = req.query;

    if (email) {
      const usersData = await Users.findOne({
        where: {
          email: email,
        },
        attributes: ["id", "name", "email", "avatar_url"], //data yang ditampilkan
      });

      if (!usersData || usersData?.values == {}) {
        return res.status(404).json({
          success: false,
          message: "Users not found!",
        });
      }

      return res.status(200).json({
        success: true,
        length: usersData.length,
        data: usersData,
      });
    }

    const usersData = await Users.findAll({
      attributes: ["id", "name", "email", "avatar_url"], //data yang ditampilkan
    });

    res.status(200).json({
      success: true,
      length: usersData.length,
      data: usersData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message || "Unexpected error !",
    });
  }
});

module.exports = router;
