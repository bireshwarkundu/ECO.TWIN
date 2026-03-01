const EcoNexus = artifacts.require("EcoNexus");

module.exports = async function (deployer, network, accounts) {
  // Deploy the contract
  await deployer.deploy(EcoNexus);
  
  // Get the deployed instance
  const econexus = await EcoNexus.deployed();
  
  console.log("=========================================");
  console.log("EcoNexus deployed successfully!");
  console.log("=========================================");
  console.log("Contract Address:", econexus.address);
  console.log("Deployer (Owner):", accounts[0]);
  console.log("Network:", network);
  console.log("Initial Cooldown Period:", (await econexus.cooldownPeriod()).toString(), "seconds");
  console.log("=========================================");
};