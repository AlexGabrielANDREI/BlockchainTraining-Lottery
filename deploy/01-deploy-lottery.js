const { network, ethers } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const chainId = network.config.chainId;
  let vrfCoordinatorV2Address, subscriptionId;

  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait(1);
    subscriptionId = transactionReceipt.events[0].args.subId;
    //fund the subscription.On a real network token link is required
    await vrfCoordinatorV2Mock.fundSubscription(
      subscriptionId,
      ethers.utils.parseEther("2")
    );
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinator"];
    subscriptionId = networkConfig[chainId]["subscriptionId"];
  }
  const entranceFee = networkConfig[chainId]["entranceFee"];
  const keyHash = networkConfig[chainId]["keyHash"];
  const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"];
  const interval = networkConfig[chainId]["interval"];

  const args = [
    vrfCoordinatorV2Address,
    entranceFee,
    keyHash,
    subscriptionId,
    callbackGasLimit,
    interval,
  ];
  log("----------------------------------------------------");
  log("Deploying LOTTERY SC and waiting for confirmations...");
  const lottery = await deploy("Lottery", {
    from: deployer,
    args: args, //put price feed address that is needed in the constructor
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`LOTTERY SC deployed at ${lottery.address}`);
};
module.exports.tags = ["all", "lottery"];
