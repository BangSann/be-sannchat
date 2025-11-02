const { DataTypes } = require("sequelize");
const pool = require("../config/db");
const Rooms = require("./room");
const Users = require("./users");

const Participants = pool.define(
  "participants",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    room_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
  }
);

Participants.belongsTo(Users, { foreignKey: "user_id", as: "user" });

Participants.belongsTo(Rooms, { foreignKey: "room_id" });
Rooms.hasMany(Participants, { foreignKey: "room_id" });

module.exports = Participants;
