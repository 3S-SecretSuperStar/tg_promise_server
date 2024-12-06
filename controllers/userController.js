const { User } = require('../models/model');

// Create a new user
const createUser = async (req, res) => {
  const { name, userId, userName } = req.body;
  console.log(req.body)
  const newUser = new User({ name: name, user_id: Number(userId), user_name: userName });
  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all users
const getUser = async (req, res) => {
  try {
    const user = await User.find({ user_id: req.params.userId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const updateUser = await User.findOneAndUpdate(
      { user_id: req.params.userId },
      { $inc: { amount: req.body.amount, escrow: req.body.escrow } },
      { new: true }
    );
    if (!updateUser) return res.status(404).json({ message: 'User not found' });
    res.json(updateUser)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
};

module.exports = {
  createUser,
  getUser,
  updateUser,
}