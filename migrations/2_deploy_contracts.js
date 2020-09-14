const Tuna = artifacts.require("Tuna");
const FishySwap = artifacts.require("FishySwap");

module.exports = async function(deployer) {
	// deploy token
  await deployer.deploy(Tuna);
  const tuna = await Tuna.deployed()

  // deploy ethswap exchange
  await deployer.deploy(FishySwap, tuna.address);
  const fishyswap = await FishySwap.deployed()

  //Transfert all tokens to ethswap
  await tuna.transfer(fishyswap.address, '1000000000000000000000000')
};