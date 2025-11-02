const app = require("../app");

function registerSocket(io) {
  var onlineUsers = new Map();

  app.set("io", io);
  app.set("onlineUsers", onlineUsers);

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    socket.on("join", (credential) => {
      // keluar dari semua room lama (selain default socket.id)
      Array.from(socket.rooms)
        .filter((r) => r !== socket.id)
        .forEach((r) => socket.leave(r));

      // gabung ke room baru
      socket.join(credential);

      onlineUsers.set(credential, socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });
}

module.exports = registerSocket;
