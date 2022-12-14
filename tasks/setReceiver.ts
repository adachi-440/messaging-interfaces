/* eslint-disable prettier/prettier */
import { task, types } from "hardhat/config";
import DEPLOYMENTS from "../constants/deployments.json"
import CHAIN_ID from "../constants/chainIds.json"


// chainid = Destination Chain IDs defined by Router. Eg: Polygon, Fantom and BSC are assigned chain IDs 1, 2, 3.
// nchainid = Actual Destination Chain IDs
task(
  "TASK_SET_RECEIVER",
  "setTrustedRemote(chainId, sourceAddr) to enable inbound/outbound messages with your other contracts"
).addParam<string>("target", "the target network to set as a trusted remote", "", types.string)
  // .addParam<string>("nchainid", "Remote ChainID", "", types.string)
  .setAction(async (taskArgs, hre): Promise<null> => {
    console.log(hre.network.name)
    let localContractAddress = DEPLOYMENTS[hre.network.name as keyof typeof DEPLOYMENTS]
    console.log(localContractAddress)
    let remoteContractAddress = DEPLOYMENTS[taskArgs.target as keyof typeof DEPLOYMENTS]
    console.log(remoteContractAddress)
    let remoteChainId = CHAIN_ID[taskArgs.target as keyof typeof CHAIN_ID]

    let crossChainRouter = await hre.ethers.getContractAt("CrossChainRouter", localContractAddress);

    try {
      let tx = await (await crossChainRouter.setReceiver(remoteContractAddress, remoteChainId)).wait()
      console.log(`✅ [${hre.network.name}] setReceiver(${remoteContractAddress}, ${remoteChainId})`)
      console.log(` tx: ${tx.transactionHash}`)
    } catch (e: any) {
      if (e.error.message.includes("The chainId + address is already trusted")) {
        console.log("*source already set*")
      } else {
        console.log(`❌ [${hre.network.name}] setReceiver(${remoteContractAddress}, ${remoteChainId})`)
      }
    }
    return null;
  });
