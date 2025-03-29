const { 
  Client, 
  ContractCreateTransaction,
  FileCreateTransaction,
  PrivateKey, 
  AccountId,
  ContractFunctionParameters
} = require("@hashgraph/sdk");
const fs = require("fs");
const path = require("path");
require('dotenv').config({ path: './.env.local' });

async function deployMockContracts() {
  // Check if environment variables are set
  if (!process.env.NEXT_PUBLIC_MY_ACCOUNT_ID || !process.env.NEXT_PUBLIC_MY_PRIVATE_KEY) {
    throw new Error("Environment variables NEXT_PUBLIC_MY_ACCOUNT_ID and NEXT_PUBLIC_MY_PRIVATE_KEY must be set");
  }

  // Create a client
  const operatorId = AccountId.fromString(process.env.NEXT_PUBLIC_MY_ACCOUNT_ID);
  let privateKeyString = process.env.NEXT_PUBLIC_MY_PRIVATE_KEY;
  // If key doesn't start with "302e" for DER format, prepend it
  if (!privateKeyString.startsWith("302e")) {
    privateKeyString = "302e020100300506032b657004220420" + privateKeyString;
  }
  const operatorKey = PrivateKey.fromString(privateKeyString);
  
  // Create client with specific nodes and enable node selection strategy
  const client = Client.forTestnet();
  
  // Set up specific nodes to try
  client.setMaxNodeAttempts(5); // Try up to 5 different nodes
  client.setMaxAttempts(3);     // Retry each node up to 3 times
  
  client.setOperator(operatorId, operatorKey);
  console.log(`Using account: ${operatorId.toString()}`);

  try {
    // Simple check to verify connection first
    console.log("Checking connection to Hedera network...");
    const balance = await client.getAccountBalance(operatorId);
    console.log(`Account balance: ${balance.hbars.toString()}`);
    
    // The path to our compiled mocks
    const mockWalletPath = path.join(__dirname, 'compiled-mocks', 'MockTajiriWallet.bin');
    const mockFactoryPath = path.join(__dirname, 'compiled-mocks', 'MockTajiriWalletFactory.bin');

    // Verify bytecode files exist
    if (!fs.existsSync(mockWalletPath) || !fs.existsSync(mockFactoryPath)) {
      throw new Error("Compiled bytecode files not found. Run 'node scripts/compile-mock-contracts.js' first.");
    }

    // Read bytecode
    const walletBytecode = fs.readFileSync(mockWalletPath);
    const factoryBytecode = fs.readFileSync(mockFactoryPath);
    
    console.log(`Mock wallet bytecode size: ${walletBytecode.length} bytes`);
    console.log(`Mock factory bytecode size: ${factoryBytecode.length} bytes`);

    // Deploy the wallet contract
    console.log("\nDeploying MockTajiriWallet...");
    
    // Create a contract transaction - simpler approach without file creation
    const contractTransaction = new ContractCreateTransaction()
      .setBytecode(walletBytecode)
      .setGas(100000)
      .setConstructorParameters(
        new ContractFunctionParameters()
          .addAddress(operatorId.toSolidityAddress())
      );

    // Sign with the client operator private key and submit to a Hedera network
    const contractTransactionResponse = await contractTransaction.execute(client);

    // Get the receipt of the file create transaction
    const contractReceipt = await contractTransactionResponse.getReceipt(client);

    // Get the contract ID
    const contractId = contractReceipt.contractId;
    console.log(`Successfully deployed MockTajiriWallet contract with ID: ${contractId}`);

    // Deploy the factory contract
    console.log("\nDeploying MockTajiriWalletFactory...");
    
    // Create a contract transaction
    const factoryTransaction = new ContractCreateTransaction()
      .setBytecode(factoryBytecode)
      .setGas(100000);

    // Sign and submit
    const factoryTransactionResponse = await factoryTransaction.execute(client);

    // Get the receipt
    const factoryReceipt = await factoryTransactionResponse.getReceipt(client);

    // Get the contract ID
    const factoryContractId = factoryReceipt.contractId;
    console.log(`Successfully deployed MockTajiriWalletFactory contract with ID: ${factoryContractId}`);

    // Save the contract IDs
    const contractData = {
      walletContractId: contractId.toString(),
      factoryContractId: factoryContractId.toString(),
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(
      './contract-addresses.json',
      JSON.stringify(contractData, null, 2)
    );

    console.log("\nContract addresses saved to contract-addresses.json");
    console.log("Deployment completed successfully!");

    return contractData;
  } catch (error) {
    console.error("Error deploying mock contracts:", error);
    throw error;
  }
}

// Execute the script if called directly
if (require.main === module) {
  deployMockContracts()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  deployMockContracts
}; 