const { 
  Client, 
  ContractCreateTransaction,
  FileCreateTransaction,
  PrivateKey, 
  AccountId,
  ContractFunctionParameters,
  AccountBalanceQuery
} = require("@hashgraph/sdk");
const fs = require("fs");
require('dotenv').config({ path: './.env.local' });

async function deployContracts() {
  // Check if environment variables are set
  if (!process.env.NEXT_PUBLIC_MY_ACCOUNT_ID || !process.env.NEXT_PUBLIC_MY_PRIVATE_KEY) {
    throw new Error("Environment variables NEXT_PUBLIC_MY_ACCOUNT_ID and NEXT_PUBLIC_MY_PRIVATE_KEY must be set");
  }

  // Create a client
  const operatorId = AccountId.fromString(process.env.NEXT_PUBLIC_MY_ACCOUNT_ID);
  let privateKeyString = process.env.NEXT_PUBLIC_MY_PRIVATE_KEY;
  
  console.log("Initializing Hedera client...");
  console.log("Network: ", process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet');
  console.log("Account ID: ", operatorId.toString());
  
  // Create client with specific nodes and enable node selection strategy
  const client = Client.forTestnet();
  
  // Set up specific nodes to try
  client.setMaxNodeAttempts(5); // Try up to 5 different nodes
  client.setMaxAttempts(3);     // Retry each node up to 3 times
  
  // Set request timeout to 30 seconds
  client.setRequestTimeout(30000);
  
  try {
    const operatorKey = PrivateKey.fromString(privateKeyString);
    client.setOperator(operatorId, operatorKey);
    console.log("Client initialized successfully");
    
    // Check account balance using AccountBalanceQuery
    console.log("Checking account balance...");
    const balance = await new AccountBalanceQuery()
      .setAccountId(operatorId)
      .execute(client);
    
    console.log(`Account balance: ${balance.hbars.toString()}`);
    
    if (balance.hbars.toTinybars() < 100_000_000) {
      throw new Error("Insufficient balance: You need at least 1 HBAR to deploy contracts");
    }
  } catch (error) {
    console.error("Error during client initialization:", error);
    throw new Error(`Failed to initialize Hedera client: ${error.message}`);
  }

  // Add a small delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    // Deploy the wallet contract first
    console.log("\n=== Deploying TajiriWallet Contract ===");
    
    // Check if the bytecode file exists
    const walletBytecodeFile = "../constracts/TajiriWallet.bin";
    if (!fs.existsSync(walletBytecodeFile)) {
      throw new Error(`Bytecode file not found: ${walletBytecodeFile}`);
    }
    
    const walletBytecode = fs.readFileSync(walletBytecodeFile);
    
    console.log(`Bytecode size: ${walletBytecode.length} bytes`);
    if (walletBytecode.length === 0) {
      throw new Error("Empty bytecode file");
    }
    
    let maxRetries = 3;
    let attempt = 0;
    let success = false;
    let walletContractId;
    
    while (attempt < maxRetries && !success) {
      attempt++;
      try {
        console.log(`\nAttempt ${attempt}/${maxRetries} to create file and deploy contract...`);
        
        // Step 1: Create a file with the bytecode
        console.log("Creating file on Hedera...");
        const fileCreateTx = new FileCreateTransaction()
          .setKeys([client.operatorPublicKey])
          .setContents(walletBytecode)
          .setMaxTransactionFee(100_000_000); // 1 HBAR = 100,000,000 tinybar
        
        console.log("Executing file creation transaction...");
        const fileCreateSubmit = await fileCreateTx.execute(client);
        
        console.log("File creation submitted, waiting for receipt...");
        const fileReceipt = await fileCreateSubmit.getReceipt(client);
        const bytecodeFileId = fileReceipt.fileId;
        console.log(`- The bytecode file ID is: ${bytecodeFileId}`);

        // Add delay between transactions
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Step 2: Create contract using the file
        console.log("\nCreating contract transaction...");
        const contractCreateTx = new ContractCreateTransaction()
          .setBytecodeFileId(bytecodeFileId)
          .setGas(5000000) // Increased gas further
          .setMaxTransactionFee(100_000_000) // 1 HBAR
          .setConstructorParameters(
            new ContractFunctionParameters()
              .addAddress(operatorId.toSolidityAddress())
          );
        
        console.log("Executing contract creation transaction...");
        const contractCreateSubmit = await contractCreateTx.execute(client);
        
        console.log("Contract creation submitted, waiting for receipt...");
        const contractReceipt = await contractCreateSubmit.getReceipt(client);
        walletContractId = contractReceipt.contractId;
        console.log(`TajiriWallet contract deployed with ID: ${walletContractId}`);
        
        success = true;
      } catch (err) {
        console.error(`\nAttempt ${attempt} failed with error:`, err);
        console.error("Error details:", JSON.stringify(err, null, 2));
        if (attempt < maxRetries) {
          const delay = 10000 * attempt; // Increasing backoff
          console.log(`Retrying in ${delay/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw err;
        }
      }
    }
    
    if (!success) {
      throw new Error("Failed to deploy TajiriWallet after multiple attempts");
    }

    // Now deploy the factory contract with similar retry logic
    console.log("\n=== Deploying TajiriWalletFactory Contract ===");
    
    // Check if the bytecode file exists
    const factoryBytecodeFile = "../constracts/TajiriWalletFactory.bin";
    if (!fs.existsSync(factoryBytecodeFile)) {
      throw new Error(`Factory bytecode file not found: ${factoryBytecodeFile}`);
    }
    
    const factoryBytecode = fs.readFileSync(factoryBytecodeFile);
    
    console.log(`Factory bytecode size: ${factoryBytecode.length} bytes`);
    if (factoryBytecode.length === 0) {
      throw new Error("Empty factory bytecode file");
    }
    
    maxRetries = 3;
    attempt = 0;
    success = false;
    let factoryContractId;
    
    while (attempt < maxRetries && !success) {
      attempt++;
      try {
        console.log(`\nAttempt ${attempt}/${maxRetries} to deploy factory contract...`);
        
        // Create a file with factory bytecode
        console.log("Creating factory file on Hedera...");
        const factoryFileCreateTx = new FileCreateTransaction()
          .setKeys([client.operatorPublicKey])
          .setContents(factoryBytecode)
          .setMaxTransactionFee(100_000_000);
        
        console.log("Executing factory file creation transaction...");
        const factoryFileCreateSubmit = await factoryFileCreateTx.execute(client);

        console.log("Factory file creation submitted, waiting for receipt...");
        const factoryFileReceipt = await factoryFileCreateSubmit.getReceipt(client);
        const factoryBytecodeFileId = factoryFileReceipt.fileId;
        console.log(`- The factory bytecode file ID is: ${factoryBytecodeFileId}`);

        // Add delay between transactions
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Deploy factory contract
        console.log("\nCreating factory contract transaction...");
        const factoryContractTx = new ContractCreateTransaction()
          .setBytecodeFileId(factoryBytecodeFileId)
          .setGas(5000000)
          .setMaxTransactionFee(100_000_000);
        
        console.log("Executing factory contract creation transaction...");
        const factoryContractSubmit = await factoryContractTx.execute(client);

        console.log("Factory contract creation submitted, waiting for receipt...");
        const factoryReceipt = await factoryContractSubmit.getReceipt(client);
        factoryContractId = factoryReceipt.contractId.toString();
        
        console.log(`TajiriWalletFactory contract deployed with ID: ${factoryContractId}`);
        success = true;
      } catch (err) {
        console.error(`\nFactory deployment attempt ${attempt} failed with error:`, err);
        console.error("Error details:", JSON.stringify(err, null, 2));
        if (attempt < maxRetries) {
          const delay = 10000 * attempt; // Increasing backoff
          console.log(`Retrying in ${delay/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw err;
        }
      }
    }
    
    if (!success) {
      throw new Error("Failed to deploy TajiriWalletFactory after multiple attempts");
    }

    // Save contract addresses to .env.local and a separate file
    console.log("\n=== Saving Contract Addresses ===");
    
    // Create JSON file with contract addresses
    const contractData = {
      walletContractId: walletContractId.toString(),
      factoryContractId,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(
      './contract-addresses.json',
      JSON.stringify(contractData, null, 2)
    );
    console.log("Contract addresses saved to contract-addresses.json");
    
    // Update .env.local file
    const envPath = './.env.local';
    const envContent = fs.readFileSync(envPath, 'utf8');
    const updatedEnvContent = envContent
      .replace(/^#?NEXT_PUBLIC_FACTORY_CONTRACT_ID=.*$/m, `NEXT_PUBLIC_FACTORY_CONTRACT_ID=${factoryContractId}`)
      .replace(/^#?NEXT_PUBLIC_WALLET_CONTRACT_ID=.*$/m, `NEXT_PUBLIC_WALLET_CONTRACT_ID=${walletContractId}`);
    
    fs.writeFileSync(envPath, updatedEnvContent);
    console.log("Contract addresses added to .env.local file");

    console.log("\n✅ Deployment completed successfully!");

    // Return the deployed contract IDs
    return {
      walletContractId: walletContractId.toString(),
      factoryContractId
    };

  } catch (error) {
    console.error("\n❌ Error deploying contracts:", error);
    throw error;
  }
}

// Execute the script if called directly
if (require.main === module) {
  deployContracts()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  deployContracts
}; 