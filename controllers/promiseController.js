const { Promise } = require('../models/model');

// Create a Promise
const createPromise = async (req, res) => {
  const { creatorId, description, betAmount, creatorChoice, resolutionDate } = req.body;
  console.log("promise : ",res.body)
  const newPromise = new Promise({
    creator_id: creatorId,
    description: description,
    resolution_date: resolutionDate,
    bet_amount: betAmount,
    creator_choice: creatorChoice
  })
  try {
    const savePromise = await newPromise.save();
    res.status(201).json(savePromise);
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
      { $set: { status: req.body.status, outcome: req.body.outcome }},
      {new:true}
     );
     res.json(updatePromise);
  }catch(error){
    res.status(500).json({message:error.message})
  }
}

module.exports = { createPromise, getPromise, getPromises, updatePromise }