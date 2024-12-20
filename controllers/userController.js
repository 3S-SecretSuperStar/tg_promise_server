const { validationResult } = require('express-validator');
const { User } = require('../models/model');
const { fetchUpcomingEvents } = require('./eventController');
const {Web3 }= require('web3');
const dotenv = require('dotenv');
const { default: mongoose } = require('mongoose');
const { checkUserBalance } = require('../utils');
dotenv.config();



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
    console.log("console update :",req.params.userId.toString())
    const targetId =new  mongoose.Types.ObjectId(req.params.userId.toString())
    const updateUser = await User.findByIdAndUpdate(
      targetId ,
      { $set: { first_login: req.body.firstLogin } },
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
    const checkAmount = await checkUserBalance(userObjectId, amount);
    console.log("check amoount  ", checkAmount)
    if (!checkAmount) return res.status(400).json("Invalid value!")
    const updatedData = await User.findByIdAndUpdate(userObjectId, { $inc: { amount: amount } });
    console.log('deposit', updatedData)
    res.status(200).json({ ...updatedData, amount: updatedData.amount + amount });

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const withdrawal = async (req, res) => {
  try {
    const error = validationResult(req)
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() })
    }

    const { amount, userObjectId, accounts } = req.body;
    const checkAmount = await checkUserBalance(userObjectId, amount);
    console.log("check amoount  ", checkAmount)
    if (!checkAmount) return res.status(400).json("Invalid value!")
    const transferUSDTResult = await transferUSDT(accounts, amount);
    console.log(transferUSDTResult)
    if (!transferUSDTResult) return res.status(500).json({ message: error.message })

    const updatedData = await User.findByIdAndUpdate(userObjectId, { $inc: { amount: -1 * amount } });
    console.log('deposit', updatedData)
    res.status(200).json({ ...updatedData, amount: updatedData.amount - amount });

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const transferUSDT = async (account, amount) => {

  const providerURL = `https://mainnet.infura.io/v3/${YOUR_INFURA_PROJECT_ID}`;
  console.log("providerURL: ", providerURL);
  const web3 = new Web3(providerURL);


  const TetherABI = [
    {
      "constant": false,
      "inputs": [
        {
          "name": "_to",
          "type": "address"
        },
        {
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }    
    // {
    //   "constant": false,
    //   "inputs": [
    //     {
    //       "name": "_to",
    //       "type": "address"
    //     },
    //     {
    //       "name": "_value",
    //       "type": "uint256"
    //     }
    //   ],
    //   "name": "transfer",
    //   "outputs": [
    //     {
    //       "name": "",
    //       "type": "bool"
    //     }
    //   ],
    //   "payable": false,
    //   "stateMutability": "nonpayable",
    //   "type": "function"
    // }
  ];

  // Replace with the Tether contract address
  const tetherContractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const tetherContract = new web3.eth.Contract(TetherABI, tetherContractAddress);

  // Replace with your private key
  const privateKey = process.env.PRIVATE_KEY;
  const fromAddress = process.env.ADMIN_ADDRESS; // Address derived from the private key
  const toAddress = account;
  const amountToSend = Web3.utils.toWei(amount, 'Mwei'); // 1 USDT in mwei (10^6)

  try {
    const nonce = await web3.eth.getTransactionCount(fromAddress, 'latest'); // Get the nonce
    const gasPrice = await web3.eth.getGasPrice(); // Get the gas price
    const gasLimit = await tetherContract.methods.transfer(toAddress, amount).estimateGas({ from: fromAddress });

    const tx = {
      from: fromAddress,
      to: tetherContractAddress,
      nonce: nonce,
      gas: gasLimit, // Adjust gas limit as needed
      gasPrice: gasPrice,
      data: tetherContract.methods.transfer(toAddress, amountToSend).encodeABI(),
      chainId: 1 // sopelia chainId
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('Transaction receipt:', receipt);
    return receipt;
  } catch (error) {
    console.log(error);
  }
}


module.exports = {
  createUser,
  getUser,
  updateUser,
  initFetchData,
  deposit,
  withdrawal
}