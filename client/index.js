const { EnclaveFactory } = require('./enclave')
const env = require('./env')
const input = require('./input')
const { SawtoothClientFactory } = require('./sawtooth-client')

const enclave = EnclaveFactory(Buffer.from(env.privateKey, 'hex'))

const walletClient = SawtoothClientFactory({
  enclave: enclave,
  restApiUrl: env.restApiUrl
})

const walletTransactor = walletClient.newTransactor({
  familyName: "wallet",
  familyVersion: "1.0"
})
input.submitPayload({
  "name": "johndo",
  "value": 10000
}, walletTransactor).then((ewa) => {
  console.log(ewa)
})
