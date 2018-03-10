const { TransactionProcessor } = require('sawtooth-sdk/processor');
const env = require('./env');

const WalletHandler = require('./wallet_handler');

const transactionProcessor = new TransactionProcessor(env.VALIDATOR);
transactionProcessor.addHandler(new WalletHandler());
transactionProcessor.start();
console.log("Registered")