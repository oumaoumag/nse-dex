const { 
  Client, 
  ContractCreateTransaction,
  FileCreateTransaction,
  PrivateKey, 
  AccountId,
  ContractFunctionParameters,
  AccountBalanceQuery,
  FileAppendTransaction
} = require("@hashgraph/sdk");

const fs = require("fs");
require('dotenv').config({ path: './.env.local' });

const contractsToDeploy = [
  { name: "TajiriWallet", file: "../contracts/TajiriWallet.bin", constructor: true, params: ["address"] },
  { name: "TajiriWalletFactory", file: "../contracts/TajiriWalletFactory.bin", constructor: true, params: [] },
  { name: "ManageStock", file: "../contracts/manageStock.bin", constructor: true, params: ["address"] },
  { name: "MintStock", file: "../contracts/mintStock.bin", constructor: true, params: ["address"] },
  { name: "RedeemStock", file: "../contracts/redeemStock.bin", constructor: true, params: ["address"] },
  { name: "PostOfferOnP2P", file: "../contracts/postOfferOnP2P.bin", constructor: true, params: ["address"] },
  { name: "DoP2PTrade", file: "../contracts/doP2PTrade.bin", constructor: true, params: ["address"] },
  { name: "SafaricomStock", file: "../contracts/safaricomStock.bin", constructor: false, params: [] }
];

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
    const deployedContracts = {};

    for (const contract of contractsToDeploy) {
      console.log(`\n=== Deploying ${contract.name} Contract ===`);

    // Check if the bytecode file exists
      if (!fs.existsSync(contract.file)) {
        throw new Error(`Bytecode file not found: ${contract.file}`);
      }

      const bytecode = fs.readFileSync(contract.file);
      console.log(`Bytecode size: ${bytecode.length} bytes`);

      if (bytecode.length === 0) {
        throw new Error(`Empty bytecode file for ${contract.name}`);
      }

      let maxRetries = 3;
      let attempt = 0;
      let success = false;
      let contractId;

      while (attempt < maxRetries && !success) {
        attempt++;
        try {
          console.log(`\nAttempt ${attempt}/${maxRetries} to create file and deploy contract...`);

          // Step 1: Create a file with the bytecode using the chunking helper
          console.log("Creating bytecode file...");
          const bytecodeFileId = await createFileWithChunks(client, bytecode, contract.name);
          console.log(`- The bytecode file ID is: ${bytecodeFileId}`);

          // Add delay between transactions
          console.log("Waiting 10 seconds before contract creation...");
          await new Promise(resolve => setTimeout(resolve, 10000));

          // Step 2: Create contract using the file
          console.log("\nCreating contract transaction...");
          const contractCreateTx = new ContractCreateTransaction()
            .setBytecodeFileId(bytecodeFileId)
            .setGas(8000000)
            .setMaxTransactionFee(200_000_000);

          if (contract.constructor) {
            const params = new ContractFunctionParameters();

            // Add parameters based on the contract requirements
            if (contract.params.includes("address")) {
              params.addAddress(operatorId.toSolidityAddress());
              contractCreateTx.setConstructorParameters(params);
            }
          }

          console.log("Executing contract creation transaction...");
          const contractCreateSubmit = await contractCreateTx.execute(client);

          console.log("Contract creation submitted, waiting for receipt...");
          const contractReceipt = await contractCreateSubmit.getReceipt(client);
          contractId = contractReceipt.contractId;
          console.log(`${contract.name} contract deployed with ID: ${contractId}`);

          deployedContracts[contract.name] = contractId.toString();
          success = true;
        } catch (err) {
          console.error(`\nAttempt ${attempt} failed with error:`, err);
          console.error("Error details:", JSON.stringify({
            name: err.name,
            message: err.message,
            code: err.code || 'N/A',
            details: err.details || 'N/A',
            status: err.status || 'N/A'
          }, null, 2));

          if (attempt < maxRetries) {
            const delay = 20000 * attempt; // Increased backoff (20 seconds * attempt number)
            console.log(`Retrying in ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw err;
          }
        }
      }

      if (!success) {
        throw new Error(`Failed to deploy ${contract.name} after multiple attempts`);
      }
    }

    // Save contract addresses to .env.local and a separate file
    console.log("\n=== Saving Contract Addresses ===");
    
    // Create JSON file with contract addresses
    const contractData = {
      ...deployedContracts,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync('./contract-addresses.json', JSON.stringify(contractData, null, 2));
    console.log("Contract addresses saved to contract-addresses.json");
    
    // Update .env.local file
    const envPath = './.env.local';
    const envContent = fs.readFileSync(envPath, 'utf8');

    // Create a mapping of contract names to environment variable names
    const contractEnvMapping = {
      'TajiriWallet': 'NEXT_PUBLIC_WALLET_CONTRACT_ID',
      'TajiriWalletFactory': 'NEXT_PUBLIC_FACTORY_CONTRACT_ID',
      'ManageStock': 'NEXT_PUBLIC_MANAGE_STOCK_CONTRACT_ID',
      'MintStock': 'NEXT_PUBLIC_MINT_STOCK_CONTRACT_ID',
      'RedeemStock': 'NEXT_PUBLIC_REDEEM_STOCK_CONTRACT_ID',
      'PostOfferOnP2P': 'NEXT_PUBLIC_P2P_OFFERS_CONTRACT_ID',
      'DoP2PTrade': 'NEXT_PUBLIC_P2P_TRADE_CONTRACT_ID',
      'SafaricomStock': 'NEXT_PUBLIC_SAFARICOM_STOCK_CONTRACT_ID'
    };

    let updatedEnvContent = envContent;
    
    // Update each environment variable
    for (const [contractName, envVarName] of Object.entries(contractEnvMapping)) {
      if (deployedContracts[contractName]) {
        updatedEnvContent = updatedEnvContent.replace(
          new RegExp(`^#?${envVarName}=.*$`, 'm'),
          `${envVarName}=${deployedContracts[contractName]}`
        );
      }
    }

    fs.writeFileSync(envPath, updatedEnvContent);
    console.log("Contract addresses added to .env.local file");

    console.log("\n✅ Deployment completed successfully!");

    // Return the deployed contract IDs
    return deployedContracts;

  } catch (error) {
    console.error("\n❌ Error deploying contracts:", error);
    throw error;
  }
}

