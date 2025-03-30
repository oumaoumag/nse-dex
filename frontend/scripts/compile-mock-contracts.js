const fs = require('fs');
const path = require('path');
const solc = require('solc');

// Make sure the mock-contracts directory exists
const mockContractsDir = path.join(__dirname, 'mock-contracts');
if (!fs.existsSync(mockContractsDir)) {
  fs.mkdirSync(mockContractsDir, { recursive: true });
}

// Compile function
function compileSolidity(source, contractName) {
  console.log(`Compiling ${contractName}...`);
  
  const input = {
    language: 'Solidity',
    sources: {
      [contractName]: {
        content: source
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      },
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    output.errors.forEach(error => {
      console.error(error.formattedMessage);
    });
    
    if (output.errors.some(error => error.severity === 'error')) {
      throw new Error('Compilation failed');
    }
  }

  const contract = output.contracts[contractName][path.basename(contractName, '.sol')];
  
  if (!contract) {
    throw new Error(`Contract ${contractName} not found in compiled output`);
  }

  return {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object
  };
}

// Compile all mock contracts
async function compileContracts() {
  try {
    // Create output directory
    const outputDir = path.join(__dirname, 'compiled-mocks');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Compile MockTajiriWallet
    const walletPath = path.join(mockContractsDir, 'MockTajiriWallet.sol');
    const walletSource = fs.readFileSync(walletPath, 'utf8');
    const walletOutput = compileSolidity(walletSource, 'MockTajiriWallet.sol');
    
    fs.writeFileSync(
      path.join(outputDir, 'MockTajiriWallet.json'),
      JSON.stringify(walletOutput, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'MockTajiriWallet.bin'),
      walletOutput.bytecode
    );
    
    console.log('MockTajiriWallet compiled successfully');
    
    // Compile MockTajiriWalletFactory
    const factoryPath = path.join(mockContractsDir, 'MockTajiriWalletFactory.sol');
    const factorySource = fs.readFileSync(factoryPath, 'utf8');
    const factoryOutput = compileSolidity(factorySource, 'MockTajiriWalletFactory.sol');
    
    fs.writeFileSync(
      path.join(outputDir, 'MockTajiriWalletFactory.json'),
      JSON.stringify(factoryOutput, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'MockTajiriWalletFactory.bin'),
      factoryOutput.bytecode
    );
    
    console.log('MockTajiriWalletFactory compiled successfully');
    
    return {
      wallet: walletOutput,
      factory: factoryOutput
    };
  } catch (error) {
    console.error('Error compiling contracts:', error);
    throw error;
  }
}

// Execute the script if called directly
if (require.main === module) {
  compileContracts()
    .then(() => {
      console.log('All mock contracts compiled successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  compileContracts
}; 