const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.config");

class toDoList extends Model {}

toDoList.init(
  {
    email: {
      type: DataTypes.STRING,
    },
    taskTitle: {
      type: DataTypes.STRING,
    },
    taskNote: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM("0", "1"),
    },
    due_date: {
      type: DataTypes.DATEONLY,
    },
  },
  {
    sequelize,
    modelName: "toDoList",
  }
);

module.exports = toDoList;
