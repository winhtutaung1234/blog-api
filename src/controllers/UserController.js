const User = require("../models/User");

const UserController = {
  find: async (req, res) => {
    const users = await User.find();
    return res.json(users);
  },
};

module.exports = UserController;
