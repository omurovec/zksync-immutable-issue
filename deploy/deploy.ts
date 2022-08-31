import { Wallet, Provider, utils } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the Token contract`);

  // Initialize the wallet.
  const provider = new Provider(hre.userConfig.zkSyncDeploy?.zkSyncNetwork);
  const wallet = new Wallet(process.env.PK as string);

  // Create deployer object and load the artifact of the contract you want to deploy.
  const deployer = new Deployer(hre, wallet);
  const tokenArtifact = await deployer.loadArtifact("Token");
  const tokenWrapperArtifact = await deployer.loadArtifact("TokenWrapper");

  // Estimate contract deployment fee
  const name = "Token";
  const symbol = "TKN";
  const decimals = "18";
  const deploymentFee = await deployer.estimateDeployFee(tokenArtifact, [
    name,
    symbol,
    decimals,
  ]);

  deploymentFee.add(
    await deployer.estimateDeployFee(tokenWrapperArtifact, [
      "0x0000000000000000000000000000000000000000",
    ])
  );
  // Deposit funds to L2
  const depositHandle = await deployer.zkWallet.deposit({
    to: deployer.zkWallet.address,
    token: utils.ETH_ADDRESS,
    amount: deploymentFee.mul(2),
  });
  // Wait until the deposit is processed on zkSync
  await depositHandle.wait();

  // Deploy this contract. The returned object will be of a `Contract` type, similarly to ones in `ethers`.
  // `greeting` is an argument for contract constructor.
  const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);

  const tokenContract = await deployer.deploy(tokenArtifact, [
    name,
    symbol,
    decimals,
  ]);

  //obtain the Constructor Arguments
  console.log(
    "constructor args:" +
      tokenContract.interface.encodeDeploy([name, symbol, decimals])
  );

  // Show the contract info.
  const contractAddress = tokenContract.address;
  console.log(
    `${tokenArtifact.contractName} was deployed to ${contractAddress}`
  );

  const tokenWrapperContract = await deployer.deploy(tokenWrapperArtifact, [
    contractAddress,
  ]);
  console.log(
    `${tokenWrapperArtifact.contractName} was deployed to ${tokenWrapperContract.address}`
  );
  // Test viewer functions
  const decimalsResult = await tokenWrapperContract.decimals();
  console.log(decimalsResult);
}
