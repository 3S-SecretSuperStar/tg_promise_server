const { Bet } = require('../models/model');
const { checkUserBalance } = require('../utils');

// Create a Bet

const createBet = async (req, res) => {
  const { userObjectId, promiseObjectId, amount, choice } = req.body;
  const newBet = new Bet({
    user_id: userObjectId,
    promise_id: promiseObjectId,
    amount: amount,
    choice: choice,
  })
  try {
    const checkAmount = await checkUserBalance(creatorId, amount);
    console.log("check amoount  ", checkAmount)
    if (!checkAmount) return res.status(400).json("Invalid value!")
    const bet = await newBet.save();
    console.log("check savePromise  ", bet)
    const targetObjectId = new mongoose.Types.ObjectId(userObjectId)
    console.log("check targetObjectId  ", targetObjectId)
    const updatedAmount = await User.findByIdAndUpdate(targetObjectId, { $inc: { amount: -1 * amount, escrow: amount } });
    if (!bet) return res.status(404).json({ message: 'Bet not found' })
      res.status(200).json({ ...bet._doc, amount: updatedAmount.amount, escrow: updatedAmount.escrow });
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

// Get a bet 

const getBet = async (req, res) => {
  try {
    const bet = await Bet.findOne({ promise_id: req.params.promiseId })
    if (!bet) return res.status(404).json('Bet not found');
    return res.status(200).json(bet)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

// Get all bets

const getBets = async (req, res) => {
  try {
    const bets = await Bet.find();
    if (!bets) return res.status(404).json('Bets not found');
    return res.status(200).json(bets)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

// Update bet state

const updateBet = async (req, res) => {
  const data = req.body;
  try {
    const bets = await Bet.findOneAndUpdate(
      { promise_id: data.promiseId },
      { $set: { settled: data.settled } },
      { new: true }
    )
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

module.exports = {createBet, getBet, getBets, updateBet}