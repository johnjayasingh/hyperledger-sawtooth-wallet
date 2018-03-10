const { TransactionHandler } = require('sawtooth-sdk/processor/handler');
const env = require('./env');
const { decodeCbor, setEntry, toInternalError, applySet, hash } = require('./helper');

const FAMILY = env.FAMILY;
const VERISION = env.VERISION;
const NAMESPACE = hash(env.NAMESPACE[0]).substring(0, 6);

class WalletHandler extends TransactionHandler {
    constructor() {
        super(FAMILY, VERISION, [NAMESPACE]);
    }

    apply(transactionRequest, context) {
        return decodeCbor(transactionRequest.payload)
            .catch(toInternalError)
            .then((payload) => {
                const name = payload.name;
                const value = JSON.stringify(payload.value);
                let address = NAMESPACE + hash(name).slice(-64)
                let actionFn = applySet;
                // Get the current state, for the key's address:
                let getPromise = context.getState([address])

                // Apply the action to the promise's result:
                let actionPromise = getPromise.then(
                    actionFn(context, address, name, value)
                )

                // Validate that the action promise results in the correctly set address:
                return actionPromise.then(addresses => {
                    if (addresses.length === 0) {
                        throw new InternalError('State Error!')
                    }
                    console.log(`Name: ${name} Value: ${value}`)
                })

                applySet(context, address);
            });
    }

}

module.exports = WalletHandler;