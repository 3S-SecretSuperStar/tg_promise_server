const { User } = require("../models/model")



export const checkUserBalance = async(userObjectId,amount) =>{
  const targetObjectId = new mongoose.Types.ObjectId(userObjectId)
  const userInfo = await User.findById(targetObjectId);
  return userInfo.amount>=amount;
}