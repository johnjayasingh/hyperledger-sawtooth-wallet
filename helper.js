const crypto = require('crypto')
const cbor = require('cbor')
const { InvalidTransaction, InternalError } = require('sawtooth-sdk/processor/exceptions')


const hash = (x) =>
    crypto.createHash('sha512').update(x).digest('hex').toLowerCase()

const decodeCbor = (buffer) =>
    new Promise((resolve, reject) =>
        cbor.decodeFirst(buffer, (err, obj) => (err ? reject(err) : resolve(obj)))
    )

const toInternalError = (err) => {
    let message = (err.message) ? err.message : err
    throw new InternalError(message)
}

const setEntry = (context, address, stateValue) => {
    let entries = {
        [address]: cbor.encode(stateValue)
    }
    return context.setState(entries)
}

const applySet = (context, address, name, value) => (possibleAddressValues) => {
    let stateValueRep = possibleAddressValues[address]
    console.log(stateValueRep);
    let stateValue
    if (stateValueRep && stateValueRep.length > 0) {
        stateValue = cbor.decodeFirstSync(stateValueRep)
        console.log(stateValue)
        let stateName = stateValue[name]
        if (stateName) {
            throw new InvalidTransaction(
                `Verb s "set" but Name already in state, Name: ${name} Value: ${stateName}`
            )
        }
    }

    // 'set' passes checks so store it in the state
    if (!stateValue) {
        stateValue = {}
    }

    stateValue[name] = value

    return setEntry(context, address, stateValue)
}

const updateSet = (context, address, name, value) => (possibleAddressValues) => {
    let stateValueRep = possibleAddressValues[address]
    console.log(stateValueRep);
    let stateValue
    if (stateValueRep && stateValueRep.length > 0) {
        stateValue = cbor.decodeFirstSync(stateValueRep)
        console.log(stateValue)
        let stateName = stateValue[name]
        if (stateName) {
            // 'set' passes checks so store it in the state
            if (!stateValue) {
                stateValue = {}
            }
            stateValue[name] = value

            return setEntry(context, address, stateValue)
        } else {
            throw new InvalidTransaction(
                `Verb s "set" but Name already in state, Name: ${name} Value: ${stateName}`
            )
        }
    }
}


module.exports = {
    decodeCbor,
    hash,
    toInternalError,
    setEntry,
    applySet,
    updateSet
}