// Helper function to split large bytecode into smaller chunks
async function createFileWithChunks(client, bytecode, description = "file") {
  // If bytecode is large, use chunking approach
  const MAX_CHUNK_SIZE = 6000; // Conservative size for chunks

  if (bytecode.length <= MAX_CHUNK_SIZE) {
    // Small enough to fit in one transaction
    console.log(`Creating ${description} on Hedera (single transaction)...`);
    const fileCreateTx = new FileCreateTransaction()
      .setKeys([client.operatorPublicKey])
      .setContents(bytecode)
      .setMaxTransactionFee(200_000_000); // 2 HBAR

    console.log(`Executing ${description} creation transaction...`);
    const fileSubmit = await fileCreateTx.execute(client);

    console.log(`${description} creation submitted, waiting for receipt...`);
    const fileReceipt = await fileSubmit.getReceipt(client, 30);
    return fileReceipt.fileId;
  } else {
    // Large file needs chunking - create empty file first then append
    console.log(`Creating empty ${description} for chunking...`);
    const fileCreateTx = new FileCreateTransaction()
      .setKeys([client.operatorPublicKey])
      .setContents("")
      .setMaxTransactionFee(200_000_000); // 2 HBAR

    const fileSubmit = await fileCreateTx.execute(client);
    const fileReceipt = await fileSubmit.getReceipt(client, 30);
    const fileId = fileReceipt.fileId;
    console.log(`- The empty ${description} ID is: ${fileId}`);

    // Now append bytecode in chunks
    const totalChunks = Math.ceil(bytecode.length / MAX_CHUNK_SIZE);
    console.log(`Appending bytecode in ${totalChunks} chunks...`);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * MAX_CHUNK_SIZE;
      const end = Math.min((i + 1) * MAX_CHUNK_SIZE, bytecode.length);
      const chunk = bytecode.slice(start, end);

      console.log(`Appending chunk ${i + 1}/${totalChunks} (${chunk.length} bytes)...`);

      const appendTx = new FileAppendTransaction()
        .setFileId(fileId)
        .setContents(chunk)
        .setMaxTransactionFee(200_000_000); // 2 HBAR

      const appendSubmit = await appendTx.execute(client);
      await appendSubmit.getReceipt(client, 30);
      console.log(`Chunk ${i + 1} appended successfully`);

      // Add a small delay between chunks
      if (i < totalChunks - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`${description} created and populated with all chunks successfully`);
    return fileId;
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