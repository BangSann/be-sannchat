const { DataTypes } = require("sequelize");
const pool = require("../config/db");
const Rooms = require("./room");
const Users = require("./users");

const Messages = pool.define(
  "messages",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    room_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    sender_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type : {
      type : DataTypes.STRING,
      allowNull : true
    },
    create_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
  }
);

Messages.belongsTo(Rooms, { foreignKey: "room_id" });
Rooms.hasMany(Messages, { foreignKey: "room_id" });

Messages.belongsTo(Users, { foreignKey: "sender_id", as: "sender" });
Users.hasMany(Messages, { foreignKey: "sender_id" });

module.exports = Messages;
