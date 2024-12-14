const { User } = require("../models/model")
const checkUserBalance = async(userObjectId,amount) =>{
  const targetObjectId = new mongoose.Types.ObjectId(userObjectId)
  const userInfo = await User.findById(targetObjectId);
  return userInfo.amount>=amount;
}

module.exports={checkUserBalance}