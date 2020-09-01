const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

module.exports = async function(deployer) {
	// deploy token
  await deployer.deploy(Token);
  const token = await Token.deployed()

  // deploy ethswap exchange
  await deployer.deploy(EthSwap, token.address);
  const ethswap = await EthSwap.deployed()

  //Transfert all tokens to ethswap
  await token.transfer(ethswap.address, '1000000000000000000000000')
};