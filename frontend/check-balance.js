const { Client, AccountId, AccountBalanceQuery, PrivateKey } = require("@hashgraph/sdk");
require('dotenv').config({ path: './.env.local' });

async function checkBalance() {
  try {
    const myAccountId = process.env.NEXT_PUBLIC_MY_ACCOUNT_ID;
    const myPrivateKey = process.env.NEXT_PUBLIC_MY_PRIVATE_KEY;
    
    if (!myAccountId || !myPrivateKey) {
      console.error("Environment variables not set!");
      return;
    }
    
    console.log("Account ID:", myAccountId);
    
    // Initialize client
    const client = Client.forTestnet();
    client.setOperator(
      AccountId.fromString(myAccountId),
      PrivateKey.fromString(myPrivateKey)
    );
    
    // Query balance
    const balance = await new AccountBalanceQuery()
      .setAccountId(AccountId.fromString(myAccountId))
      .execute(client);
    
    console.log("Account Balance:", balance.hbars.toString());
    console.log("In tinybars:", balance.hbars.toTinybars().toString());
    
  } catch (error) {
    console.error("Error checking balance:", error);
  }
}

// Run the function
checkBalance(); 