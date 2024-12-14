const { Bet } = require('../models/model');

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
    const bet = await newBet.save();
    if (!bet) return res.status(404).json({ message: 'User not found' })
    return res.status(200).json(bet)
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