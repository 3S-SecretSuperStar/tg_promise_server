const { type } = require('express/lib/response');
const mongoose = require('mongoose')

const betSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  promise_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promise',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  choice: {
    type: String,
    required: true
  },
  create_date: {
    type: Date,
    default: Date.now,
    required: true
  },
  settled: {
    type: Number,
    default: 0,
    required: true
  }
});

const promiseSchema = new mongoose.Schema({
  creator_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "",
  },
  created_date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  resolution_date: {
    type: Date,
    required: true,
  },
  outcome: {
    type: String,
    default: "",
  },
  bet_amount: {
    type: Number,
    required: true,
  },
  creator_choice: {
    type: String,
    required: true,
  },
  invited_friends: {
    type: Array,
  },
})

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  user_id: {
    type: Number,
    required: true,
    unique: true
  },
  user_name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    default: 100,
    required: true,
  },
  escrow: {
    type: Number,
    default: 0,
    required: true
  },
  firstLogin: {
    type: String,
    default: 'true',
  }
})

const Bet = mongoose.model('Bet', betSchema)
const Promise = mongoose.model('Promise', promiseSchema)
const User = mongoose.model('User', userSchema)

module.exports = { Bet, Promise, User };
