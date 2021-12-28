/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
const Bitcoin = require('bitcoinjs-lib')
const _ = require('lodash')
const config = require('../config/config.json')
const ElectrumClient = require('../electrum-client')

const electrumCallbacks = {
  onConnect: (client, versionInfo) => { console.log(`Connected to Electrum Server at ${config.ELECTRUM.HOST}:${config.ELECTRUM.PORT} (${JSON.stringify(versionInfo)})`); },
  onClose: (client) => { console.log(`Disconnected from Electrum Server at ${config.ELECTRUM.HOST}:${config.ELECTRUM.PORT}`); },
  onError: (err) => { console.error(`Electrum error: ${JSON.stringify(err)}`); },
  onLog: (str) => { console.debug(str); },
};

const electrumConfig = { client: 'popcorn-testing', version: '1.4' };
const electrumPersistencePolicy = { retryPeriod: 10000, maxRetry: 1000, callback: null };

const electrumClient = new ElectrumClient(
  config.ELECTRUM.PORT,
  config.ELECTRUM.HOST,
  config.ELECTRUM.TLS_ENABLED ? 'tls' : 'tcp',
  {
    proxy: {
      host: "127.0.0.1",
      port: 9050,
      type: 5,
    },
  },
  electrumCallbacks
)

const initiate = () => {
  electrumClient.initElectrum(electrumConfig, electrumPersistencePolicy)
    .then(() => {})
    .catch((err) => {
      console.error(`Error connecting to Electrum Server at ${config.ELECTRUM.HOST}:${config.ELECTRUM.PORT}. Error: `, err);
    });
  electrumClient.subscribe.on('blockchain.headers.subscribe', (v) => console.log(v))
} 

const getScriptHashBalance = (scripthash) => electrumClient.blockchainScripthash_getBalance(scripthash)
const getScriptHashHistory = (scripthash) => electrumClient.blockchainScripthash_getHistory(scripthash) // TODO: cache this
const getRawTransaction = (txHash, verbosity) => electrumClient.blockchainTransaction_get(txHash, verbosity)
const getRawBlockHeader = (blockHeight) => electrumClient.blockchainBlock_getHeader(blockHeight)

const getBlockHeader = async (blockHeight) => {
  initiate()
  try {
    const height = blockHeight
    const blockHeader = await getRawBlockHeader(parseInt(height, 10))
    console.log(blockHeader)
    return blockHeader
  } catch (e) {
    console.error(e)
    return({"Error": e})
  }
}

const getAddress = async (address) => {
  initiate()
  try {
    const script = Bitcoin.address.toOutputScript(address)
    const hash = Bitcoin.crypto.sha256(script)
    const reversedHash = hash.reverse().toString('hex')

    const balance = await getScriptHashBalance(reversedHash)
    const history = await getScriptHashHistory(reversedHash)

    const unconfirmed = history.filter((h) => h.fee).length

    return {
      'address': address,
      'chain_stats': {
        'funded_txo_count': 0,
        'funded_txo_sum': balance.confirmed ? balance.confirmed : 0,
        'spent_txo_count': 0,
        'spent_txo_sum': balance.confirmed < 0 ? balance.confirmed : 0,
        'tx_count': history.length - unconfirmed,
      },
      'mempool_stats': {
        'funded_txo_count': 0,
        'funded_txo_sum': balance.unconfirmed > 0 ? balance.unconfirmed : 0,
        'spent_txo_count': 0,
        'spent_txo_sum': balance.unconfirmed < 0 ? -balance.unconfirmed : 0,
        'tx_count': unconfirmed,
      },
      'electrum': true,
    };

  } catch (e) {
    console.error(e)
    return({"Error": e})
  }
}

const getAddressTransactions = async (address, lastSeenTxId) => {
  initiate()
  try {
    // TODO: pull from Bitcoin service
    const script = Bitcoin.address.toOutputScript(address)
    const hash = Bitcoin.crypto.sha256(script)
    const reversedHash = hash.reverse().toString('hex')

    const transactions = []
    const history = await getScriptHashHistory(reversedHash)
    history.sort((a, b) => (b.height || 9999999) - (a.height || 9999999))

    let startingIndex = 0;
    if (lastSeenTxId) {
      const pos = history.findIndex((historicalTx) => historicalTx.tx_hash === lastSeenTxId);
      if (pos) {
        startingIndex = pos + 1;
      }
    }
    const endIndex = Math.min(startingIndex + 10, history.length)

    for (let i = startingIndex; i < endIndex; i += 1) {
      const tx = await getRawTransaction(history[i].tx_hash, true)
      tx.vinArray = []
      for (let j = 0; j < tx.vin.length; j += 1) {
        const vin = await getRawTransaction(tx.vin[j].txid, true) // FIXME: Batch these
        // console.log(vin.vout[tx.vin[j].vout])
        tx.vinArray.push(vin.vout[tx.vin[j].vout])
      }
      const debits = _.sum(_.map(_.filter(tx.vinArray), 'value')) * 100000000
      const credits = _.sum(_.map(_.filter(tx.vout), 'value')) * 100000000
      // console.log({credits, debits})
      tx.fee = debits - credits
      tx.blockHeight = history[i].height
      transactions.push(tx)
    }

    return transactions;

  } catch (e) {
    console.error(e)
    return({"Error": e})
  }
}

const getTransaction = async (txHash, verbosity) => {
  initiate()
  try {
    const tx = await getRawTransaction(txHash, verbosity)
    return tx
  } catch (e) {
    console.error(e)
    return({"Error": e})
  }
}

module.exports = {
  getBlockHeader,
  getAddress,
  getAddressTransactions,
  getTransaction
}