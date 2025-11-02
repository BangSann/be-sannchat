const { DataTypes } = require("sequelize");
const pool = require("../config/db");

const Users = pool.define(
  "Users",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    avatar_url: {
      type: DataTypes.STRING(255),
      allowNull: true, // boleh kosong
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Users;
