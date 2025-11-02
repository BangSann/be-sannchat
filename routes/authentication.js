var express = require("express");
var router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Users = require("../model/users");
const authMiddleware = require("../middleware/auth");

dotenv.config();

// register route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const is_email_used = await Users.findOne({
      where: {
        email: email,
      },
    });

    if (is_email_used) {
      return res.status(400).json({
        success: false,
        message: "User email is already used!",
      });
    }

    const hasPassword = await bcrypt.hash(password, 10);

    const user = Users.create({
      name,
      email,
      password: hasPassword,
    });

    res.status(200).json({
      success: true,
      message: "Successfully register",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message || "Unexpected Error!",
    });
  }
});
// register route

// login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    const id = user?.id;
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      expires: new Date(Date.now() + 60 * 60 * 1000 * 24),
    });

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});
// login route

//logout route
router.post("/logout", authMiddleware, async (req, res) => {
  try {
    await res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    res.status(200).json({
      message : "successfully logout"
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: error,
    });
  }
});
//logout route

// profile route
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const users_id = req.user.id;

    const user = await Users.findOne({
      where: {
        id: users_id,
      },
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error,
    });
  }
});
// profile route

module.exports = router;
