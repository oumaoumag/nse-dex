const { Client, ContractCreateTransactions, FileCreateTransaction, FileAppendTransaction, ContractFunctionParameters } = require("@hashgraph/sdk");
const fs = require("fs");

async function deployContract() {
    const client = Client.forTestnet();
    client.setOperator("0.0.5774882", "0x2a5572ca80cc8c9fbf8aa320279d31c3b9d6cf4e9e12bcd30c61cfa9444ad4e7")

    const bytecode =fs.readFileSync("./TajiriWallet.bin")

    // creation of file on Hedera to store the bytecode
    const fileCreateTx = new FileCreateTransaction()
    .setContents(bytecode.slice(0, 4096))
    .setKeys([client.operatorPublicKey]);
    const FileCreateReciept = await (await fileCreateTx.execute(client)).getReceipt(client);
    const fileID = FileCreateReciept.fileId;

    // Append remaining bytecode if it exceeds 4096bytes
    if (bytecode.length > 4096) {
        const fileAppendTx = new FileAppendTransaction()
            .setFileId(fileId)
            .setContents(bytecode.slice(4096));
        await fileAppendTx.execute(client);
    }

    // Deploy the contract
    const contractCreateTx = new ContractCreateTransaction()
        .setBytecodeFileId(fileId)
        .setGas(100000)
        .setConstructorParameters(new ContractFunctionParameters().addAddress("owner-address")); // Replace with the owner's address
    const contractCreateReceipt = await (await contractCreateTx.execute(client)).getReceipt(client);
    const contractId = contractCreateReceipt.contractId;

    console.log("Contract deployed at:", contractId.toString());
}

deployContract().catch(console.error);