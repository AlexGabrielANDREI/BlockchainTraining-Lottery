const { assert } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Lottery Unit Tests", async function () {
      let lotteryContract, vrfCoordinatorV2Mock;
      const chainId = network.config.chainId;
      beforeEach(async () => {
        const { deployer } = await getNamedAccounts();
        await deployments.fixture(["all"]);
        lotteryContract = await ethers.getContract("Lottery", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
      });

      describe("constructor", async function () {
        it("initializes the lottery correctly", async function () {
          // Ideally, we'd separate these out so that only 1 assert per "it" block
          // And ideally, we'd make this check everything
          const lotteryState = await lotteryContract.getLotteryState();
          const interval = await lotteryContract.getInterval();
          // Comparisons for lottery initialization:
          assert.equal(lotteryState.toString(), "0");
          assert.equal(interval.toString(), networkConfig[chainId]["interval"]);
        });
      });
    });
