var express = require("express");
var router = express.Router();

var userRoute = require("./users");
var authRouter = require("./authentication");
var roomRouter = require("./room");
var messageRouter = require("./messages");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express v.2" });
});

router.use("/users", userRoute);
router.use("/auth", authRouter);
router.use("/rooms", roomRouter);
router.use("/messages", messageRouter);

module.exports = router;
