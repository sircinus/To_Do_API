const bcrypt = require("bcrypt");
const UsersModel = require("../models/users");

const passwordCheck = async (email, password) => {
  const userData = await UsersModel.findOne({ where: { email: email } });
  const compare = await bcrypt.compare(password, userData.password);

  return { compare, userData };
};

module.exports = passwordCheck;
