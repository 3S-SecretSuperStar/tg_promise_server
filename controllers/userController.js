const { validationResult } = require('express-validator');
const { User } = require('../models/model');
const { fetchUpcomingEvents } = require('./eventController');

// Create a new user
const createUser = async (req, res) => {

  const { name, userId, userName } = req.body;
  const createState = await createUserFunction(name, userId, userName);
  if (createState.error)
    res.status(400).json({ message: createState.error.message });
  else res.status(201).json(createState.value);
  console.log(req.body)

};

const createUserFunction = async (name, userId, userName) => {
  const checkState = await checkIsUnique(userId);
  if (!checkState) return ({ error: "User is existing", value: null });
  const newUser = new User({ name: name, user_id: Number(userId), user_name: userName });
  try {
    const savedUser = await newUser.save();
    return ({ error: null, value: savedUser })

  } catch (error) {
    return ({ error: error, value: null })
  }
}

// Get all users
const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.params.userId });
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
const checkIsUnique = async (userId) => {
  try {
    const checkUnique = await User.findOne({ user_id: userId })
    if (checkUnique) return false;
    else return true;
  } catch (error) {
    console.log(error)
  }
}
const initFetchData = async (req, res) => {
  try {
    const { name, userId, userName } = req.body;
    const checkState = await checkIsUnique(userId)
    let userInfo;
    if (checkState) {
      const savedUser = await createUserFunction(name, userId, userName);
      if (savedUser.error)
        res.status(400).json({ message: savedUser.error.message });
      else userInfo = savedUser.value;
    }
    else userInfo = await User.findOne({ user_id: userId });
    const data = await fetchUpcomingEvents('4387');
    if (userInfo)
      res.status(200).json({ data: data, userInfo: userInfo })
    else res.status(500).json({ message: "server error" })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const deposit = async (req, res) => {
  try {
    const error = validationResult(req)
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() })
    }

    const { amount, userObjectId } = req.body;
    const updatedData = await User.findByIdAndUpdate(userObjectId, { $inc: { amount: amount } });
    console.log('deposit', updatedData)
    res.status(200).json(updatedData);

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createUser,
  getUser,
  updateUser,
  initFetchData,
  deposit
}