const { 
  Client, 
  AccountBalanceQuery,
  AccountId, 
  PrivateKey
} = require("@hashgraph/sdk");
require('dotenv').config({ path: './.env.local' });

async function testConnection() {
  console.log("Testing connection to Hedera network...");
  
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
  
  // Create client with specific nodes and test connectivity
  const client = Client.forTestnet();
  client.setMaxNodeAttempts(5);
  client.setMaxAttempts(3);
  client.setOperator(operatorId, operatorKey);
  
  console.log(`Using account: ${operatorId.toString()}`);

  try {
    // Simple query to test connectivity
    console.log("Checking account balance...");
    const balance = await new AccountBalanceQuery()
      .setAccountId(operatorId)
      .execute(client);
    
    console.log(`Account balance: ${balance.hbars.toString()}`);
    console.log("✅ Connection to Hedera network successful!");
    
    return true;
  } catch (error) {
    console.error("❌ Connection test failed:", error);
    return false;
  }
}

// Execute the script if called directly
if (require.main === module) {
  testConnection()
    .then(success => {
      if (success) {
        console.log("Connection test passed!");
        process.exit(0);
      } else {
        console.error("Connection test failed!");
        process.exit(1);
      }
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  testConnection
}; 