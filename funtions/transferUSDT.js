
export async function transferUSDT(account) {

  const providerURL = `https://mainnet.infura.io/v3/${process.env.YOUR_INFURA_PROJECT_ID}`;
  const web3 = new Web3(new Web3.providers.HttpProvider(providerURL));


  const TetherABI = [
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
  ];

  // Replace with the Tether contract address
  const tetherContractAddress = '0x8387661cE39d3A3Cb2f4c73bb33a9138f021cD2e';
  const tetherContract = new web3.eth.Contract(TetherABI, tetherContractAddress);

  // Replace with your private key
  const privateKey = process.env.PRIVATE_KEY;
  const fromAddress = process.env.ADMIN_ADDRESS; // Address derived from the private key
  const toAddress = account;
  const amountToSend = Web3.utils.toWei('1', 'ether'); // 1 USDT in mwei (10^6)

  try {
    const nonce = await web3.eth.getTransactionCount(fromAddress, 'latest'); // Get the nonce
    const gasPrice = await web3.eth.getGasPrice(); // Get the gas price

    const tx = {
      from: fromAddress,
      to: tetherContractAddress,
      nonce: nonce,
      gas: 2000000, // Adjust gas limit as needed
      gasPrice: gasPrice,
      data: tetherContract.methods.transfer(toAddress, amountToSend).encodeABI(),
      chainId: 1 // Mainnet chainId
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('Transaction receipt:', receipt);
    return receipt;
  } catch (error) {
    console.log(error);
  }
}
