/* eslint-disable no-console */
const Bitcoin = require('bitcoinjs-lib')
const config = require('../config/config.json')
const ElectrumClient = require('../electrum-client')

  /* const electrumCallbacks = {
    onConnect: (client, versionInfo) => { logger.info(`Connected to Electrum Server at ${config.ELECTRUM.HOST}:${config.ELECTRUM.PORT} (${JSON.stringify(versionInfo)})`); },
    onClose: (client) => { logger.info(`Disconnected from Electrum Server at ${config.ELECTRUM.HOST}:${config.ELECTRUM.PORT}`); },
    onError: (err) => { logger.err(`Electrum error: ${JSON.stringify(err)}`); },
    onLog: (str) => { logger.debug(str); },
  }; */
  
  const electrumConfig = { client: 'mempool-v2', version: '1.4' };
  const electrumPersistencePolicy = { retryPeriod: 10000, maxRetry: 1000, callback: null };
  
  const electrumClient = new ElectrumClient(
    config.ELECTRUM.PORT,
    config.ELECTRUM.HOST,
    config.ELECTRUM.TLS_ENABLED ? 'tls' : 'tcp',
    null,
    /* electrumCallbacks */
  )
  
  /* const initiate = electrumClient.initElectrum(electrumConfig, electrumPersistencePolicy)
        .then(() => {})
        .catch((err) => {
          console.error(`Error connecting to Electrum Server at ${config.ELECTRUM.HOST}:${config.ELECTRUM.PORT}. Error: `, err);
        }); */

  const getScriptHashBalance = (scripthash) => electrumClient.blockchainScripthash_getBalance(scripthash)

  const getAddress = async (address) => {
    electrumClient.initElectrum(electrumConfig, electrumPersistencePolicy)
        .then(() => {})
        .catch((err) => {
          console.error(`Error connecting to Electrum Server at ${config.ELECTRUM.HOST}:${config.ELECTRUM.PORT}. Error: `, err);
        });
    try {
      const script = Bitcoin.address.toOutputScript(address)
      const hash = Bitcoin.crypto.sha256(script)
      const reversedHash = hash.reverse().toString('hex')

      const balance = await getScriptHashBalance(reversedHash)
      // const history = await electrumClient.getScriptHashHistory(reversedHash)

      // const unconfirmed = history.filter((h) => h.fee).length

      return {
        'address': address,
        'chain_stats': {
          'funded_txo_count': 0,
          'funded_txo_sum': balance.confirmed ? balance.confirmed : 0,
          'spent_txo_count': 0,
          'spent_txo_sum': balance.confirmed < 0 ? balance.confirmed : 0,
          // 'tx_count': history.length - unconfirmed,
        },
        'mempool_stats': {
          'funded_txo_count': 0,
          'funded_txo_sum': balance.unconfirmed > 0 ? balance.unconfirmed : 0,
          'spent_txo_count': 0,
          'spent_txo_sum': balance.unconfirmed < 0 ? -balance.unconfirmed : 0,
          // 'tx_count': unconfirmed,
        },
        'electrum': true,
      };

    } catch (e) {
      console.error(e)
      return({"Error": e})
    }
  }

module.exports = {
  getAddress,
}