const mongoose = require('mongoose')
const { Promise, User } = require('../models/model');
const { checkUserBalance } = require('../utils');

// Create a Promise
const createPromise = async (req, res) => {
  const { creatorId, description, betAmount, creatorChoice, resolutionDate } = req.body;
  console.log("promise : ", req.body)
  const newPromise = new Promise({
    creator_id: creatorId,
    description: description,
    resolution_date: resolutionDate,
    bet_amount: betAmount,
    creator_choice: creatorChoice,
  })
  try {
    
    const checkAmount = await checkUserBalance(creatorId,betAmount);
    console.log("check amoount  ",checkAmount)
    if(!checkAmount) return res.status(400).json("Invalid value!")
    const savePromise = await newPromise.save();
    console.log("check savePromise  ",savePromise)
    const targetObjectId = new mongoose.Types.ObjectId(creatorId)
    console.log("check targetObjectId  ",targetObjectId)
    const updatedAmount = await User.findByIdAndUpdate(targetObjectId, { $inc: { amount: -1 * betAmount, escrow: betAmount } });
    
    res.status(201).json({ ...savePromise._doc, amount: updatedAmount.amount, escrow: updatedAmount.escrow });
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getPromises = async (req, res) => {
  try {
    const promises = await Promise.find();
    if (!promises) return res.status(404).json("Promises not found")
    res.json(promises);
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getActivePromises = async (req, res) => {
  try {
    const targetObjectId = new mongoose.Types.ObjectId(req.body.userObjectId)
    const query = {
      status: { $ne: 'finished' },
      $or: [
        { invited_friends: targetObjectId },
        { creator_id: targetObjectId }
      ]
    };
    const promises = await Promise.find(query);
    if (!promises) return res.status(404).json("Promises not found")
    res.json(promises);
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getEndPromises = async (req, res) => {
  try {
    const targetObjectId = new mongoose.Types.ObjectId(req.body.userObjectId)
    const query = {
      status: 'finished',
      $or: [
        { invited_friends: targetObjectId },
        { creator_id: targetObjectId }
      ]
    };
    const promises = await Promise.find(query);
    if (!promises) return res.status(404).json("Promises not found")
    res.json(promises);
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getPromise = async (req, res) => {
  try {
    const promises = await Promise.find({ creator_id: req.params.creatorId });
    if (!promises) return res.status(404).json("Promise not found")
    res.json(promises);
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const updatePromise = async (req, res) => {
  try {
    const updatePromise = await Promise.findOneAndUpdate(
      { creator_id: req.pareams.creatorId },
      { $set: { status: req.body.status, outcome: req.body.outcome } },
      { new: true }
    );
    res.json(updatePromise);
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createPromise, getPromise, getPromises, updatePromise,
  getActivePromises, getEndPromises
}